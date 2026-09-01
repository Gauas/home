import * as THREE from "three";
import { WORLD_STATE_META } from "./WorldStateMeta";

export const WORLD_STATE = Object.freeze({
  LAUNCH: 0,
  SERVICES: 1,
  PROJECTS: 2,
  ENGINEERING: 3,
  PROCESS: 4,
  CONTACT: 5,
});

const spatialStates = [
  { camera: [0, 4.2, 19], target: [0, 0, 0], fov: 42 },
  { camera: [-7.5, 4.2, -13], target: [2.5, 0, -30], fov: 44 },
  { camera: [8.2, 4.4, -43], target: [-2.6, 0, -63], fov: 43 },
  { camera: [-8.2, 5.2, -76], target: [2.7, 0, -96], fov: 45 },
  { camera: [0, 9.4, -108], target: [-2.6, 0, -128], fov: 46 },
  { camera: [0, 5.2, -141], target: [0, 0.5, -160], fov: 43 },
];

export const SCENE_STATES = WORLD_STATE_META.map((state, index) => ({
  ...state,
  ...spatialStates[index],
  camera: new THREE.Vector3(...spatialStates[index].camera),
  target: new THREE.Vector3(...spatialStates[index].target),
}));

export function getStatePair(progress, result = {}) {
  const value = THREE.MathUtils.clamp(progress, 0, 1);
  let index = 0;
  for (let i = 0; i < SCENE_STATES.length - 1; i += 1) {
    if (value >= SCENE_STATES[i].at) index = i;
  }
  const from = SCENE_STATES[index];
  const to = SCENE_STATES[Math.min(index + 1, SCENE_STATES.length - 1)];
  const span = Math.max(0.0001, to.at - from.at);
  const local = THREE.MathUtils.smoothstep((value - from.at) / span, 0, 1);
  result.from = from;
  result.to = to;
  result.local = local;
  result.index = index;
  return result;
}
