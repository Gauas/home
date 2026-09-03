import * as THREE from "three";
import { SCENE_STATES, getStatePair } from "./SceneStates";

const SPACE = new THREE.Color("#02040a");
const BLUE = new THREE.Color("#315dff");
const LIGHT_BLUE = new THREE.Color("#86a9ff");
const FORWARD = new THREE.Vector3(0, 0, -1);
const UP = new THREE.Vector3(0, 1, 0);
const TMP_POSITION = new THREE.Vector3();
const TMP_TARGET = new THREE.Vector3();
const TMP_DIRECTION = new THREE.Vector3();
const TMP_NORMAL = new THREE.Vector3();
const TMP_QUATERNION = new THREE.Quaternion();
const TMP_BANK_QUATERNION = new THREE.Quaternion();
const TMP_OBJECT = new THREE.Object3D();
const TMP_OFFSET = new THREE.Vector3();

const clamp01 = (value) => THREE.MathUtils.clamp(value, 0, 1);
const range = (value, from, to) => clamp01((value - from) / Math.max(0.0001, to - from));

function setGroupOpacity(group, opacity) {
  const activity = clamp01(opacity);
  const easedActivity = activity * activity * (3 - 2 * activity);

  if (!group.userData.fadeMaterials) {
    const clones = new Map();
    group.traverse((object) => {
      if (!object.material || object.userData.noFade) return;
      const sourceMaterials = Array.isArray(object.material) ? object.material : [object.material];
      const fadeMaterials = sourceMaterials.map((source) => {
        if (!clones.has(source)) {
          const material = source.clone();
          const opacityUniform = material.userData?.opacityUniform;
          material.userData.fadeBaseOpacity = opacityUniform
            ? material.uniforms[opacityUniform].value
            : material.opacity;
          material.userData.fadeBaseTransparent = material.transparent;
          material.userData.fadeBaseDepthWrite = material.depthWrite;
          clones.set(source, material);
        }
        return clones.get(source);
      });
      object.material = Array.isArray(object.material) ? fadeMaterials : fadeMaterials[0];
    });

    // Hover animations retain material references in userData. Point those at the
    // destination-local clones as well so one planet can fade independently.
    group.traverse((object) => {
      Object.entries(object.userData).forEach(([key, value]) => {
        if (clones.has(value)) object.userData[key] = clones.get(value);
      });
    });
    group.userData.fadeMaterials = [...clones.values()];
  }

  group.userData.fadeMaterials.forEach((material) => {
    const baseOpacity = material.userData.fadeBaseOpacity;
    const opacityUniform = material.userData.opacityUniform;
    if (opacityUniform) material.uniforms[opacityUniform].value = baseOpacity * easedActivity;
    else material.opacity = baseOpacity * easedActivity;
    material.transparent = material.userData.fadeBaseTransparent || easedActivity < 0.999;
    material.depthWrite = material.userData.fadeBaseDepthWrite && easedActivity > 0.985;
  });
  group.visible = easedActivity > 0.002;
  group.userData.activity = easedActivity;
}

function noiseHash(x, y, seed) {
  let value = Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul((seed * 1000) | 0, 1442695041);
  value = Math.imul(value ^ (value >>> 13), 1274126177);
  return ((value ^ (value >>> 16)) >>> 0) / 4294967295;
}

function valueNoise(x, y, seed) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const tx = x - xi;
  const ty = y - yi;
  const sx = tx * tx * (3 - 2 * tx);
  const sy = ty * ty * (3 - 2 * ty);
  const a = noiseHash(xi, yi, seed);
  const b = noiseHash(xi + 1, yi, seed);
  const c = noiseHash(xi, yi + 1, seed);
  const d = noiseHash(xi + 1, yi + 1, seed);
  return THREE.MathUtils.lerp(THREE.MathUtils.lerp(a, b, sx), THREE.MathUtils.lerp(c, d, sx), sy);
}

function fbm(x, y, seed) {
  let value = 0;
  let amplitude = 0.56;
  let frequency = 1;
  for (let octave = 0; octave < 4; octave += 1) {
    value += valueNoise(x * frequency, y * frequency, seed + octave * 3.7) * amplitude;
    frequency *= 2.05;
    amplitude *= 0.48;
  }
  return value;
}

const PLANET_SEEDS = Object.freeze({ earth: 2.1, mars: 7.4, engineering: 12.6, mineral: 19.2 });

// Each destination is still part of the same habitable family, but these terrain
// profiles keep their silhouettes from reading as four recoloured copies.
const PLANET_PROFILES = Object.freeze({
  earth: { scaleX: 4.1, scaleY: 4.4, detailScale: 15.5, wave: 0.052, high: 0.685, coast: 0.635, shelf: 0.585, iceLine: 0.86 },
  mars: { scaleX: 7.8, scaleY: 6.7, detailScale: 22, wave: 0.026, high: 0.73, coast: 0.675, shelf: 0.62, iceLine: 0.97 },
  engineering: { scaleX: 4.8, scaleY: 4.5, detailScale: 18, wave: 0.062, high: 0.67, coast: 0.62, shelf: 0.57, iceLine: 0.9 },
  mineral: { scaleX: 3.45, scaleY: 5.6, detailScale: 13.5, wave: 0.078, high: 0.66, coast: 0.61, shelf: 0.56, iceLine: 0.94 },
});

const PLANET_PALETTES = Object.freeze({
  earth: {
    ice: [225, 238, 240], snow: [197, 216, 204], highland: [80, 105, 59],
    land: [31, 112, 69], dry: [137, 139, 77], beach: [213, 190, 128],
    shelf: [32, 139, 166], ocean: [13, 82, 137], deepOcean: [5, 37, 82],
  },
  mars: {
    ice: [236, 239, 224], snow: [222, 224, 199], highland: [91, 128, 64],
    land: [48, 139, 75], dry: [192, 116, 63], beach: [239, 190, 108],
    shelf: [41, 174, 175], ocean: [13, 117, 153], deepOcean: [5, 61, 111],
  },
  engineering: {
    ice: [177, 215, 211], snow: [139, 186, 178], highland: [36, 92, 79],
    land: [21, 78, 70], dry: [70, 98, 77], beach: [111, 142, 112],
    shelf: [20, 106, 115], ocean: [7, 61, 78], deepOcean: [2, 28, 47],
  },
  mineral: {
    ice: [245, 239, 210], snow: [226, 217, 174], highland: [137, 113, 48],
    land: [103, 130, 55], dry: [190, 145, 53], beach: [232, 190, 91],
    shelf: [65, 139, 137], ocean: [25, 92, 116], deepOcean: [10, 51, 81],
  },
});

function continentalValue(u, v, kind) {
  const profile = PLANET_PROFILES[kind];
  const latitude = Math.abs(v - 0.5) * 2;
  const broad = fbm(u * profile.scaleX, v * profile.scaleY, PLANET_SEEDS[kind]);
  const islandDetail = kind === "mars" ? fbm(u * 15.4, v * 12.8, PLANET_SEEDS[kind] + 9.7) : broad;
  const terrain = kind === "mars" ? broad * 0.72 + islandDetail * 0.28 : broad;
  return terrain + Math.sin(u * Math.PI * (kind === "mineral" ? 10 : 6) + v * 4.2) * profile.wave - latitude * (kind === "earth" ? 0.03 : 0.018);
}

function createFeatureDirections(kind, count, phase = 0, options = {}) {
  const profile = PLANET_PROFILES[kind];
  const focus = (options.focus || new THREE.Vector3(0, 0.18, 1)).clone().normalize();
  const minTerrain = options.minTerrain ?? profile.coast;
  const maxTerrain = options.maxTerrain ?? 2;
  const minFacing = options.minFacing ?? 0.08;
  const spacing = options.spacing ?? 0.18;
  const candidates = [];

  for (let index = 0; index < 5200; index += 1) {
    const y = 1 - 2 * ((index + 0.5) / 5200);
    const angle = index * 2.399963 + phase;
    const radial = Math.sqrt(Math.max(0, 1 - y * y));
    const direction = new THREE.Vector3(Math.cos(angle) * radial, y, Math.sin(angle) * radial);
    const u = ((Math.atan2(direction.z, -direction.x) / (Math.PI * 2)) % 1 + 1) % 1;
    const v = Math.acos(THREE.MathUtils.clamp(direction.y, -1, 1)) / Math.PI;
    const terrain = continentalValue(u, v, kind);
    const facing = direction.dot(focus);
    if (terrain < minTerrain || terrain > maxTerrain || facing < minFacing) continue;
    const scatter = noiseHash(index, Math.floor(phase * 1000), PLANET_SEEDS[kind] + phase) * 0.18;
    candidates.push({ direction, score: facing + scatter });
  }

  candidates.sort((a, b) => b.score - a.score);
  const directions = [];
  const spacingCos = Math.cos(spacing);
  for (const candidate of candidates) {
    if (directions.every((direction) => direction.dot(candidate.direction) < spacingCos)) directions.push(candidate.direction);
    if (directions.length >= count) break;
  }
  // Tiny screens use fewer props, but always return the requested number when
  // terrain permits so a sparse biome does not silently lose its landmarks.
  if (directions.length < count) {
    for (const candidate of candidates) {
      if (!directions.includes(candidate.direction)) directions.push(candidate.direction);
      if (directions.length >= count) break;
    }
  }
  return directions;
}

