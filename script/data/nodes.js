import * as THREE from 'three';

const NODE_R         = 6.0;
const CY             = 0.7;
const Y_ROTATE_RANGE = 5;
const Y_TILT         = NODE_R * Math.sin(THREE.MathUtils.degToRad(Y_ROTATE_RANGE));

function randInRange(a, b) { return a + Math.random() * (b - a); }
function randY()            { return CY + (Math.random() * 2 - 1) * Y_TILT; }

const ANGLES = [
  0,
  72  + randInRange(-Y_ROTATE_RANGE, Y_ROTATE_RANGE),
  144 + randInRange(-Y_ROTATE_RANGE, Y_ROTATE_RANGE),
  216 + randInRange(-Y_ROTATE_RANGE, Y_ROTATE_RANGE),
  288 + randInRange(-Y_ROTATE_RANGE, Y_ROTATE_RANGE),
].map(d => THREE.MathUtils.degToRad(d));

export const NODE_R_EXPORT = NODE_R;

export const NODES = [
  {
    id: 'voxel', label: 'Voxel', color: 0x4ade80, glowColor: '#65f798',
    folder: 'voxel',
    angle: ANGLES[0], r: NODE_R,
    pos: new THREE.Vector3(NODE_R * Math.cos(ANGLES[0]), randY(), NODE_R * Math.sin(ANGLES[0])),
    desc: '복셀 기반의 아트워크입니다.',
    items: [
    ],
  },
  {
    id: '2d', label: '2D Art', color: 0xf472b6, glowColor: '#e96bac',
    folder: '2d',
    angle: ANGLES[1], r: NODE_R,
    pos: new THREE.Vector3(NODE_R * Math.cos(ANGLES[1]), randY(), NODE_R * Math.sin(ANGLES[1])),
    desc: '포스터 및 사진과 관련된 작업물입니다.',
    items: [
    ],
  },
  {
    id: 'programming', label: 'Programming', color: 0x60a5fa, glowColor: '#69a7f3',
    angle: ANGLES[2], r: NODE_R,
    pos: new THREE.Vector3(NODE_R * Math.cos(ANGLES[2]), randY(), NODE_R * Math.sin(ANGLES[2])),
    desc: '개발 프로젝트 및 툴 작업물입니다.',
    items: [
    ],
  },
  {
    id: 'music', label: 'Music', color: 0xfbbf24, glowColor: '#f5cc64',
    angle: ANGLES[3], r: NODE_R,
    pos: new THREE.Vector3(NODE_R * Math.cos(ANGLES[3]), randY(), NODE_R * Math.sin(ANGLES[3])),
    desc: '작곡 및 사운드 디자인 작업물입니다.',
    items: [],
  },
  {
    id: 'experience', label: 'Experience', color: 0xa78bfa, glowColor: '#a78aff',
    angle: ANGLES[4], r: NODE_R,
    pos: new THREE.Vector3(NODE_R * Math.cos(ANGLES[4]), randY(), NODE_R * Math.sin(ANGLES[4])),
    desc: '전체 경력입니다.',
    items: [
    ],
  },
];
