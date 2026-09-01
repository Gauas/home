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
const TMP_MATRIX = new THREE.Matrix4();

const clamp01 = (value) => THREE.MathUtils.clamp(value, 0, 1);
const range = (value, from, to) => clamp01((value - from) / Math.max(0.0001, to - from));

function setGroupOpacity(group, opacity) {
  group.visible = opacity > 0.012;
  group.userData.activity = opacity;
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

function continentalValue(u, v, kind) {
  const latitude = Math.abs(v - 0.5) * 2;
  return fbm(u * 4.2, v * 4.2, PLANET_SEEDS[kind]) + Math.sin(u * Math.PI * 6 + v * 4.2) * 0.045 - latitude * 0.025;
}

function createHabitableDirections(kind, count, phase = 0) {
  const directions = [];
  for (let index = 0; index < 1400 && directions.length < count; index += 1) {
    const y = 1 - 2 * ((index + 0.5) / 1400);
    const angle = index * 2.399963 + phase;
    const radial = Math.sqrt(Math.max(0, 1 - y * y));
    const direction = new THREE.Vector3(Math.cos(angle) * radial, y, Math.sin(angle) * radial);
    const u = ((Math.atan2(direction.z, -direction.x) / (Math.PI * 2)) % 1 + 1) % 1;
    const v = Math.acos(THREE.MathUtils.clamp(direction.y, -1, 1)) / Math.PI;
    if (continentalValue(u, v, kind) > 0.69) directions.push(direction);
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

  for (let y = 0; y < canvas.height; y += 1) {
    const v = y / canvas.height;
    const latitude = Math.abs(v - 0.5) * 2;
    for (let x = 0; x < canvas.width; x += 1) {
      const u = x / canvas.width;
      const broad = fbm(u * 4.2, v * 4.2, seed);
      const detail = fbm(u * 15.5, v * 15.5, seed + 5.3);
      const continental = broad + Math.sin(u * Math.PI * 6 + v * 4.2) * 0.045 - latitude * 0.025;
      const index = (y * canvas.width + x) * 4;
      let color;
      let elevation;
      if (kind === "earth") {
        if (latitude > 0.91) color = [220, 232, 231];
        else if (continental > 0.67) color = detail > 0.62 ? [92, 111, 65] : [48, 101, 66];
        else if (continental > 0.63) color = [180, 167, 105];
        else if (continental > 0.585) color = [30, 126, 161];
        else color = detail > 0.62 ? [25, 104, 151] : [11, 61, 113];
      } else if (kind === "mars") {
        if (latitude > 0.93) color = [232, 218, 194];
        else if (continental > 0.68) color = detail > 0.61 ? [104, 114, 62] : [166, 72, 46];
        else if (continental > 0.63) color = [199, 117, 73];
        else if (continental > 0.585) color = [37, 126, 132];
        else color = detail > 0.63 ? [20, 91, 105] : [10, 54, 74];
      } else if (kind === "engineering") {
        if (latitude > 0.93) color = [174, 216, 218];
        else if (continental > 0.68) color = detail > 0.61 ? [52, 112, 95] : [58, 76, 82];
        else if (continental > 0.63) color = [82, 126, 125];
        else if (continental > 0.585) color = [23, 110, 133];
        else color = detail > 0.62 ? [14, 70, 93] : [7, 38, 62];
      } else {
        if (latitude > 0.93) color = [238, 226, 183];
        else if (continental > 0.68) color = detail > 0.61 ? [103, 124, 64] : [157, 122, 52];
        else if (continental > 0.63) color = [202, 165, 76];
        else if (continental > 0.585) color = [41, 112, 127];
        else color = detail > 0.62 ? [25, 73, 111] : [16, 43, 85];
      }
      if (continental > 0.68) elevation = 145 + detail * 88;
      else if (continental > 0.63) elevation = 104 + ((continental - 0.63) / 0.05) * 34;
      else if (continental > 0.585) elevation = 48 + ((continental - 0.585) / 0.045) * 38;
      else elevation = 28 + detail * 13;
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

  if (kind === "mars") {
    const craters = [[0.14, 0.3, 0.035], [0.32, 0.68, 0.052], [0.55, 0.38, 0.025], [0.72, 0.62, 0.06], [0.87, 0.26, 0.042], [0.94, 0.76, 0.024]];
    craters.forEach(([x, y, radius]) => {
      const gradient = context.createRadialGradient(x * canvas.width, y * canvas.height, radius * canvas.width * 0.25, x * canvas.width, y * canvas.height, radius * canvas.width);
      gradient.addColorStop(0, "rgba(58,18,14,.72)");
      gradient.addColorStop(0.58, "rgba(79,27,18,.48)");
      gradient.addColorStop(0.78, "rgba(226,111,67,.42)");
      gradient.addColorStop(1, "rgba(0,0,0,0)");
      context.fillStyle = gradient;
      context.beginPath();
      context.ellipse(x * canvas.width, y * canvas.height, radius * canvas.width, radius * canvas.width * 0.48, 0, 0, Math.PI * 2);
      context.fill();
    });
  }

  if (kind === "engineering") {
    context.strokeStyle = "rgba(104,205,220,.22)";
    context.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += canvas.width / 32) {
      context.beginPath(); context.moveTo(x, 0); context.lineTo(x, canvas.height); context.stroke();
    }
    for (let y = 0; y < canvas.height; y += canvas.height / 16) {
      context.beginPath(); context.moveTo(0, y); context.lineTo(canvas.width, y); context.stroke();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  const heightTexture = new THREE.CanvasTexture(heightCanvas);
  heightTexture.wrapS = THREE.RepeatWrapping;
  return { map: texture, height: heightTexture };
}

function createCloudTexture(width = 512) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = width / 2;
  const context = canvas.getContext("2d");
  const image = context.createImageData(canvas.width, canvas.height);
  for (let y = 0; y < canvas.height; y += 1) {
    for (let x = 0; x < canvas.width; x += 1) {
      const cloud = fbm(x / canvas.width * 11, y / canvas.height * 7, 31.4);
      const alpha = cloud > 0.69 ? Math.min(155, (cloud - 0.69) * 720) : 0;
      const index = (y * canvas.width + x) * 4;
      image.data[index] = 235;
      image.data[index + 1] = 243;
      image.data[index + 2] = 248;
      image.data[index + 3] = alpha;
    }
  }
  context.putImageData(image, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  return texture;
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
      metalness: options.metalness ?? 0.18,
      roughness: options.roughness ?? 0.76,
    }),
  );
  group.add(surface);
  const grid = new THREE.Mesh(
    new THREE.SphereGeometry(radius * 1.012, Math.max(16, Math.floor(segments * 0.55)), 14),
    new THREE.MeshBasicMaterial({ color: options.grid ?? 0x496fd8, wireframe: true, transparent: true, opacity: options.gridOpacity ?? 0.065 }),
  );
  group.add(grid);
  const atmosphere = new THREE.Mesh(
    new THREE.SphereGeometry(radius * 1.055, segments, Math.max(16, Math.floor(segments * 0.66))),
    new THREE.MeshBasicMaterial({ color: options.atmosphere ?? 0x315dff, transparent: true, opacity: options.atmosphereOpacity ?? 0.055, side: THREE.BackSide }),
  );
  group.add(atmosphere);
  if (options.clouds) {
    const cloudTexture = createCloudTexture(Math.min(512, options.textureSize || 512));
    const clouds = new THREE.Mesh(
      new THREE.SphereGeometry(radius * 1.025, segments, Math.max(16, Math.floor(segments * 0.66))),
      new THREE.MeshStandardMaterial({ map: cloudTexture, transparent: true, opacity: 0.58, depthWrite: false, roughness: 1 }),
    );
    group.add(clouds);
    group.userData.clouds = clouds;
  }
  group.userData.surface = surface;
  group.userData.grid = grid;
  return group;
}

function addSurfaceInstances(group, directions, radius, geometry, material, scale) {
  const mesh = new THREE.InstancedMesh(geometry, material, directions.length);
  directions.forEach((direction, index) => {
    TMP_NORMAL.copy(direction).normalize();
    TMP_OBJECT.position.copy(TMP_NORMAL).multiplyScalar(radius);
    TMP_OBJECT.quaternion.setFromUnitVectors(UP, TMP_NORMAL);
    TMP_OBJECT.scale.set(...scale);
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
    this.clock = new THREE.Clock();
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
      this.launchLights.push(pylon.material);
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
      bumpScale: 0.075,
      clouds: this.quality.name !== "LOW",
      atmosphere: 0x69b7ff,
      atmosphereOpacity: 0.085,
      grid: 0x8cc8ff,
      gridOpacity: 0.045,
      roughness: 0.82,
    });
    group.add(this.servicesPlanet);

    const treeDirections = createHabitableDirections("earth", 10, 0.4);
    addSurfaceInstances(this.servicesPlanet, treeDirections, 4.36, new THREE.CylinderGeometry(0.5, 0.65, 1, 6), new THREE.MeshStandardMaterial({ color: 0x6b4b32, roughness: 1 }), [0.085, 0.25, 0.085]);
    addSurfaceInstances(this.servicesPlanet, treeDirections, 4.64, new THREE.ConeGeometry(0.65, 1.4, 8), new THREE.MeshStandardMaterial({ color: 0x5b9a61, roughness: 0.94 }), [0.22, 0.31, 0.22]);

    const cityDirections = createHabitableDirections("earth", 4, 3.1);
    addSurfaceInstances(this.servicesPlanet, cityDirections, 4.48, new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ color: 0xe6e1d3, metalness: 0.1, roughness: 0.72 }), [0.22, 0.42, 0.22]);
    addSurfaceInstances(this.servicesPlanet, cityDirections, 4.91, new THREE.ConeGeometry(0.72, 0.65, 4), new THREE.MeshStandardMaterial({ color: 0xc76f42, roughness: 0.8 }), [0.28, 0.24, 0.28]);

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
      bumpScale: 0.105,
      clouds: this.quality.name !== "LOW",
      atmosphere: 0xe5683c,
      atmosphereOpacity: 0.065,
      grid: 0xe79868,
      gridOpacity: 0.04,
      roughness: 0.91,
    });
    this.projectsPlanet = planet;
    group.add(planet);
    const colonyDirections = createHabitableDirections("mars", 3, 1.7);
    addSurfaceInstances(planet, colonyDirections, 3.72, new THREE.CylinderGeometry(0.8, 1, 1, 10), new THREE.MeshStandardMaterial({ color: 0xe0c5a5, metalness: 0.42, roughness: 0.48 }), [0.28, 0.28, 0.28]);
    addSurfaceInstances(planet, colonyDirections, 4.02, new THREE.SphereGeometry(0.5, 14, 8), new THREE.MeshPhysicalMaterial({ color: 0x80b8d7, transparent: true, opacity: 0.72, roughness: 0.16, metalness: 0.08 }), [0.34, 0.18, 0.34]);
    const coralGroveDirections = createHabitableDirections("mars", 8, 4.8);
    addSurfaceInstances(planet, coralGroveDirections, 3.69, new THREE.CylinderGeometry(0.45, 0.62, 1, 7), new THREE.MeshStandardMaterial({ color: 0x70432f, roughness: 1 }), [0.07, 0.2, 0.07]);
    addSurfaceInstances(planet, coralGroveDirections, 3.92, new THREE.IcosahedronGeometry(0.45, 1), new THREE.MeshStandardMaterial({ color: 0x8fa25b, roughness: 0.92 }), [0.24, 0.3, 0.24]);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(6.1, 0.23, 10, 128), this.materials.metal);
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
      bumpScale: 0.065,
      clouds: this.quality.name !== "LOW",
      atmosphere: 0x58c4d7,
      atmosphereOpacity: 0.055,
      grid: 0x66c7d6,
      gridOpacity: 0.085,
      metalness: 0.58,
      roughness: 0.48,
    });
    group.add(this.engineeringPlanet);
    const technoGroveDirections = createHabitableDirections("engineering", 6, 2.4);
    addSurfaceInstances(this.engineeringPlanet, technoGroveDirections, 4.52, new THREE.CylinderGeometry(0.5, 0.65, 1, 8), new THREE.MeshStandardMaterial({ color: 0x315e58, roughness: 0.88 }), [0.08, 0.24, 0.08]);
    addSurfaceInstances(this.engineeringPlanet, technoGroveDirections, 4.78, new THREE.IcosahedronGeometry(0.48, 2), new THREE.MeshStandardMaterial({ color: 0x55a58f, metalness: 0.18, roughness: 0.7 }), [0.24, 0.28, 0.24]);
    this.engineeringRings = [];
    for (let i = 0; i < 4; i += 1) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(5 + i * 0.52, 0.055 + i * 0.014, 8, 128), i === 2 ? this.materials.blueMetal : this.materials.metal);
      ring.rotation.set(i * 0.56, i * 0.42, i * 0.2);
      group.add(ring);
      this.engineeringRings.push(ring);
    }
    const moduleCount = this.quality.mobile ? 18 : 34;
    const geometry = new THREE.CapsuleGeometry(0.14, 0.32, 4, 8);
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
      bumpScale: 0.08,
      clouds: this.quality.name !== "LOW",
      atmosphere: 0xe2bb64,
      atmosphereOpacity: 0.05,
      grid: 0xd8b762,
      gridOpacity: 0.08,
      metalness: 0.3,
      roughness: 0.66,
    });
    this.processPlanet = center;
    group.add(center);
    const goldenGroveDirections = createHabitableDirections("mineral", 5, 0.9);
    addSurfaceInstances(center, goldenGroveDirections, 2.23, new THREE.CylinderGeometry(0.4, 0.58, 1, 7), new THREE.MeshStandardMaterial({ color: 0x654b2a, roughness: 1 }), [0.065, 0.18, 0.065]);
    addSurfaceInstances(center, goldenGroveDirections, 2.43, new THREE.IcosahedronGeometry(0.38, 1), new THREE.MeshStandardMaterial({ color: 0xa4ad62, roughness: 0.9 }), [0.2, 0.25, 0.2]);
    const processSettlements = createHabitableDirections("mineral", 2, 3.7);
    addSurfaceInstances(center, processSettlements, 2.27, new THREE.CylinderGeometry(0.65, 0.85, 1, 10), new THREE.MeshStandardMaterial({ color: 0xe1c778, metalness: 0.35, roughness: 0.52 }), [0.18, 0.26, 0.18]);
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
      if (!this.hidden) this.clock.getDelta();
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
    this.ship.position.lerp(TMP_POSITION, 1 - Math.exp(-delta * 8));
    TMP_QUATERNION.setFromUnitVectors(FORWARD, TMP_DIRECTION);
    const bank = this.quality.reducedMotion ? 0 : Math.sin(progress * Math.PI * 7) * 0.075;
    TMP_BANK_QUATERNION.setFromAxisAngle(FORWARD, bank);
    TMP_QUATERNION.multiply(TMP_BANK_QUATERNION);
    this.ship.quaternion.slerp(TMP_QUATERNION, 1 - Math.exp(-delta * 5));
    const introScale = 0.62 + this.params.intro * 0.38;
    this.ship.scale.setScalar((this.quality.mobile ? 0.72 : 0.9) * introScale);
    this.ship.visible = this.params.intro > 0.04;
    const pulse = 0.86 + Math.sin(time * 3.8) * 0.1 + Math.sin(progress * Math.PI * 6) * 0.08;
    this.engineGlows.forEach((glow) => glow.scale.setScalar(pulse));
    this.followLight.position.copy(this.ship.position).addScaledVector(TMP_DIRECTION, -1.4);
    this.routeCurve.getPointAt(Math.max(0, routeT - 0.012), this.routeSignal.position);
  }

  updateDestinations(progress, time, delta) {
    const launchActivity = 1 - range(Math.abs(progress - 0.02), 0.08, 0.2);
    setGroupOpacity(this.launchStation, launchActivity);
    this.launchLights.forEach((material, index) => {
      material.emissiveIntensity = this.params.intro * (0.45 + Math.sin(time * 2.2 + index) * 0.15);
    });

    const servicesActivity = 1 - range(Math.abs(progress - 0.19), 0.1, 0.19);
    setGroupOpacity(this.servicesGroup, servicesActivity);
    this.servicesPlanet.rotation.y += delta * 0.027;
    this.servicesPlanet.userData.grid.rotation.y -= delta * 0.012;
    if (this.servicesPlanet.userData.clouds) this.servicesPlanet.userData.clouds.rotation.y += delta * 0.009;
    const servicePhase = this.serviceHover >= 0 ? this.serviceHover : range(progress, 0.1, 0.3) * 3;
    this.serviceSatellites.forEach((satellite, index) => {
      const active = 1 - Math.min(1, Math.abs(servicePhase - index));
      satellite.scale.setScalar(0.88 + active * 0.24);
      satellite.position.z = satellite.userData.base.z + active * 0.72;
      satellite.userData.material.emissiveIntensity = 0.35 + active * 1.35;
      satellite.rotation.y += delta * (0.06 + active * 0.12);
    });

    const projectsActivity = 1 - range(Math.abs(progress - 0.39), 0.1, 0.2);
    setGroupOpacity(this.projectsGroup, projectsActivity);
    this.projectsPlanet.rotation.y += delta * 0.018;
    if (this.projectsPlanet.userData.clouds) this.projectsPlanet.userData.clouds.rotation.y -= delta * 0.007;
    this.projectRing.rotation.z += delta * 0.018;
    const projectPhase = this.projectHover >= 0 ? this.projectHover : range(progress, 0.3, 0.5) * 2;
    this.projectDocks.forEach((dock, index) => {
      const active = 1 - Math.min(1, Math.abs(projectPhase - index));
      dock.position.z = dock.userData.base.z + active * 1.15;
      dock.scale.setScalar(0.86 + active * 0.16);
      dock.userData.screenMaterial.opacity = 0.4 + active * 0.6;
    });

    const engineeringActivity = 1 - range(Math.abs(progress - 0.59), 0.1, 0.2);
    setGroupOpacity(this.engineeringGroup, engineeringActivity);
    this.engineeringPlanet.rotation.y += delta * 0.019;
    if (this.engineeringPlanet.userData.clouds) this.engineeringPlanet.userData.clouds.rotation.y += delta * 0.006;
    this.engineeringRings.forEach((ring, index) => {
      ring.rotation.x += delta * (index % 2 ? -0.065 : 0.045);
      ring.rotation.z += delta * (0.02 + index * 0.008);
    });
    this.engineeringPackets.forEach((packet, index) => {
      const angle = time * (0.18 + index * 0.012) + index * 0.87;
      const radius = 5 + (index % 4) * 0.52;
      packet.position.set(Math.cos(angle) * radius, Math.sin(angle * 1.3) * radius * 0.52, Math.sin(angle) * radius * 0.42);
    });

    const processActivity = 1 - range(Math.abs(progress - 0.79), 0.11, 0.21);
    setGroupOpacity(this.processGroup, processActivity);
    this.processPlanet.rotation.y += delta * 0.014;
    if (this.processPlanet.userData.clouds) this.processPlanet.userData.clouds.rotation.y -= delta * 0.006;
    const processPhase = this.processHover >= 0 ? this.processHover : range(progress, 0.69, 0.9) * 4;
    this.processGates.forEach((gate, index) => {
      const active = 1 - Math.min(1, Math.abs(processPhase - index));
      const complete = index <= Math.floor(processPhase) ? 1 : 0;
      gate.scale.setScalar(0.88 + active * 0.2);
      gate.userData.material.emissiveIntensity = 0.25 + complete * 0.55 + active * 0.9;
      gate.userData.light.opacity = 0.12 + complete * 0.25 + active * 0.55;
    });

    const contactActivity = range(progress, 0.82, 0.98);
    setGroupOpacity(this.contactGroup, contactActivity);
    const beaconPulse = 0.9 + Math.sin(time * 1.65) * 0.12;
    this.beaconHead.scale.setScalar(beaconPulse);
    this.beaconBeam.material.opacity = (0.035 + Math.sin(time * 1.2) * 0.012) * contactActivity;
    this.beaconBeam.rotation.y += delta * 0.04;
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
    this.camera.position.lerp(TMP_POSITION, 1 - Math.exp(-delta * 5));
    this.cameraTarget.lerp(TMP_TARGET, 1 - Math.exp(-delta * 5));
    this.camera.fov = THREE.MathUtils.lerp(from.fov, to.fov, local) + (this.quality.mobile ? 6 : 0);
    this.camera.updateProjectionMatrix();
    this.camera.lookAt(this.cameraTarget);
    this.updateShip(progress, time, delta);
    this.updateDestinations(progress, time, delta);
    this.stars.position.z = this.camera.position.z * 0.018;
  }

  tick() {
    if (this.disposed) return;
    if (this.hidden) {
      this.raf = requestAnimationFrame(this.tick);
      return;
    }
    const delta = Math.min(this.clock.getDelta(), 0.05);
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