function createPlanetTexture(kind, width = 768) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = Math.floor(width / 2);
  const context = canvas.getContext("2d", { alpha: false });
  const image = context.createImageData(canvas.width, canvas.height);
  const heightCanvas = document.createElement("canvas");
  heightCanvas.width = canvas.width;
  heightCanvas.height = canvas.height;
  const heightContext = heightCanvas.getContext("2d", { alpha: false });
  const heightImage = heightContext.createImageData(canvas.width, canvas.height);
  const seed = PLANET_SEEDS[kind];
  const palette = PLANET_PALETTES[kind];
  const profile = PLANET_PROFILES[kind];

  for (let y = 0; y < canvas.height; y += 1) {
    const v = y / canvas.height;
    const latitude = Math.abs(v - 0.5) * 2;
    for (let x = 0; x < canvas.width; x += 1) {
      const u = x / canvas.width;
      const detail = fbm(u * profile.detailScale, v * profile.detailScale, seed + 5.3);
      const continental = continentalValue(u, v, kind);
      const index = (y * canvas.width + x) * 4;
      let color;
      let elevation;
      const iceLine = profile.iceLine + (detail - 0.5) * 0.1;
      if (latitude > iceLine) color = detail > 0.54 ? palette.ice : palette.snow;
      else if (continental > profile.high + 0.045 && detail > 0.72 && kind !== "mars") color = palette.snow;
      else if (continental > profile.high) color = detail > 0.6 ? palette.highland : palette.land;
      else if (continental > profile.coast) color = detail > 0.58 ? palette.dry : palette.beach;
      else if (continental > profile.shelf) color = palette.shelf;
      else color = detail > 0.62 ? palette.ocean : palette.deepOcean;
      if (continental > profile.high) elevation = 145 + detail * 88;
      else if (continental > profile.coast) elevation = 104 + ((continental - profile.coast) / Math.max(0.001, profile.high - profile.coast)) * 34;
      else if (continental > profile.shelf) elevation = 48 + ((continental - profile.shelf) / Math.max(0.001, profile.coast - profile.shelf)) * 38;
      else elevation = 28 + detail * 13;
      if (kind === "mineral" && continental > profile.coast) elevation = Math.round(elevation / 18) * 18;
      image.data[index] = color[0];
      image.data[index + 1] = color[1];
      image.data[index + 2] = color[2];
      image.data[index + 3] = 255;
      heightImage.data[index] = elevation;
      heightImage.data[index + 1] = elevation;
      heightImage.data[index + 2] = elevation;
      heightImage.data[index + 3] = 255;
    }
  }
  context.putImageData(image, 0, 0);
  heightContext.putImageData(heightImage, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  const heightTexture = new THREE.CanvasTexture(heightCanvas);
  heightTexture.wrapS = THREE.RepeatWrapping;
  return { map: texture, height: heightTexture };
}

function createCloudTexture(width = 512, seed = 31.4) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = width / 2;
  const context = canvas.getContext("2d");
  const image = context.createImageData(canvas.width, canvas.height);
  for (let y = 0; y < canvas.height; y += 1) {
    const v = y / canvas.height;
    for (let x = 0; x < canvas.width; x += 1) {
      const u = x / canvas.width;
      const broadCloud = fbm(u * 8.4, v * 5.2, seed);
      const cloudDetail = fbm(u * 18.5, v * 10.5, seed + 8.2);
      const weatherBand = Math.sin(v * Math.PI * 9 + broadCloud * 5.5) * 0.035;
      const cloud = broadCloud * 0.76 + cloudDetail * 0.24 + weatherBand;
      const density = clamp01((cloud - 0.54) * 3.6);
      const alpha = Math.round(Math.pow(density, 1.22) * 205);
      const index = (y * canvas.width + x) * 4;
      image.data[index] = 242;
      image.data[index + 1] = 247;
      image.data[index + 2] = 250;
      image.data[index + 3] = alpha;
    }
  }
  context.putImageData(image, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  return texture;
}

function createAtmosphereMaterial(color, opacity) {
  const material = new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color(color) },
      uOpacity: { value: opacity },
    },
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vViewDirection;
      void main() {
        vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
        vNormal = normalize(normalMatrix * normal);
        vViewDirection = normalize(-viewPosition.xyz);
        gl_Position = projectionMatrix * viewPosition;
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      uniform float uOpacity;
      varying vec3 vNormal;
      varying vec3 vViewDirection;
      void main() {
        float rim = pow(1.0 - max(dot(vNormal, vViewDirection), 0.0), 2.35);
        float haze = 0.08 + rim * 1.2;
        gl_FragColor = vec4(uColor, uOpacity * haze);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    toneMapped: false,
  });
  material.userData.opacityUniform = "uOpacity";
  return material;
}

function lineBetween(a, b, material, radius = 0.025) {
  const direction = TMP_DIRECTION.subVectors(b, a);
  const length = direction.length();
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, length, 6), material);
  mesh.position.lerpVectors(a, b, 0.5);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
  return mesh;
}

function addStroke(group, points, material, radius = 0.055) {
  for (let index = 0; index < points.length - 1; index += 1) {
    group.add(lineBetween(points[index], points[index + 1], material, radius));
  }
}

function createProcessIcon(type, material, signalMaterial) {
  const icon = new THREE.Group();
  const point = (x, y) => new THREE.Vector3(x, y, 0);
  if (type === "discover") {
    icon.add(new THREE.Mesh(new THREE.TorusGeometry(0.64, 0.055, 8, 56), material));
    addStroke(icon, [point(-0.42, 0), point(0.42, 0)], material);
    addStroke(icon, [point(0, -0.42), point(0, 0.42)], material);
    addStroke(icon, [point(0, 0), point(0.34, 0.4)], signalMaterial, 0.075);
  } else if (type === "define") {
    addStroke(icon, [point(-0.52, -0.7), point(-0.52, 0.7), point(0.32, 0.7), point(0.58, 0.42), point(0.58, -0.7), point(-0.52, -0.7)], material);
    addStroke(icon, [point(-0.27, 0.24), point(0.27, 0.24)], signalMaterial, 0.045);
    addStroke(icon, [point(-0.27, -0.02), point(0.34, -0.02)], signalMaterial, 0.045);
    addStroke(icon, [point(-0.27, -0.28), point(0.18, -0.28)], signalMaterial, 0.045);
  } else if (type === "design") {
    const curve = new THREE.CatmullRomCurve3([point(-0.62, -0.42), point(-0.24, 0.38), point(0.26, -0.2), point(0.62, 0.48)]);
    icon.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 30, 0.052, 7, false), material));
    [point(-0.62, -0.42), point(-0.24, 0.38), point(0.26, -0.2), point(0.62, 0.48)].forEach((position) => {
      const node = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 12), signalMaterial);
      node.position.copy(position);
      icon.add(node);
    });
  } else if (type === "develop") {
    addStroke(icon, [point(-0.12, 0.62), point(-0.66, 0), point(-0.12, -0.62)], material, 0.075);
    addStroke(icon, [point(0.12, 0.62), point(0.66, 0), point(0.12, -0.62)], material, 0.075);
    addStroke(icon, [point(0.22, 0.72), point(-0.22, -0.72)], signalMaterial, 0.06);
  } else {
    addStroke(icon, [point(0, 0.78), point(-0.34, 0.22), point(-0.28, -0.42), point(0, -0.62), point(0.28, -0.42), point(0.34, 0.22), point(0, 0.78)], material);
    addStroke(icon, [point(-0.29, -0.2), point(-0.58, -0.5), point(-0.27, -0.46)], material);
    addStroke(icon, [point(0.29, -0.2), point(0.58, -0.5), point(0.27, -0.46)], material);
    addStroke(icon, [point(0, -0.56), point(0, -0.93)], signalMaterial, 0.075);
  }
  const core = new THREE.Mesh(new THREE.SphereGeometry(0.075, 10, 10), signalMaterial);
  core.position.y = type === "launch" ? -0.92 : 0;
  icon.add(core);
  icon.userData.material = material;
  icon.userData.light = signalMaterial;
  return icon;
}

function makePlanet(radius, color, segments, options = {}) {
  const group = new THREE.Group();
  const textures = options.texture ? createPlanetTexture(options.texture, options.textureSize) : null;
  const surface = new THREE.Mesh(
    new THREE.SphereGeometry(radius, segments, Math.max(16, Math.floor(segments * 0.66))),
    new THREE.MeshStandardMaterial({
      color: textures ? 0xffffff : color,
      map: textures?.map ?? null,
      bumpMap: textures?.height ?? null,
      bumpScale: options.bumpScale ?? 0.055,
      metalness: options.metalness ?? 0.04,
      roughness: options.roughness ?? 0.82,
    }),
  );
  group.add(surface);
  const gridOpacity = options.gridOpacity ?? 0;
  let grid = null;
  if (gridOpacity > 0.001) {
    grid = new THREE.Mesh(
      new THREE.SphereGeometry(radius * 1.012, Math.max(16, Math.floor(segments * 0.55)), 14),
      new THREE.MeshBasicMaterial({ color: options.grid ?? 0x496fd8, wireframe: true, transparent: true, opacity: gridOpacity, depthWrite: false }),
    );
    group.add(grid);
  }
  const atmosphere = new THREE.Mesh(
    new THREE.SphereGeometry(radius * 1.065, segments, Math.max(16, Math.floor(segments * 0.66))),
    createAtmosphereMaterial(options.atmosphere ?? 0x6abaff, options.atmosphereOpacity ?? 0.11),
  );
  group.add(atmosphere);
  if (options.clouds) {
    const cloudTexture = createCloudTexture(
      options.cloudTextureSize ?? Math.min(384, options.textureSize || 384),
      options.cloudSeed ?? PLANET_SEEDS[options.texture] + 29.3,
    );
    const clouds = new THREE.Mesh(
      new THREE.SphereGeometry(radius * 1.022, segments, Math.max(16, Math.floor(segments * 0.66))),
      new THREE.MeshStandardMaterial({
        map: cloudTexture,
        color: options.cloudColor ?? 0xffffff,
        transparent: true,
        opacity: options.cloudOpacity ?? 0.72,
        depthWrite: false,
        roughness: 1,
        metalness: 0,
      }),
    );
    group.add(clouds);
    group.userData.clouds = clouds;
  }
  group.userData.surface = surface;
  group.userData.grid = grid;
  return group;
}

