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
    id: 'artwork', label: 'Artwork', color: 0xf472b6, glowColor: '#e96bac',
    angle: ANGLES[0], r: NODE_R,
    pos: new THREE.Vector3(NODE_R * Math.cos(ANGLES[0]), randY(), NODE_R * Math.sin(ANGLES[0])),
    desc: 'collections of my artworks.',
    embedFile: 'script/data/art_recent_works.html',
    items: [],
    subNodes: [
      {
        id: 'voxel', label: 'Voxel', color: 0x4ade80, glowColor: '#65f798',
        type: 'image', folder: 'artworks/voxel',
        desc: 'voxel artworks, mainly focused on album cover',
        items: [],
      },
      {
        id: '2d', label: '2D Art', color: 0xf472b6, glowColor: '#e96bac',
        type: 'image', folder: 'artworks/2d',
        desc: '2d artworks - posters, photo arts, etc. ',
        items: [],
      },
    ],
  },
  {
    id: 'programming', label: 'Programming', color: 0x60a5fa, glowColor: '#69a7f3',
    type: 'link',
    angle: ANGLES[1], r: NODE_R,
    pos: new THREE.Vector3(NODE_R * Math.cos(ANGLES[1]), randY(), NODE_R * Math.sin(ANGLES[1])),
    desc: 'personal programming projects',
    jsonFile: 'links/programming.json',
    items: [],
  },
  {
    id: 'music', label: 'Music', color: 0xfbbf24, glowColor: '#f5cc64',
    angle: ANGLES[2], r: NODE_R,
    pos: new THREE.Vector3(NODE_R * Math.cos(ANGLES[2]), randY(), NODE_R * Math.sin(ANGLES[2])),
    desc: 'collection of my music works.\n main genre : electronic / breakbeat / garage',
    items: [],
    embedFile: 'script/data/music_recent_works.html',
    subNodes: [
      {
        id: 'music-releases', label: 'Music Releases', color: 0xfbbf24, glowColor: '#f5cc64',
        type: 'link', jsonFile: 'links/music_releases.json',
        desc: 'officially released works on various platforms.',
        items: [],
      },
      {
        id: 'remixes', label: 'Remixes', color: 0xfbbf24, glowColor: '#f5cc64',
        type: 'link', jsonFile: 'links/music_remixes.json',
        desc: 'remixes (also can be written as bootlegs)',
        items: [],
      },
    ],
  },
  {
    id: 'project', label: 'Project', color: 0xa78bfa, glowColor: '#a78aff',
    type: 'link',
    angle: ANGLES[3], r: NODE_R,
    pos: new THREE.Vector3(NODE_R * Math.cos(ANGLES[3]), randY(), NODE_R * Math.sin(ANGLES[3])),
    desc: 'other personal projects, combined 2 or more aspects as I determined',
    jsonFile: 'links/project.json',
    items: [],
  },
  {
    id: 'inquiries', label: 'Inquiries', color: 0x94a3b8, glowColor: '#94a3b8',
    type: 'text', jsonFile: 'links/inquiries.json',
    angle: ANGLES[4], r: NODE_R,
    pos: new THREE.Vector3(NODE_R * Math.cos(ANGLES[4]), randY(), NODE_R * Math.sin(ANGLES[4])),
    desc: '',
    items: [],
  },
];