function addSurfaceInstances(group, directions, radius, geometry, material, scale, options = {}) {
  const mesh = new THREE.InstancedMesh(geometry, material, directions.length);
  directions.forEach((direction, index) => {
    const variation = noiseHash(index + 31, Math.floor((options.seed ?? 1) * 997), options.seed ?? 1);
    TMP_NORMAL.copy(direction).normalize();
    const radialJitter = (variation - 0.5) * (options.radialJitter ?? 0);
    TMP_OBJECT.position.copy(TMP_NORMAL).multiplyScalar(radius + radialJitter);
    TMP_OBJECT.quaternion.setFromUnitVectors(UP, TMP_NORMAL);
    TMP_OBJECT.rotateY((options.yaw ?? 0) + (variation - 0.5) * (options.yawJitter ?? 0));
    if (options.offset) {
      TMP_OFFSET.set(...options.offset).applyQuaternion(TMP_OBJECT.quaternion);
      TMP_OBJECT.position.add(TMP_OFFSET);
    }
    const jitter = 1 + (variation - 0.5) * (options.scaleJitter ?? 0);
    const heightJitter = 1 + (variation - 0.5) * (options.heightJitter ?? options.scaleJitter ?? 0);
    TMP_OBJECT.scale.set(scale[0] * jitter, scale[1] * heightJitter, scale[2] * jitter);
    TMP_OBJECT.updateMatrix();
    mesh.setMatrixAt(index, TMP_OBJECT.matrix);
  });
  mesh.instanceMatrix.needsUpdate = true;
  group.add(mesh);
  TMP_OBJECT.position.set(0, 0, 0);
  TMP_OBJECT.quaternion.identity();
  TMP_OBJECT.scale.set(1, 1, 1);
  return mesh;
}

function addSurfaceArc(group, from, to, radius, material, width = 0.018) {
  const points = [];
  for (let index = 0; index <= 14; index += 1) {
    const point = new THREE.Vector3().lerpVectors(from, to, index / 14).normalize().multiplyScalar(radius);
    points.push(point);
  }
  const curve = new THREE.CatmullRomCurve3(points);
  const arc = new THREE.Mesh(new THREE.TubeGeometry(curve, 24, width, 5, false), material);
  group.add(arc);
  return arc;
}

function bendDisplay(geometry, amount = 0.018) {
  const positions = geometry.attributes.position;
  for (let i = 0; i < positions.count; i += 1) {
    const x = positions.getX(i);
    positions.setZ(i, -(x * x) * amount);
  }
  positions.needsUpdate = true;
  geometry.computeVertexNormals();
  return geometry;
}

export class WorldController {
  constructor(canvas, quality) {
    this.canvas = canvas;
    this.quality = quality;
    this.params = { intro: quality.reducedMotion ? 1 : 0, progress: 0, targetProgress: 0 };
    this.pointer = new THREE.Vector2();
    this.pointerTarget = new THREE.Vector2();
    this.serviceHover = -1;
    this.projectHover = -1;
    this.processHover = -1;
    this.statePair = {};
    this.timer = new THREE.Timer();
    this.timer.connect(document);
    this.time = 0;
    this.hidden = document.hidden;
    this.disposed = false;
    this.raf = 0;

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: quality.antialias,
      powerPreference: "high-performance",
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, quality.dpr));
    this.renderer.setSize(window.innerWidth, window.innerHeight, false);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.94;
    this.renderer.setClearColor(SPACE, 1);

    this.scene = new THREE.Scene();
    this.scene.background = SPACE;
    this.scene.fog = new THREE.FogExp2(SPACE, quality.mobile ? 0.031 : 0.023);
    this.camera = new THREE.PerspectiveCamera(41, window.innerWidth / window.innerHeight, 0.08, 230);
    this.camera.position.copy(SCENE_STATES[0].camera);
    this.cameraTarget = SCENE_STATES[0].target.clone();

    this.createMaterials();
    this.createLighting();
    this.createSpaceDepth();
    this.createRoute();
    this.createShip();
    this.createLaunchStation();
    this.createServicesPlanet();
    this.createProjectsStation();
    this.createEngineeringPlanet();
    this.createProcessOrbit();
    this.createContactBeacon();
    this.flightExclusions = [
      { center: new THREE.Vector3(0, 0, -30), radius: 7.35 },
      { center: new THREE.Vector3(0, 0, -63), radius: 8.05 },
      { center: new THREE.Vector3(0, 0, -96), radius: 7.05 },
      { center: new THREE.Vector3(0, 0, -128), radius: 3.25 },
    ];
    this.bind();
    this.tick = this.tick.bind(this);
    this.raf = requestAnimationFrame(this.tick);
  }

  createMaterials() {
    this.materials = {
      hull: new THREE.MeshStandardMaterial({ color: 0xdce2ee, metalness: 0.68, roughness: 0.26 }),
      hullDark: new THREE.MeshStandardMaterial({ color: 0x111722, metalness: 0.8, roughness: 0.3 }),
      hullPanel: new THREE.MeshStandardMaterial({ color: 0x7f8997, metalness: 0.76, roughness: 0.38 }),
      metal: new THREE.MeshStandardMaterial({ color: 0x161d29, metalness: 0.82, roughness: 0.34 }),
      blueMetal: new THREE.MeshStandardMaterial({ color: 0x172759, metalness: 0.7, roughness: 0.3, emissive: 0x0b1f66, emissiveIntensity: 0.7 }),
      signal: new THREE.MeshBasicMaterial({ color: LIGHT_BLUE }),
      route: new THREE.MeshBasicMaterial({ color: 0x315dff, transparent: true, opacity: 0.2, depthWrite: false }),
      glass: new THREE.MeshPhysicalMaterial({ color: 0x122957, metalness: 0.05, roughness: 0.12, transmission: this.quality.name === "LOW" ? 0 : 0.35, transparent: true, opacity: 0.76 }),
    };
  }

  createLighting() {
    this.scene.add(new THREE.HemisphereLight(0xbcc9e9, 0x010207, 0.48));
    this.keyLight = new THREE.DirectionalLight(0xffffff, 3.4);
    this.keyLight.position.set(6, 9, 12);
    this.scene.add(this.keyLight);
    this.followLight = new THREE.PointLight(0x315dff, 18, 24, 2);
    this.scene.add(this.followLight);
  }

  createSpaceDepth() {
    const count = Math.max(180, Math.floor(this.quality.particles * 0.28));
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    for (let i = 0; i < count; i += 1) {
      positions[i * 3] = (Math.random() - 0.5) * 64;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 36;
      positions[i * 3 + 2] = 14 - Math.random() * 190;
      sizes[i] = 0.4 + Math.random() * 0.6;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    const material = new THREE.PointsMaterial({ color: 0xa8b8d9, size: this.quality.mobile ? 0.025 : 0.035, transparent: true, opacity: 0.42, sizeAttenuation: true, depthWrite: false });
    this.stars = new THREE.Points(geometry, material);
    this.stars.userData.noFade = true;
    this.scene.add(this.stars);
  }

  createRoute() {
    this.routeCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(2.2, -0.4, 1.5),
      new THREE.Vector3(1.2, 1.1, -10),
      new THREE.Vector3(6.8, 1.45, -26),
      new THREE.Vector3(6.7, 0.7, -34),
      new THREE.Vector3(2.8, 1.1, -44),
      new THREE.Vector3(-6.35, 1.55, -58),
      new THREE.Vector3(-6.2, 0.45, -67),
      new THREE.Vector3(-2.4, 1.1, -78),
      new THREE.Vector3(6.9, 1.55, -91),
      new THREE.Vector3(6.7, 0.6, -101),
      new THREE.Vector3(3.2, 1.1, -112),
      new THREE.Vector3(-6, 0, -128),
      new THREE.Vector3(0, -5.7, -128),
      new THREE.Vector3(6, 0, -128),
      new THREE.Vector3(0, 5.7, -128),
      new THREE.Vector3(2.7, 0.4, -151),
      new THREE.Vector3(2.1, -0.2, -157),
    ], false, "catmullrom", 0.38);
    const tube = new THREE.Mesh(new THREE.TubeGeometry(this.routeCurve, 320, 0.014, 4, false), this.materials.route);
    tube.userData.noFade = true;
    this.scene.add(tube);
    this.routeSignal = new THREE.Mesh(new THREE.SphereGeometry(0.085, 10, 10), this.materials.signal);
    this.routeSignal.userData.noFade = true;
    this.scene.add(this.routeSignal);
  }

  createShip() {
    const ship = new THREE.Group();
    ship.name = "GAUAS Starship";
    const radialSegments = this.quality.name === "HIGH" ? 28 : 18;
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.48, 3.25, 10, radialSegments), this.materials.hull);
    body.rotation.x = Math.PI / 2;
    ship.add(body);

    const nose = new THREE.Mesh(new THREE.ConeGeometry(0.47, 1.45, radialSegments), this.materials.hull);
    nose.rotation.x = -Math.PI / 2;
    nose.position.z = -2.47;
    ship.add(nose);

    const canopy = new THREE.Mesh(new THREE.SphereGeometry(0.5, radialSegments, 16), this.materials.glass);
    canopy.scale.set(0.76, 0.46, 1.48);
    canopy.position.set(0, 0.4, -1.05);
    ship.add(canopy);

    const wingShape = new THREE.Shape();
    wingShape.moveTo(0.18, -0.72);
    wingShape.lineTo(2.35, 1.05);
    wingShape.lineTo(1.72, 1.52);
    wingShape.lineTo(0.54, 1.28);
    wingShape.lineTo(0.12, 0.58);
    wingShape.closePath();
    const wingGeometry = new THREE.ExtrudeGeometry(wingShape, {
      depth: 0.13,
      bevelEnabled: true,
      bevelSegments: 2,
      bevelSize: 0.035,
      bevelThickness: 0.025,
    });
    const leftWing = new THREE.Mesh(wingGeometry, this.materials.hullDark);
    leftWing.rotation.x = -Math.PI / 2;
    leftWing.position.set(0, -0.13, 0.12);
    ship.add(leftWing);
    const rightWing = leftWing.clone();
    rightWing.scale.x = -1;
    ship.add(rightWing);

    const accentShape = wingShape.clone();
    const accent = new THREE.Mesh(new THREE.ShapeGeometry(accentShape), this.materials.blueMetal);
    accent.rotation.x = -Math.PI / 2;
    accent.position.set(0, 0.018, 0.18);
    accent.scale.set(0.7, 0.7, 0.7);
    ship.add(accent);
    const accentMirror = accent.clone();
    accentMirror.scale.x *= -1;
    ship.add(accentMirror);

    const tailShape = new THREE.Shape();
    tailShape.moveTo(-0.08, -0.5);
    tailShape.lineTo(-0.08, 0.72);
    tailShape.lineTo(0.02, 1.5);
    tailShape.lineTo(0.13, 0.66);
    tailShape.lineTo(0.13, -0.5);
    tailShape.closePath();
    const tail = new THREE.Mesh(new THREE.ShapeGeometry(tailShape), this.materials.hullDark);
    tail.rotation.y = Math.PI / 2;
    tail.position.set(0, 0.25, 1.33);
    ship.add(tail);

    const spine = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.035, 2.8), this.materials.signal);
    spine.position.set(0, 0.49, 0.42);
    ship.add(spine);

    const rearHousing = new THREE.Mesh(new THREE.BoxGeometry(1.95, 0.48, 1.18), this.materials.hullPanel);
    rearHousing.position.set(0, -0.05, 1.25);
    rearHousing.scale.z = 0.82;
    ship.add(rearHousing);

    const panelGeometry = new THREE.BoxGeometry(1, 1, 1);
    const panelMesh = new THREE.InstancedMesh(panelGeometry, this.materials.hullPanel, 8);
    const panelLayout = [
      [-0.32, 0.47, -0.1, 0.23, 0.025, 0.52], [0.32, 0.47, -0.1, 0.23, 0.025, 0.52],
      [-0.36, 0.39, 0.58, 0.18, 0.035, 0.34], [0.36, 0.39, 0.58, 0.18, 0.035, 0.34],
      [-1.05, -0.01, 0.78, 0.52, 0.035, 0.19], [1.05, -0.01, 0.78, 0.52, 0.035, 0.19],
      [-1.48, -0.01, 1.08, 0.35, 0.035, 0.14], [1.48, -0.01, 1.08, 0.35, 0.035, 0.14],
    ];
    panelLayout.forEach(([x, y, z, sx, sy, sz], index) => {
      TMP_OBJECT.position.set(x, y, z);
      TMP_OBJECT.quaternion.identity();
      TMP_OBJECT.scale.set(sx, sy, sz);
      TMP_OBJECT.updateMatrix();
      panelMesh.setMatrixAt(index, TMP_OBJECT.matrix);
    });
    panelMesh.instanceMatrix.needsUpdate = true;
    ship.add(panelMesh);
    TMP_OBJECT.position.set(0, 0, 0);
    TMP_OBJECT.scale.set(1, 1, 1);

    const intake = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.16, 0.82), this.materials.hullDark);
    intake.position.set(0, -0.43, -1.42);
    intake.rotation.x = -0.12;
    ship.add(intake);

    const canopyFrame = new THREE.Mesh(new THREE.TorusGeometry(0.39, 0.025, 6, 32), this.materials.hullPanel);
    canopyFrame.scale.set(1, 0.52, 1);
    canopyFrame.rotation.x = Math.PI / 2;
    canopyFrame.position.set(0, 0.42, -0.76);
    ship.add(canopyFrame);

    this.engineGlows = [];
    [-0.77, 0.77].forEach((x) => {
      const nacelle = new THREE.Mesh(new THREE.CapsuleGeometry(0.2, 1.35, 6, 16), this.materials.hull);
      nacelle.rotation.x = Math.PI / 2;
      nacelle.position.set(x, -0.05, 0.78);
      ship.add(nacelle);
      const engine = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.24, 0.58, 20), this.materials.metal);
      engine.rotation.x = Math.PI / 2;
      engine.position.set(x, -0.05, 1.62);
      ship.add(engine);
      const engineRing = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.035, 6, 24), this.materials.blueMetal);
      engineRing.position.set(x, -0.05, 1.94);
      ship.add(engineRing);
      const glow = new THREE.Mesh(new THREE.CircleGeometry(0.155, 24), this.materials.signal);
      glow.position.set(x, -0.05, 1.945);
      ship.add(glow);
      const exhaust = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.78, 16, 1, true), new THREE.MeshBasicMaterial({ color: 0x6fa3ff, transparent: true, opacity: 0.2, depthWrite: false }));
      exhaust.rotation.x = Math.PI / 2;
      exhaust.position.set(x, -0.05, 2.34);
      ship.add(exhaust);
      this.engineGlows.push(glow);
    });
    [-2.06, 2.06].forEach((x) => {
      const navLight = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 10), new THREE.MeshBasicMaterial({ color: x < 0 ? 0x6b9eff : 0xffffff }));
      navLight.position.set(x, 0, 1.16);
      ship.add(navLight);
    });
    const bowLight = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 10), this.materials.signal);
    bowLight.position.set(0, 0, -3.18);
    ship.add(bowLight);
    ship.scale.setScalar(this.quality.mobile ? 0.72 : 0.9);
    this.ship = ship;
    this.scene.add(ship);
  }

  createLaunchStation() {
    const group = new THREE.Group();
    group.position.set(0, -1.9, 0);
    this.launchStation = group;
    this.scene.add(group);
    const base = new THREE.Mesh(new THREE.CylinderGeometry(4.2, 4.7, 0.55, 64), this.materials.metal);
    group.add(base);
    const deck = new THREE.Mesh(new THREE.CylinderGeometry(3.45, 3.45, 0.12, 64), this.materials.hullDark);
    deck.position.y = 0.33;
    group.add(deck);
    for (let i = 0; i < 3; i += 1) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(2.6 + i * 0.47, 0.025, 6, 96), i === 1 ? this.materials.signal : this.materials.route);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = 0.41;
      group.add(ring);
    }
    this.launchLights = [];
    for (let i = 0; i < 8; i += 1) {
      const angle = i / 8 * Math.PI * 2;
      const pylon = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.8, 0.16), this.materials.blueMetal.clone());
      pylon.position.set(Math.cos(angle) * 3.65, 0.75, Math.sin(angle) * 3.65);
      group.add(pylon);
      this.launchLights.push(pylon);
    }
    const launchGate = new THREE.Mesh(new THREE.TorusGeometry(3.1, 0.075, 8, 128), this.materials.blueMetal);
    launchGate.position.set(0, 3.25, -2.8);
    group.add(launchGate);
  }

  createServicesPlanet() {
    const group = new THREE.Group();
    group.position.z = -30;
    this.servicesGroup = group;
    this.scene.add(group);
    this.servicesPlanet = makePlanet(4.25, 0x164f86, this.quality.name === "HIGH" ? 56 : 36, {
      texture: "earth",
      textureSize: this.quality.name === "HIGH" ? 768 : 512,
      bumpScale: 0.045,
      clouds: this.quality.name !== "LOW",
      cloudOpacity: 0.68,
      atmosphere: 0x6fbfff,
      atmosphereOpacity: 0.14,
      gridOpacity: 0,
      roughness: 0.86,
    });
    group.add(this.servicesPlanet);

    const forestCount = this.quality.mobile ? 14 : this.quality.name === "LOW" ? 18 : 28;
    const treeDirections = createFeatureDirections("earth", forestCount, 0.4, {
      focus: new THREE.Vector3(0.28, 0.22, 1), minTerrain: PLANET_PROFILES.earth.high, spacing: 0.115,
    });
    const bark = new THREE.MeshStandardMaterial({ color: 0x5b3924, roughness: 1 });
    const pineDark = new THREE.MeshStandardMaterial({ color: 0x174f38, roughness: 0.96 });
    const pineLight = new THREE.MeshStandardMaterial({ color: 0x347c4a, roughness: 0.94 });
    addSurfaceInstances(this.servicesPlanet, treeDirections, 4.46, new THREE.CylinderGeometry(0.48, 0.65, 1, 7), bark, [0.15, 0.38, 0.15], { seed: 2.4, scaleJitter: 0.3, heightJitter: 0.55, yawJitter: Math.PI });
    addSurfaceInstances(this.servicesPlanet, treeDirections, 4.72, new THREE.ConeGeometry(0.65, 1, 8), pineDark, [0.5, 0.67, 0.5], { seed: 2.4, scaleJitter: 0.28, heightJitter: 0.38, yawJitter: Math.PI });
    addSurfaceInstances(this.servicesPlanet, treeDirections, 5.02, new THREE.ConeGeometry(0.58, 0.82, 8), pineLight, [0.4, 0.52, 0.4], { seed: 2.4, scaleJitter: 0.28, heightJitter: 0.38, yawJitter: Math.PI });

    const cottageCount = this.quality.mobile ? 3 : 5;
    const cottageDirections = createFeatureDirections("earth", cottageCount, 3.1, {
      focus: new THREE.Vector3(-0.42, 0.12, 1), minTerrain: PLANET_PROFILES.earth.coast,
      maxTerrain: PLANET_PROFILES.earth.high + 0.02, spacing: 0.32,
    });
    const cottageWall = new THREE.MeshStandardMaterial({ color: 0xe7ddc8, metalness: 0.02, roughness: 0.88 });
    const cottageRoof = new THREE.MeshStandardMaterial({ color: 0xa84f35, roughness: 0.9 });
    const cottageTrim = new THREE.MeshStandardMaterial({ color: 0x523627, roughness: 0.86 });
    const cottageGlow = new THREE.MeshBasicMaterial({ color: 0xffd78a, toneMapped: false });
    const cottageSeed = 8.7;
    addSurfaceInstances(this.servicesPlanet, cottageDirections, 4.5, new THREE.BoxGeometry(1, 1, 1), cottageWall, [0.42, 0.38, 0.34], { seed: cottageSeed, scaleJitter: 0.18, yawJitter: 1.2 });
    addSurfaceInstances(this.servicesPlanet, cottageDirections, 4.78, new THREE.ConeGeometry(0.74, 0.5, 4), cottageRoof, [0.62, 0.62, 0.62], { seed: cottageSeed, scaleJitter: 0.18, yaw: Math.PI / 4, yawJitter: 1.2 });
    addSurfaceInstances(this.servicesPlanet, cottageDirections, 4.52, new THREE.BoxGeometry(1, 1, 1), cottageTrim, [0.1, 0.2, 0.035], { seed: cottageSeed, yawJitter: 1.2, offset: [0, -0.02, 0.19] });
    addSurfaceInstances(this.servicesPlanet, cottageDirections, 4.58, new THREE.BoxGeometry(1, 1, 1), cottageGlow, [0.105, 0.1, 0.025], { seed: cottageSeed, yawJitter: 1.2, offset: [-0.14, 0.02, 0.2] });
    addSurfaceInstances(this.servicesPlanet, cottageDirections, 4.58, new THREE.BoxGeometry(1, 1, 1), cottageGlow, [0.105, 0.1, 0.025], { seed: cottageSeed, yawJitter: 1.2, offset: [0.14, 0.02, 0.2] });

    const orbit = new THREE.Mesh(new THREE.TorusGeometry(6.25, 0.025, 6, 160), this.materials.route);
    group.add(orbit);
    this.serviceSatellites = [];
    const shapes = ["web", "mobile", "strategy", "support"];
    shapes.forEach((type, index) => {
      const angle = index / 4 * Math.PI * 2 + 0.45;
      const satellite = new THREE.Group();
      satellite.position.set(Math.cos(angle) * 6.25, Math.sin(angle) * 6.25, 0);
      const material = this.materials.blueMetal.clone();
      if (type === "web") {
        const panel = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.9, 0.12), material);
        satellite.add(panel);
        satellite.add(new THREE.LineSegments(new THREE.EdgesGeometry(panel.geometry), new THREE.LineBasicMaterial({ color: 0x88a8ff })));
      } else if (type === "mobile") {
        satellite.add(new THREE.Mesh(new THREE.BoxGeometry(0.62, 1.28, 0.18), material));
      } else if (type === "strategy") {
        const dish = new THREE.Mesh(new THREE.SphereGeometry(0.7, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), material);
        dish.rotation.x = Math.PI / 2;
        satellite.add(dish);
      } else {
        for (let i = 0; i < 3; i += 1) {
          const ring = new THREE.Mesh(new THREE.TorusGeometry(0.38 + i * 0.19, 0.025, 6, 48), material);
          ring.rotation.set(i * 0.45, i * 0.35, 0);
          satellite.add(ring);
        }
      }
      const node = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 10), this.materials.signal);
      satellite.add(node);
      satellite.userData.material = material;
      satellite.userData.base = satellite.position.clone();
      satellite.userData.angle = angle;
      group.add(satellite);
      this.serviceSatellites.push(satellite);
    });
  }

  createProjectsStation() {
    const group = new THREE.Group();
    group.position.z = -63;
    this.projectsGroup = group;
    this.scene.add(group);
    const planet = makePlanet(3.6, 0x8d3524, this.quality.name === "HIGH" ? 52 : 34, {
      texture: "mars",
      textureSize: this.quality.name === "HIGH" ? 768 : 512,
      bumpScale: 0.05,
      clouds: this.quality.name !== "LOW",
      cloudOpacity: 0.72,
      atmosphere: 0x78c8ff,
      atmosphereOpacity: 0.135,
      gridOpacity: 0,
      roughness: 0.86,
    });
    this.projectsPlanet = planet;
    group.add(planet);
    const palmCount = this.quality.mobile ? 11 : this.quality.name === "LOW" ? 14 : 20;
    const palmDirections = createFeatureDirections("mars", palmCount, 4.8, {
      focus: new THREE.Vector3(0.34, 0.16, 1), minTerrain: PLANET_PROFILES.mars.coast + 0.012,
      maxTerrain: PLANET_PROFILES.mars.high + 0.08, spacing: 0.135,
    });
    const palmTrunk = new THREE.MeshStandardMaterial({ color: 0x8b5b31, roughness: 1 });
    const palmLeaf = new THREE.MeshStandardMaterial({ color: 0x2d8b54, roughness: 0.92 });
    const palmLeafSun = new THREE.MeshStandardMaterial({ color: 0x59ae59, roughness: 0.9 });
    addSurfaceInstances(planet, palmDirections, 3.78, new THREE.CylinderGeometry(0.32, 0.46, 1, 7), palmTrunk, [0.18, 0.54, 0.18], { seed: 14.2, scaleJitter: 0.3, heightJitter: 0.5, yawJitter: Math.PI });
    addSurfaceInstances(planet, palmDirections, 4.06, new THREE.SphereGeometry(0.62, 9, 5), palmLeaf, [0.62, 0.2, 0.62], { seed: 14.2, scaleJitter: 0.32, yawJitter: Math.PI });
    addSurfaceInstances(planet, palmDirections, 4.12, new THREE.SphereGeometry(0.52, 8, 4), palmLeafSun, [0.5, 0.12, 0.5], { seed: 14.2, scaleJitter: 0.35, yawJitter: Math.PI });

    const villaCount = this.quality.mobile ? 3 : 5;
    const villaDirections = createFeatureDirections("mars", villaCount, 1.7, {
      focus: new THREE.Vector3(-0.36, 0.1, 1), minTerrain: PLANET_PROFILES.mars.coast + 0.01,
      maxTerrain: PLANET_PROFILES.mars.high + 0.07, spacing: 0.34,
    });
    const villaSeed = 22.4;
    const stucco = new THREE.MeshStandardMaterial({ color: 0xf2e7cc, roughness: 0.82 });
    const terracotta = new THREE.MeshStandardMaterial({ color: 0xca6940, roughness: 0.88 });
    const villaGlass = new THREE.MeshBasicMaterial({ color: 0x86e5e0, toneMapped: false });
    addSurfaceInstances(planet, villaDirections, 3.82, new THREE.BoxGeometry(1, 1, 1), stucco, [0.52, 0.4, 0.4], { seed: villaSeed, scaleJitter: 0.25, yawJitter: 1.5 });
    addSurfaceInstances(planet, villaDirections, 4.05, new THREE.BoxGeometry(1, 1, 1), terracotta, [0.62, 0.09, 0.5], { seed: villaSeed, scaleJitter: 0.22, yawJitter: 1.5 });
    addSurfaceInstances(planet, villaDirections, 3.89, new THREE.BoxGeometry(1, 1, 1), villaGlass, [0.22, 0.13, 0.025], { seed: villaSeed, yawJitter: 1.5, offset: [0, 0, 0.22] });

    const domeDirections = createFeatureDirections("mars", this.quality.mobile ? 1 : 2, 5.7, {
      focus: new THREE.Vector3(0.02, 0.46, 1), minTerrain: PLANET_PROFILES.mars.coast, spacing: 0.55,
    });
    const domeBase = new THREE.MeshStandardMaterial({ color: 0xd2b882, roughness: 0.72, metalness: 0.08 });
    const domeGlass = new THREE.MeshPhysicalMaterial({ color: 0x8bdad5, transparent: true, opacity: 0.68, roughness: 0.18, metalness: 0.04, clearcoat: 0.65 });
    addSurfaceInstances(planet, domeDirections, 3.74, new THREE.CylinderGeometry(0.72, 0.82, 0.24, 16), domeBase, [0.58, 0.72, 0.58], { seed: 31.6, yawJitter: Math.PI });
    addSurfaceInstances(planet, domeDirections, 3.82, new THREE.SphereGeometry(0.66, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), domeGlass, [0.72, 0.72, 0.72], { seed: 31.6, yawJitter: Math.PI });

    const boardwalk = new THREE.MeshBasicMaterial({ color: 0xffca72, transparent: true, opacity: 0.72, toneMapped: false });
    for (let index = 0; index < villaDirections.length - 1; index += 1) {
      addSurfaceArc(planet, villaDirections[index], villaDirections[index + 1], 3.69, boardwalk, 0.014);
    }
    const ring = new THREE.Mesh(new THREE.TorusGeometry(6.1, 0.12, 10, 128), this.materials.metal);
    ring.rotation.x = 0.12;
    group.add(ring);
    const innerRing = new THREE.Mesh(new THREE.TorusGeometry(5.4, 0.035, 6, 128), this.materials.signal);
    innerRing.rotation.x = 0.12;
    group.add(innerRing);
    this.projectRing = ring;

    const loader = new THREE.TextureLoader();
    const images = ["/assets/project-nomae.webp", "/assets/project-arden.webp", "/assets/project-ledgerline.webp"];
    const angles = [0.42, 2.52, 4.62];
    this.projectDocks = [];
    images.forEach((src, index) => {
      const angle = angles[index];
      const dock = new THREE.Group();
      dock.position.set(Math.cos(angle) * 6.2, Math.sin(angle) * 4.9, 0.6);
      dock.userData.base = dock.position.clone();
      const texture = loader.load(src);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = Math.min(8, this.renderer.capabilities.getMaxAnisotropy());
      const display = new THREE.Mesh(
        bendDisplay(new THREE.PlaneGeometry(4.6, 2.9, 28, 1)),
        new THREE.MeshBasicMaterial({ map: texture, toneMapped: false, transparent: true }),
      );
      dock.add(display);
      const frame = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(4.85, 3.14, 0.2)), new THREE.LineBasicMaterial({ color: 0x668bff, transparent: true, opacity: 0.65 }));
      frame.position.z = -0.14;
      dock.add(frame);
      const platform = new THREE.Mesh(new THREE.CylinderGeometry(1.25, 1.5, 0.2, 32), this.materials.metal);
      platform.rotation.x = Math.PI / 2;
      platform.position.set(0, -1.85, -0.25);
      dock.add(platform);
      dock.userData.screenMaterial = display.material;
      group.add(lineBetween(new THREE.Vector3(), dock.position.clone().multiplyScalar(0.72), this.materials.route, 0.035));
      group.add(dock);
      this.projectDocks.push(dock);
    });
  }

  createEngineeringPlanet() {
    const group = new THREE.Group();
    group.position.z = -96;
    this.engineeringGroup = group;
    this.scene.add(group);
    this.engineeringPlanet = makePlanet(4.4, 0x26343b, this.quality.name === "HIGH" ? 56 : 34, {
      texture: "engineering",
      textureSize: this.quality.name === "HIGH" ? 768 : 512,
      bumpScale: 0.045,
      clouds: this.quality.name !== "LOW",
      cloudOpacity: 0.66,
      atmosphere: 0x71c4ee,
      atmosphereOpacity: 0.14,
      gridOpacity: 0,
      metalness: 0.05,
      roughness: 0.84,
    });
    group.add(this.engineeringPlanet);
    const towerCount = this.quality.mobile ? 7 : this.quality.name === "LOW" ? 9 : 13;
    const towerDirections = createFeatureDirections("engineering", towerCount, 2.4, {
      focus: new THREE.Vector3(-0.26, 0.18, 1), minTerrain: PLANET_PROFILES.engineering.high,
      spacing: 0.19,
    });
    const citySeed = 42.8;
    const towerMetal = new THREE.MeshStandardMaterial({ color: 0x172e38, metalness: 0.68, roughness: 0.33 });
    const towerCrown = new THREE.MeshStandardMaterial({ color: 0x37636a, metalness: 0.55, roughness: 0.38 });
    const windowLight = new THREE.MeshBasicMaterial({ color: 0x65f1dc, toneMapped: false });
    const beaconLight = new THREE.MeshBasicMaterial({ color: 0xffcf70, toneMapped: false });
    addSurfaceInstances(this.engineeringPlanet, towerDirections, 4.67, new THREE.BoxGeometry(1, 1, 1), towerMetal, [0.34, 0.92, 0.34], { seed: citySeed, scaleJitter: 0.28, heightJitter: 0.62, yawJitter: 0.9 });
    addSurfaceInstances(this.engineeringPlanet, towerDirections, 5.13, new THREE.BoxGeometry(1, 1, 1), towerCrown, [0.4, 0.12, 0.4], { seed: citySeed, scaleJitter: 0.25, yawJitter: 0.9 });
    addSurfaceInstances(this.engineeringPlanet, towerDirections, 4.7, new THREE.BoxGeometry(1, 1, 1), windowLight, [0.22, 0.1, 0.025], { seed: citySeed, yawJitter: 0.9, offset: [0, -0.12, 0.19] });
    addSurfaceInstances(this.engineeringPlanet, towerDirections, 4.94, new THREE.BoxGeometry(1, 1, 1), windowLight, [0.22, 0.08, 0.025], { seed: citySeed, yawJitter: 0.9, offset: [0, -0.05, 0.19] });
    addSurfaceInstances(this.engineeringPlanet, towerDirections, 5.27, new THREE.SphereGeometry(0.08, 8, 7), beaconLight, [1, 1, 1], { seed: citySeed, scaleJitter: 0.35 });

    const hubDirections = createFeatureDirections("engineering", this.quality.mobile ? 3 : 5, 6.1, {
      focus: new THREE.Vector3(0.44, -0.02, 1), minTerrain: PLANET_PROFILES.engineering.coast,
      spacing: 0.34,
    });
    const hubMaterial = new THREE.MeshStandardMaterial({ color: 0x294f56, metalness: 0.52, roughness: 0.4 });
    addSurfaceInstances(this.engineeringPlanet, hubDirections, 4.51, new THREE.CylinderGeometry(0.72, 0.86, 0.22, 12), hubMaterial, [0.72, 0.8, 0.72], { seed: 51.2, scaleJitter: 0.24, yawJitter: Math.PI });
    addSurfaceInstances(this.engineeringPlanet, hubDirections, 4.65, new THREE.CylinderGeometry(0.4, 0.58, 0.34, 10), towerCrown, [0.75, 0.9, 0.75], { seed: 51.2, scaleJitter: 0.24, yawJitter: Math.PI });
    addSurfaceInstances(this.engineeringPlanet, hubDirections, 4.86, new THREE.SphereGeometry(0.09, 8, 7), windowLight, [1, 1, 1], { seed: 51.2, scaleJitter: 0.28 });

    const transitLight = new THREE.MeshBasicMaterial({ color: 0x43d5c3, transparent: true, opacity: 0.82, toneMapped: false });
    const infrastructure = [...towerDirections.slice(0, 5), ...hubDirections.slice(0, 3)];
    for (let index = 0; index < infrastructure.length - 1; index += 1) {
      addSurfaceArc(this.engineeringPlanet, infrastructure[index], infrastructure[index + 1], 4.51, transitLight, 0.018);
    }

    const groveCount = this.quality.mobile ? 9 : 16;
    const technoGroveDirections = createFeatureDirections("engineering", groveCount, 4.2, {
      focus: new THREE.Vector3(0.32, 0.3, 1), minTerrain: PLANET_PROFILES.engineering.high,
      spacing: 0.14,
    });
    addSurfaceInstances(this.engineeringPlanet, technoGroveDirections, 4.57, new THREE.CylinderGeometry(0.38, 0.5, 1, 7), new THREE.MeshStandardMaterial({ color: 0x594736, roughness: 0.96 }), [0.13, 0.34, 0.13], { seed: 57.1, scaleJitter: 0.35, heightJitter: 0.42, yawJitter: Math.PI });
    addSurfaceInstances(this.engineeringPlanet, technoGroveDirections, 4.8, new THREE.SphereGeometry(0.5, 9, 6), new THREE.MeshStandardMaterial({ color: 0x3b8b60, metalness: 0.02, roughness: 0.88 }), [0.45, 0.48, 0.45], { seed: 57.1, scaleJitter: 0.32, heightJitter: 0.38, yawJitter: Math.PI });
    this.engineeringRings = [];
    for (let i = 0; i < 3; i += 1) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(5.1 + i * 0.62, 0.035 + i * 0.008, 8, 128), i === 1 ? this.materials.blueMetal : this.materials.metal);
      ring.rotation.set(i * 0.56, i * 0.42, i * 0.2);
      group.add(ring);
      this.engineeringRings.push(ring);
    }
    const moduleCount = this.quality.mobile ? 10 : 18;
    const geometry = new THREE.CapsuleGeometry(0.11, 0.24, 4, 8);
    const modules = new THREE.InstancedMesh(geometry, this.materials.blueMetal, moduleCount);
    for (let i = 0; i < moduleCount; i += 1) {
      const angle = i * 2.399;
      const y = 1 - (i / Math.max(1, moduleCount - 1)) * 2;
      const radial = Math.sqrt(1 - y * y) * 4.55;
      TMP_OBJECT.position.set(Math.cos(angle) * radial, y * 4.55, Math.sin(angle) * radial);
      TMP_OBJECT.lookAt(0, 0, 0);
      TMP_OBJECT.updateMatrix();
      modules.setMatrixAt(i, TMP_OBJECT.matrix);
    }
    group.add(modules);
    this.engineeringPackets = [];
    for (let i = 0; i < 7; i += 1) {
      const packet = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), this.materials.signal);
      group.add(packet);
      this.engineeringPackets.push(packet);
    }
  }

  createProcessOrbit() {
    const group = new THREE.Group();
    group.position.z = -128;
    this.processGroup = group;
    this.scene.add(group);
    const center = makePlanet(2.15, 0x715d35, this.quality.name === "HIGH" ? 42 : 28, {
      texture: "mineral",
      textureSize: this.quality.name === "HIGH" ? 640 : 384,
      bumpScale: 0.045,
      clouds: this.quality.name !== "LOW",
      cloudOpacity: 0.7,
      atmosphere: 0x83c9ef,
      atmosphereOpacity: 0.14,
      gridOpacity: 0,
      metalness: 0.04,
      roughness: 0.86,
    });
    this.processPlanet = center;
    group.add(center);
    const terraceDirections = createFeatureDirections("mineral", this.quality.mobile ? 2 : 3, 0.9, {
      focus: new THREE.Vector3(-0.22, 0.28, 1), minTerrain: PLANET_PROFILES.mineral.coast,
      spacing: 0.56,
    });
    const terraceEarth = new THREE.MeshStandardMaterial({ color: 0xb98432, roughness: 0.95 });
    const terraceStone = new THREE.MeshStandardMaterial({ color: 0xd5ad5a, roughness: 0.9 });
    const terraceGreen = new THREE.MeshStandardMaterial({ color: 0x758f3d, roughness: 0.96 });
    addSurfaceInstances(center, terraceDirections, 2.21, new THREE.CylinderGeometry(0.94, 1.02, 0.14, 16), terraceEarth, [0.82, 1, 0.82], { seed: 63.8, scaleJitter: 0.2, yawJitter: Math.PI });
    addSurfaceInstances(center, terraceDirections, 2.32, new THREE.CylinderGeometry(0.78, 0.86, 0.12, 16), terraceStone, [0.78, 1, 0.78], { seed: 63.8, scaleJitter: 0.2, yawJitter: Math.PI });
    addSurfaceInstances(center, terraceDirections, 2.42, new THREE.CylinderGeometry(0.61, 0.68, 0.1, 16), terraceEarth, [0.75, 1, 0.75], { seed: 63.8, scaleJitter: 0.2, yawJitter: Math.PI });
    addSurfaceInstances(center, terraceDirections, 2.49, new THREE.CylinderGeometry(0.5, 0.54, 0.055, 16), terraceGreen, [0.72, 1, 0.72], { seed: 63.8, scaleJitter: 0.2, yawJitter: Math.PI });

    const hutDirections = createFeatureDirections("mineral", this.quality.mobile ? 3 : 5, 3.7, {
      focus: new THREE.Vector3(0.38, 0.05, 1), minTerrain: PLANET_PROFILES.mineral.coast,
      maxTerrain: PLANET_PROFILES.mineral.high + 0.09, spacing: 0.37,
    });
    const hutSeed = 71.9;
    const hutWall = new THREE.MeshStandardMaterial({ color: 0xdfbd78, roughness: 0.92 });
    const thatch = new THREE.MeshStandardMaterial({ color: 0x8f612d, roughness: 1 });
    const hutGlow = new THREE.MeshBasicMaterial({ color: 0xffd36a, toneMapped: false });
    addSurfaceInstances(center, hutDirections, 2.31, new THREE.CylinderGeometry(0.48, 0.55, 0.38, 10), hutWall, [0.76, 1, 0.76], { seed: hutSeed, scaleJitter: 0.2, yawJitter: Math.PI });
    addSurfaceInstances(center, hutDirections, 2.58, new THREE.ConeGeometry(0.67, 0.4, 10), thatch, [0.72, 0.9, 0.72], { seed: hutSeed, scaleJitter: 0.2, yawJitter: Math.PI });
    addSurfaceInstances(center, hutDirections, 2.35, new THREE.BoxGeometry(1, 1, 1), hutGlow, [0.12, 0.12, 0.025], { seed: hutSeed, yawJitter: Math.PI, offset: [0, 0, 0.37] });

    const cypressCount = this.quality.mobile ? 8 : 14;
    const goldenGroveDirections = createFeatureDirections("mineral", cypressCount, 5.1, {
      focus: new THREE.Vector3(-0.02, 0.22, 1), minTerrain: PLANET_PROFILES.mineral.high,
      spacing: 0.16,
    });
    addSurfaceInstances(center, goldenGroveDirections, 2.3, new THREE.CylinderGeometry(0.25, 0.32, 1, 7), new THREE.MeshStandardMaterial({ color: 0x5f4329, roughness: 1 }), [0.18, 0.38, 0.18], { seed: 76.3, scaleJitter: 0.28, heightJitter: 0.4, yawJitter: Math.PI });
    addSurfaceInstances(center, goldenGroveDirections, 2.61, new THREE.ConeGeometry(0.42, 1.15, 9), new THREE.MeshStandardMaterial({ color: 0x365d35, roughness: 0.96 }), [0.58, 0.78, 0.58], { seed: 76.3, scaleJitter: 0.28, heightJitter: 0.42, yawJitter: Math.PI });

    const gardenPath = new THREE.MeshBasicMaterial({ color: 0xffd679, transparent: true, opacity: 0.72, toneMapped: false });
    const gardenStops = [...terraceDirections, ...hutDirections];
    for (let index = 0; index < gardenStops.length - 1; index += 1) {
      addSurfaceArc(center, gardenStops[index], gardenStops[index + 1], 2.215, gardenPath, 0.013);
    }
    const orbit = new THREE.Mesh(new THREE.TorusGeometry(6, 0.035, 6, 160), this.materials.route);
    group.add(orbit);
    this.processGates = [];
    const iconTypes = ["discover", "define", "design", "develop", "launch"];
    for (let index = 0; index < 5; index += 1) {
      const angle = -Math.PI + index * (Math.PI * 2.4 / 4);
      const material = this.materials.blueMetal.clone();
      const lightMaterial = this.materials.signal.clone();
      lightMaterial.transparent = true;
      const gate = createProcessIcon(iconTypes[index], material, lightMaterial);
      gate.position.set(Math.cos(angle) * 6, Math.sin(angle) * 6, 0);
      group.add(gate);
      this.processGates.push(gate);
    }
  }

  createContactBeacon() {
    const group = new THREE.Group();
    group.position.z = -160;
    this.contactGroup = group;
    this.scene.add(group);
    const base = new THREE.Mesh(new THREE.CylinderGeometry(3.7, 4.2, 0.65, 64), this.materials.metal);
    base.position.y = -2.1;
    group.add(base);
    for (let i = 0; i < 3; i += 1) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(2.5 + i * 0.55, 0.035, 6, 96), i === 1 ? this.materials.signal : this.materials.route);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = -1.72;
      group.add(ring);
    }
    const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.7, 5.6, 18), this.materials.hullDark);
    tower.position.y = 0.8;
    group.add(tower);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.42, 20, 20), this.materials.signal);
    head.position.y = 3.72;
    group.add(head);
    this.beaconHead = head;
    this.beaconBeam = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.75, 11, 20, 1, true), new THREE.MeshBasicMaterial({ color: 0x315dff, transparent: true, opacity: 0.08, side: THREE.DoubleSide, depthWrite: false }));
    this.beaconBeam.position.y = 8.7;
    group.add(this.beaconBeam);
    const dockingArm = new THREE.Mesh(new THREE.BoxGeometry(4.3, 0.2, 0.7), this.materials.metal);
    dockingArm.position.set(2.1, -1.7, 0);
    group.add(dockingArm);
  }

  bind() {
    this.onResize = () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, this.quality.dpr));
      this.renderer.setSize(window.innerWidth, window.innerHeight, false);
    };
    this.onPointerMove = (event) => {
      this.pointerTarget.set(event.clientX / window.innerWidth * 2 - 1, -(event.clientY / window.innerHeight * 2 - 1));
    };
    this.onVisibility = () => {
      this.hidden = document.hidden;
      if (!this.hidden) this.timer.reset();
    };
    window.addEventListener("resize", this.onResize, { passive: true });
    if (!this.quality.mobile && !this.quality.reducedMotion) window.addEventListener("pointermove", this.onPointerMove, { passive: true });
    document.addEventListener("visibilitychange", this.onVisibility);
  }

  setProgress(progress) {
    const next = clamp01(progress);
    if (this.quality.reducedMotion) {
      let nearest = SCENE_STATES[0];
      SCENE_STATES.forEach((state) => {
        if (Math.abs(state.at - next) < Math.abs(nearest.at - next)) nearest = state;
      });
      this.params.targetProgress = nearest.at;
      return;
    }
    this.params.targetProgress = next;
  }

  setServiceHover(index) { this.serviceHover = index; }
  setProjectHover(index) { this.projectHover = index; }
  setProcessHover(index) { this.processHover = index; }

  applyFlightClearance(position) {
    this.flightExclusions.forEach(({ center, radius }) => {
      TMP_NORMAL.subVectors(position, center);
      const distance = TMP_NORMAL.length();
      if (distance >= radius) return;
      if (distance < 0.001) TMP_NORMAL.set(1, 0, 0);
      else TMP_NORMAL.multiplyScalar(1 / distance);
      position.copy(center).addScaledVector(TMP_NORMAL, radius);
    });
  }

  updateShip(progress, time, delta) {
    const routeT = clamp01(progress * 0.98);
    this.routeCurve.getPointAt(routeT, TMP_POSITION);
    this.applyFlightClearance(TMP_POSITION);
    this.routeCurve.getTangentAt(Math.min(0.999, routeT), TMP_DIRECTION).normalize();
    if (this.quality.reducedMotion) this.ship.position.copy(TMP_POSITION);
    else this.ship.position.lerp(TMP_POSITION, 1 - Math.exp(-delta * 8));
    TMP_QUATERNION.setFromUnitVectors(FORWARD, TMP_DIRECTION);
    const bank = this.quality.reducedMotion ? 0 : Math.sin(progress * Math.PI * 7) * 0.075;
    TMP_BANK_QUATERNION.setFromAxisAngle(FORWARD, bank);
    TMP_QUATERNION.multiply(TMP_BANK_QUATERNION);
    if (this.quality.reducedMotion) this.ship.quaternion.copy(TMP_QUATERNION);
    else this.ship.quaternion.slerp(TMP_QUATERNION, 1 - Math.exp(-delta * 5));
    const introScale = 0.62 + this.params.intro * 0.38;
    this.ship.scale.setScalar((this.quality.mobile ? 0.72 : 0.9) * introScale);
    this.ship.visible = this.params.intro > 0.04;
    const motionTime = this.quality.reducedMotion ? 0 : time;
    const pulse = 0.86 + Math.sin(motionTime * 3.8) * 0.1 + Math.sin(progress * Math.PI * 6) * 0.08;
    this.engineGlows.forEach((glow) => glow.scale.setScalar(pulse));
    this.followLight.position.copy(this.ship.position).addScaledVector(TMP_DIRECTION, -1.4);
    this.routeCurve.getPointAt(Math.max(0, routeT - 0.012), this.routeSignal.position);
  }

  updateDestinations(progress, time, delta) {
    const motionDelta = this.quality.reducedMotion ? 0 : delta;
    const motionTime = this.quality.reducedMotion ? 0 : time;
    const launchActivity = 1 - range(Math.abs(progress - 0.02), 0.08, 0.2);
    setGroupOpacity(this.launchStation, launchActivity);
    this.launchLights.forEach((pylon, index) => {
      pylon.material.emissiveIntensity = this.params.intro * (0.45 + Math.sin(motionTime * 2.2 + index) * 0.15);
    });

    const servicesActivity = 1 - range(Math.abs(progress - 0.19), 0.1, 0.19);
    setGroupOpacity(this.servicesGroup, servicesActivity);
    this.servicesPlanet.rotation.y += motionDelta * 0.027;
    if (this.servicesPlanet.userData.grid) this.servicesPlanet.userData.grid.rotation.y -= motionDelta * 0.012;
    if (this.servicesPlanet.userData.clouds) this.servicesPlanet.userData.clouds.rotation.y += motionDelta * 0.009;
    const servicePhase = this.serviceHover >= 0 ? this.serviceHover : range(progress, 0.19, 0.39) * 3;
    this.serviceSatellites.forEach((satellite, index) => {
      const active = 1 - Math.min(1, Math.abs(servicePhase - index));
      satellite.scale.setScalar(0.88 + active * 0.24);
      satellite.position.z = satellite.userData.base.z + active * 0.72;
      satellite.userData.material.emissiveIntensity = 0.35 + active * 1.35;
      satellite.rotation.y += motionDelta * (0.06 + active * 0.12);
    });

    const projectsActivity = 1 - range(Math.abs(progress - 0.39), 0.1, 0.2);
    setGroupOpacity(this.projectsGroup, projectsActivity);
    this.projectsPlanet.rotation.y += motionDelta * 0.018;
    if (this.projectsPlanet.userData.clouds) this.projectsPlanet.userData.clouds.rotation.y -= motionDelta * 0.007;
    this.projectRing.rotation.z += motionDelta * 0.018;
    const projectPhase = this.projectHover >= 0 ? this.projectHover : range(progress, 0.39, 0.59) * 2;
    this.projectDocks.forEach((dock, index) => {
      const active = 1 - Math.min(1, Math.abs(projectPhase - index));
      dock.position.z = dock.userData.base.z + active * 1.15;
      dock.scale.setScalar(0.86 + active * 0.16);
      dock.userData.screenMaterial.opacity = (0.4 + active * 0.6) * this.projectsGroup.userData.activity;
    });

    const engineeringActivity = 1 - range(Math.abs(progress - 0.59), 0.1, 0.2);
    setGroupOpacity(this.engineeringGroup, engineeringActivity);
    this.engineeringPlanet.rotation.y += motionDelta * 0.019;
    if (this.engineeringPlanet.userData.clouds) this.engineeringPlanet.userData.clouds.rotation.y += motionDelta * 0.006;
    this.engineeringRings.forEach((ring, index) => {
      ring.rotation.x += motionDelta * (index % 2 ? -0.065 : 0.045);
      ring.rotation.z += motionDelta * (0.02 + index * 0.008);
    });
    this.engineeringPackets.forEach((packet, index) => {
      const angle = motionTime * (0.18 + index * 0.012) + index * 0.87;
      const radius = 5 + (index % 4) * 0.52;
      packet.position.set(Math.cos(angle) * radius, Math.sin(angle * 1.3) * radius * 0.52, Math.sin(angle) * radius * 0.42);
    });

    const processActivity = 1 - range(Math.abs(progress - 0.79), 0.11, 0.21);
    setGroupOpacity(this.processGroup, processActivity);
    this.processPlanet.rotation.y += motionDelta * 0.014;
    if (this.processPlanet.userData.clouds) this.processPlanet.userData.clouds.rotation.y -= motionDelta * 0.006;
    const processPhase = this.processHover >= 0 ? this.processHover : range(progress, 0.79, 1) * 4;
    this.processGates.forEach((gate, index) => {
      const active = 1 - Math.min(1, Math.abs(processPhase - index));
      const complete = index <= Math.floor(processPhase) ? 1 : 0;
      gate.scale.setScalar(0.88 + active * 0.2);
      gate.userData.material.emissiveIntensity = 0.25 + complete * 0.55 + active * 0.9;
      gate.userData.light.opacity = (0.12 + complete * 0.25 + active * 0.55) * this.processGroup.userData.activity;
    });

    const contactActivity = range(progress, 0.82, 0.98);
    setGroupOpacity(this.contactGroup, contactActivity);
    const beaconPulse = 0.9 + Math.sin(motionTime * 1.65) * 0.12;
    this.beaconHead.scale.setScalar(beaconPulse);
    this.beaconBeam.material.opacity = (0.035 + Math.sin(motionTime * 1.2) * 0.012) * this.contactGroup.userData.activity;
    this.beaconBeam.rotation.y += motionDelta * 0.04;
  }

  updateWorld(time, delta) {
    this.params.progress = this.quality.reducedMotion
      ? this.params.targetProgress
      : THREE.MathUtils.damp(this.params.progress, this.params.targetProgress, 7.2, delta);
    this.pointer.lerp(this.pointerTarget, 1 - Math.exp(-delta * 4));
    const progress = this.params.progress;
    const { from, to, local } = getStatePair(progress, this.statePair);
    TMP_POSITION.lerpVectors(from.camera, to.camera, local);
    TMP_TARGET.lerpVectors(from.target, to.target, local);
    if (!this.quality.reducedMotion) {
      TMP_POSITION.x += this.pointer.x * (this.quality.mobile ? 0.06 : 0.28);
      TMP_POSITION.y += this.pointer.y * (this.quality.mobile ? 0.04 : 0.17);
    }
    if (this.quality.mobile) TMP_POSITION.z += 2.5;
    if (this.quality.reducedMotion) {
      this.camera.position.copy(TMP_POSITION);
      this.cameraTarget.copy(TMP_TARGET);
    } else {
      this.camera.position.lerp(TMP_POSITION, 1 - Math.exp(-delta * 5));
      this.cameraTarget.lerp(TMP_TARGET, 1 - Math.exp(-delta * 5));
    }
    this.camera.fov = THREE.MathUtils.lerp(from.fov, to.fov, local) + (this.quality.mobile ? 6 : 0);
    this.camera.updateProjectionMatrix();
    this.camera.lookAt(this.cameraTarget);
    this.updateShip(progress, time, delta);
    this.updateDestinations(progress, time, delta);
    this.stars.position.z = this.camera.position.z * 0.018;
  }

  tick(timestamp) {
    if (this.disposed) return;
    if (this.hidden) {
      this.raf = requestAnimationFrame(this.tick);
      return;
    }
    this.timer.update(timestamp);
    const delta = Math.min(this.timer.getDelta(), 0.05);
    this.time += delta;
    this.updateWorld(this.time, delta);
    this.renderer.render(this.scene, this.camera);
    this.raf = requestAnimationFrame(this.tick);
  }

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    window.removeEventListener("resize", this.onResize);
    window.removeEventListener("pointermove", this.onPointerMove);
    document.removeEventListener("visibilitychange", this.onVisibility);
    this.timer.dispose();
    this.scene.traverse((object) => {
      object.geometry?.dispose?.();
      const materials = object.material ? (Array.isArray(object.material) ? object.material : [object.material]) : [];
      materials.forEach((material) => {
        Object.values(material).forEach((value) => value?.isTexture && value.dispose());
        material.dispose?.();
      });
    });
    this.renderer.dispose();
  }
}
