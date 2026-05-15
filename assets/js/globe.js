// Lost Lands — globe with the NASA Blue Marble texture and hover overlays
// for the historical territorial extent of each lost state.
//
// The boundary polygons are hand-encoded approximations of each state's
// peak territorial extent, triangulated with THREE.ShapeUtils so concave
// shapes (the Mediterranean coastline, the Adriatic, etc.) render
// correctly rather than via fan triangulation.

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const container = document.getElementById('globe-canvas');
const tooltip   = document.getElementById('globe-tooltip');
if (!container) { /* page does not include the globe */ } else {

  // ===== Volume markers =====
  // Marker = a representative central point inside the historical state.
  const VOLUMES = [
    { id: 'prussia',          name: 'Prussia',                       lat: 52.52, lon:  13.40, href: 'prussia/index.html'          },
    { id: 'ottoman',          name: 'The Ottoman Empire',            lat: 41.01, lon:  28.97, href: 'ottoman/index.html'          },
    { id: 'east-germany',     name: 'East Germany',                  lat: 51.34, lon:  12.37, href: 'east-germany/index.html'     },
    { id: 'yugoslavia',       name: 'Yugoslavia',                    lat: 44.81, lon:  20.46, href: 'yugoslavia/index.html'       },
    { id: 'persia',           name: 'Persia',                        lat: 32.66, lon:  51.68, href: 'persia/index.html'           },
    { id: 'soviet-union',     name: 'The Soviet Union',              lat: 55.75, lon:  37.62, href: 'soviet-union/index.html'     },
    { id: 'inca',             name: 'The Inca Empire',               lat: -13.52,lon: -71.97, href: 'inca/index.html'             },
    { id: 'congo-free-state', name: 'The Congo Free State',          lat: -4.32, lon:  15.32, href: 'congo-free-state/index.html' },
    { id: 'rome',             name: 'The Roman Empire',              lat: 41.90, lon:  12.50, href: 'rome/index.html'             },
    { id: 'cordoba',          name: 'The Caliphate of Córdoba',      lat: 37.88, lon:  -4.78, href: 'cordoba/index.html'          },
    { id: 'green-ukraine',    name: 'Green Ukraine',                 lat: 48.48, lon: 135.08, href: 'green-ukraine/index.html'    },
    { id: 'jerusalem',        name: 'The Kingdom of Jerusalem',      lat: 31.78, lon:  35.21, href: 'jerusalem/index.html'        },
  ];

  // ===== Approximate territorial boundary polygons =====
  // Each polygon is an ordered list of [lat, lon] vertices outlining the
  // state at its peak extent. Vertices are wound counter-clockwise (so
  // the polygon's interior is to the left as you walk the boundary).
  // These are intentional simplifications: ~25–60 vertices per state.
  const SHAPES = {
    // Kingdom of Prussia (post-1866, pre-1918).
    'prussia': [
      [55.7, 21.0], [54.9, 22.7], [54.0, 23.2], [53.5, 23.5], [53.0, 23.5],
      [52.4, 23.2], [52.0, 21.0], [51.5, 18.5], [50.6, 19.2], [50.2, 17.5],
      [50.5, 16.0], [50.7, 15.0], [51.0, 14.7], [50.8, 13.0], [50.6, 11.5],
      [50.4, 10.5], [50.5,  9.0], [50.2,  8.4], [49.7,  6.7], [50.1,  6.1],
      [50.8,  6.0], [51.5,  5.9], [52.0,  6.5], [52.6,  6.7], [53.2,  7.0],
      [53.5,  7.2], [53.6,  8.5], [53.9,  9.2], [54.0,  9.7], [54.9,  8.3],
      [54.9, 11.0], [54.5, 12.5], [54.3, 13.7], [53.9, 14.3], [54.4, 16.5],
      [54.4, 18.7], [54.7, 19.7], [55.0, 20.7],
    ],

    // Ottoman Empire (peak ~1683, simplified to a single contiguous
    // contour — North African vassal states omitted for legibility).
    'ottoman': [
      [47.8, 18.5], [48.0, 22.0], [47.5, 25.0], [47.0, 27.5], [46.0, 30.0],
      [46.5, 32.5], [45.4, 34.0], [44.5, 35.5], [44.0, 36.5], [43.5, 39.5],
      [41.6, 41.5], [41.0, 43.5], [39.7, 44.5], [38.5, 44.6], [37.5, 46.3],
      [36.5, 45.5], [35.0, 45.0], [33.5, 44.5], [32.0, 44.0], [30.5, 47.0],
      [30.0, 48.0], [29.5, 47.6], [28.0, 48.5], [26.0, 50.0], [24.0, 51.0],
      [21.5, 50.0], [18.0, 50.0], [16.0, 49.0], [14.5, 47.0], [13.0, 44.0],
      [12.7, 43.5], [16.0, 41.5], [17.5, 39.0], [21.0, 36.0], [24.0, 35.0],
      [28.0, 34.0], [31.5, 31.5], [31.5, 26.5], [31.0, 25.0], [30.5, 19.5],
      [33.0, 11.5], [36.5, 11.0], [37.5, 10.0], [37.0,  3.0], [36.5,  0.5],
      [36.8, -2.0], [36.0, -2.5], [36.4,  4.5], [37.5, 11.0], [39.5, 18.0],
      [40.5, 19.5], [41.5, 19.5], [42.5, 18.5], [43.0, 17.5], [44.5, 16.0],
      [45.7, 16.5], [46.3, 16.5], [46.5, 17.5], [47.0, 18.0],
    ],

    // German Democratic Republic (1949-1990).
    'east-germany': [
      [54.7, 14.3], [53.9, 14.3], [53.0, 14.4], [52.5, 14.7], [52.3, 14.6],
      [52.0, 14.7], [51.7, 14.7], [51.6, 15.0], [51.4, 14.95], [51.0, 14.9],
      [51.0, 14.6], [50.9, 14.3], [50.85, 14.05], [50.78, 14.4], [50.75, 14.0],
      [50.3, 12.4], [50.2, 12.0], [50.4, 11.4], [50.4, 10.5], [50.6, 10.0],
      [50.9, 10.3], [51.0, 10.2], [51.3, 10.0], [51.5,  9.9], [51.6, 10.2],
      [51.9, 10.6], [52.0, 11.1], [52.3, 11.0], [52.7, 10.9], [53.2, 10.7],
      [53.4, 10.6], [53.7, 11.2], [53.9, 11.5], [54.0, 12.0], [54.2, 13.0],
      [54.5, 13.2], [54.6, 14.0],
    ],

    // Socialist Federal Republic of Yugoslavia (1945-1991).
    'yugoslavia': [
      [46.88, 13.40], [46.70, 14.50], [46.55, 16.10], [46.45, 16.50], [46.40, 18.90],
      [46.20, 19.40], [45.80, 20.10], [45.45, 20.80], [44.90, 22.65], [44.55, 22.55],
      [44.20, 22.40], [43.70, 22.50], [43.25, 22.75], [42.80, 22.90], [42.30, 22.40],
      [42.00, 22.20], [41.80, 21.50], [41.30, 20.80], [40.85, 20.55], [40.55, 19.30],
      [41.85, 19.40], [42.40, 18.55], [42.95, 17.65], [43.30, 17.05], [43.55, 16.35],
      [43.80, 15.95], [44.40, 14.90], [44.85, 14.20], [45.10, 14.55], [45.65, 13.65],
      [45.85, 13.50],
    ],

    // Persia, Achaemenid extent (~480 BC under Darius I).
    'persia': [
      [42.50, 28.50], [41.50, 33.50], [42.20, 38.00], [41.50, 42.00], [40.50, 45.00],
      [39.50, 48.00], [38.50, 51.50], [38.00, 55.00], [37.00, 58.00], [37.00, 62.00],
      [37.50, 66.00], [37.00, 69.50], [36.50, 72.00], [34.50, 74.00], [32.00, 73.50],
      [29.00, 72.00], [26.50, 68.00], [25.30, 64.00], [25.30, 60.00], [25.30, 57.00],
      [26.00, 53.50], [27.50, 51.50], [29.50, 49.50], [30.00, 47.50], [30.00, 45.50],
      [30.00, 43.00], [29.50, 41.00], [27.50, 39.00], [25.50, 36.50], [24.00, 34.00],
      [25.50, 32.50], [28.00, 31.50], [30.50, 30.50], [32.50, 29.50], [34.50, 28.50],
      [36.50, 28.20], [38.50, 27.50], [40.50, 27.50],
    ],

    // Soviet Union (1945-1991), simplified outer contour.
    'soviet-union': [
      [69.0, 30.0], [69.0, 41.0], [73.5, 53.0], [76.0, 65.0], [77.5, 100.0], [76.0, 113.0],
      [73.5, 130.0], [72.0, 142.0], [69.5, 161.0], [66.0, 170.0], [62.0, 179.0],
      [60.0, 170.0], [55.0, 162.0], [50.0, 156.5], [46.0, 142.0], [42.5, 133.0],
      [42.0, 130.0], [44.0, 128.0], [46.0, 124.0], [48.0, 121.0], [49.0, 117.0],
      [50.5, 115.0], [50.5, 109.0], [52.0, 102.0], [50.0,  88.0], [47.5,  85.5],
      [45.5,  82.5], [44.0,  79.5], [42.5,  78.5], [40.0,  74.0], [37.5,  68.0],
      [37.0,  62.0], [38.0,  55.0], [40.0,  50.5], [41.5,  47.5], [44.0,  47.5],
      [45.5,  41.0], [45.0,  38.0], [43.5,  37.0], [44.5,  35.0], [45.5,  32.5],
      [46.0,  30.5], [47.5,  29.5], [49.0,  29.0], [50.5,  27.5], [52.5,  23.5],
      [54.3,  22.0], [56.0,  21.0], [57.5,  22.5], [59.0,  25.5], [59.5,  28.0],
      [60.7,  28.6], [62.0,  29.0], [64.5,  30.0], [67.0,  29.0], [68.5,  28.5],
    ],

    // Inca Empire at Atahualpa's death (1532). Andean spine from Pasto
    // (Colombia) to the Maule river (central Chile).
    'inca': [
      [ 1.20, -77.00], [ 0.80, -77.50], [-0.50, -78.10], [-1.80, -78.50], [-2.90, -79.00],
      [-4.20, -80.30], [-5.50, -80.70], [-6.80, -79.50], [-8.20, -78.80], [-9.50, -78.20],
      [-11.0, -77.50], [-12.5, -76.80], [-14.0, -76.10], [-15.6, -75.20], [-17.0, -73.10],
      [-18.5, -70.50], [-21.0, -70.40], [-24.5, -70.50], [-27.5, -71.00], [-31.0, -71.50],
      [-34.5, -71.60], [-36.0, -71.40], [-35.5, -69.50], [-32.5, -68.30], [-28.5, -66.50],
      [-24.5, -65.20], [-22.5, -64.50], [-20.5, -65.10], [-18.5, -65.50], [-16.5, -67.00],
      [-15.0, -69.00], [-13.5, -71.00], [-11.5, -73.00], [ -9.5, -74.50], [ -7.0, -76.00],
      [ -4.5, -77.50], [ -2.0, -77.20], [ 0.20, -76.60],
    ],

    // Congo Free State (1885-1908). Outline equivalent to modern DR Congo.
    'congo-free-state': [
      [ 5.20, 18.00], [ 5.00, 19.50], [ 4.50, 22.00], [ 4.80, 24.50], [ 4.30, 26.50],
      [ 3.30, 28.50], [ 1.50, 30.00], [-0.20, 29.50], [-1.30, 29.20], [-2.30, 29.00],
      [-3.30, 29.20], [-4.30, 28.90], [-4.90, 29.20], [-5.80, 29.50], [-7.00, 29.20],
      [-8.50, 28.80], [-9.50, 28.40], [-10.5, 28.80], [-11.5, 29.00], [-12.5, 29.50],
      [-13.4, 29.80], [-13.0, 28.00], [-12.0, 26.00], [-11.0, 24.00], [-10.0, 22.00],
      [ -8.5, 21.50], [ -7.0, 20.50], [ -6.0, 19.50], [ -5.5, 16.50], [ -5.0, 14.00],
      [ -5.50, 13.50], [ -5.20, 12.20], [ -4.50, 12.30], [ -4.20, 13.30], [ -3.50, 16.00],
      [ -2.50, 17.00], [ -1.00, 17.30], [  0.50, 16.50], [  1.80, 16.00], [  3.20, 16.50],
      [  4.00, 17.00], [  4.80, 17.50],
    ],

    // Roman Empire at the death of Trajan (117 AD), simplified.
    'rome': [
      [55.0, -2.0], [54.5,  1.0], [54.5,  4.5], [53.0,  6.0], [50.0,  6.5], [49.0,  8.0],
      [48.0, 10.0], [48.5, 13.0], [48.0, 16.0], [47.5, 18.5], [46.0, 22.0], [45.0, 25.0],
      [45.5, 27.5], [45.0, 30.0], [44.0, 31.5], [42.5, 32.5], [41.0, 36.0], [40.0, 39.5],
      [39.0, 41.5], [37.5, 44.5], [35.5, 45.0], [33.0, 44.0], [31.5, 41.5], [30.5, 38.0],
      [30.5, 36.0], [31.0, 34.0], [31.5, 32.0], [30.5, 31.5], [30.0, 27.5], [29.0, 25.0],
      [27.5, 22.0], [25.5, 19.0], [22.5, 14.0], [23.0, 11.0], [25.0,  9.0], [29.5, 10.0],
      [32.5,  9.5], [35.0,  6.0], [36.5,  3.0], [35.5, -0.5], [35.0, -3.0], [35.5, -5.5],
      [36.5, -7.5], [37.5, -9.0], [40.0, -9.5], [42.0, -9.5], [43.5, -8.5], [45.5, -1.5],
      [48.0, -4.5], [50.0, -4.5], [51.0, -4.0], [54.0, -3.5],
    ],

    // Caliphate of Córdoba at peak (~1000 AD). Most of the Iberian
    // peninsula except the Christian north-west (Asturias / León).
    'cordoba': [
      [43.5, -8.7], [43.4, -7.5], [42.9, -7.0], [42.7, -5.8], [43.0, -4.5],
      [43.2, -3.5], [43.4, -2.5], [43.4, -1.5], [42.5, -0.5], [42.5,  1.5],
      [42.5,  3.2], [41.6,  3.0], [40.5,  0.5], [39.5,  0.0], [38.7, -0.5],
      [37.6, -0.9], [36.7, -2.1], [36.0, -3.7], [36.0, -5.5], [36.5, -6.5],
      [37.1, -8.5], [38.7, -9.2], [40.0, -9.0], [41.5, -8.8], [42.5, -9.2],
    ],

    // Green Ukraine (Zelenyi Klyn) — Ukrainian-settled regions of the
    // Russian Far East: Primorsky, southern Khabarovsk, parts of Amur.
    'green-ukraine': [
      [50.5, 127.0], [52.0, 128.0], [53.5, 132.0], [54.5, 135.5], [54.0, 138.5],
      [53.0, 140.5], [50.5, 141.0], [48.0, 140.5], [46.0, 138.5], [44.5, 136.0],
      [43.2, 134.0], [42.5, 131.0], [42.7, 130.5], [44.5, 130.4], [46.5, 129.5],
      [48.5, 127.5],
    ],

    // Kingdom of Jerusalem at peak (~1175), a thin coastal strip plus
    // Oultrejourdain. Two polygons would be more accurate; this is the
    // contiguous outline including the Transjordanian lordships.
    'jerusalem': [
      [36.20, 35.90], [35.85, 36.20], [35.30, 36.50], [34.65, 36.30], [33.85, 35.90],
      [33.40, 35.60], [32.95, 35.65], [32.65, 35.60], [32.50, 35.65], [31.80, 35.65],
      [31.20, 35.60], [30.65, 35.50], [29.95, 35.00], [29.50, 35.00], [29.70, 34.80],
      [30.20, 34.85], [31.00, 34.70], [31.80, 34.65], [32.55, 34.85], [33.10, 35.15],
      [33.80, 35.40], [34.60, 35.85], [35.15, 35.90], [35.85, 35.85],
    ],
  };

  // ===== Scene =====
  const scene = new THREE.Scene();
  scene.background = null;

  const camera = new THREE.PerspectiveCamera(40, 2, 0.1, 100);
  camera.position.set(0, 0.6, 4.6);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  function resize() {
    const w = container.clientWidth;
    const h = container.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  // ===== Lat/lon → 3D Vec3 =====
  // The negated z aligns the marker placement with the standard
  // Three.js SphereGeometry UV: u=0 at the −X axis (lon = −180°) and
  // u increasing counter-clockwise as viewed from +Y, so an east-going
  // longitude maps to the −Z axis.
  function latLonToVec3(latDeg, lonDeg, radius) {
    const phi = THREE.MathUtils.degToRad(90 - latDeg);
    const theta = THREE.MathUtils.degToRad(lonDeg);
    return new THREE.Vector3(
       radius * Math.sin(phi) * Math.cos(theta),
       radius * Math.cos(phi),
      -radius * Math.sin(phi) * Math.sin(theta)
    );
  }

  // ===== Globe =====
  const R = 1.4;
  const globeGroup = new THREE.Group();
  scene.add(globeGroup);

  // 1. The NASA Blue Marble (2001-2002) texture, 4096×2048.
  const earthTexture = new THREE.TextureLoader().load('assets/textures/earth-bluemarble.jpg');
  earthTexture.colorSpace = THREE.SRGBColorSpace;
  earthTexture.wrapS = THREE.RepeatWrapping;
  earthTexture.wrapT = THREE.ClampToEdgeWrapping;
  earthTexture.anisotropy = 8;

  const innerGeo = new THREE.SphereGeometry(R, 128, 64);
  const innerMat = new THREE.MeshBasicMaterial({ map: earthTexture });
  const innerMesh = new THREE.Mesh(innerGeo, innerMat);
  globeGroup.add(innerMesh);

  // Faint atmosphere halo for depth.
  const haloGeo = new THREE.SphereGeometry(R * 1.04, 64, 32);
  const haloMat = new THREE.ShaderMaterial({
    transparent: true,
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: {
      glowColor: { value: new THREE.Color(0x88a8c8) },
    },
    vertexShader: `
      varying vec3 vNormal;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec3 vNormal;
      uniform vec3 glowColor;
      void main() {
        float intensity = pow(0.6 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
        gl_FragColor = vec4(glowColor, 1.0) * intensity * 0.7;
      }
    `,
  });
  const haloMesh = new THREE.Mesh(haloGeo, haloMat);
  globeGroup.add(haloMesh);

  // 2. Latitude / longitude grid — thin, sparse, editorial.
  const gridMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.12 });
  function addParallel(latDeg) {
    const points = [];
    const phi = THREE.MathUtils.degToRad(90 - latDeg);
    const r = Math.sin(phi) * R * 1.002;
    const y = Math.cos(phi) * R * 1.002;
    const SEG = 128;
    for (let i = 0; i <= SEG; i++) {
      const t = (i / SEG) * Math.PI * 2;
      points.push(new THREE.Vector3(Math.cos(t) * r, y, Math.sin(t) * r));
    }
    globeGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), gridMat));
  }
  function addMeridian(lonDeg) {
    const points = [];
    const SEG = 128;
    for (let i = 0; i <= SEG; i++) {
      const lat = -90 + (i / SEG) * 180;
      points.push(latLonToVec3(lat, lonDeg, R * 1.002));
    }
    globeGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), gridMat));
  }
  [0, 23.5, -23.5, 66.5, -66.5, 45, -45].forEach(addParallel);
  for (let lon = -180; lon < 180; lon += 30) addMeridian(lon);

  // ===== Boundary outline & filled wash for each historical state =====

  // Densify a contour by linearly interpolating segPerEdge intermediate
  // points along each edge, so the projected polygon hugs the sphere.
  function densifyContour(latLonPoints, segPerEdge) {
    const out = [];
    for (let i = 0; i < latLonPoints.length; i++) {
      const a = latLonPoints[i];
      const b = latLonPoints[(i + 1) % latLonPoints.length];
      for (let j = 0; j < segPerEdge; j++) {
        const t = j / segPerEdge;
        out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
      }
    }
    return out;
  }

  // Signed area in lat/lon space (Shoelace). Positive => CCW, negative => CW.
  function signedArea(latLonPoints) {
    let s = 0;
    const n = latLonPoints.length;
    for (let i = 0; i < n; i++) {
      const a = latLonPoints[i];
      const b = latLonPoints[(i + 1) % n];
      s += (b[1] - a[1]) * (a[0] + b[0]);
    }
    return s / 2;
  }

  function buildBoundaryGeometry(latLonPoints, radius) {
    const dense = densifyContour(latLonPoints, 16);
    const pts = dense.map(p => latLonToVec3(p[0], p[1], radius));
    return new THREE.BufferGeometry().setFromPoints(pts);
  }

  // Properly triangulated fill using THREE.ShapeUtils.triangulateShape,
  // applied in the lat/lon plane and projected to the sphere. This handles
  // concave coastlines (Adriatic, Mediterranean, etc.) correctly.
  function buildFillGeometry(latLonPoints, radius) {
    let pts = densifyContour(latLonPoints, 8);
    // ShapeUtils.triangulateShape requires counter-clockwise winding.
    if (signedArea(pts) < 0) pts = pts.reverse();
    const contour = pts.map(p => new THREE.Vector2(p[1], p[0])); // (x=lon, y=lat)
    const faces = THREE.ShapeUtils.triangulateShape(contour, []);
    const positions = [];
    for (const p of pts) {
      const v = latLonToVec3(p[0], p[1], radius);
      positions.push(v.x, v.y, v.z);
    }
    const indices = [];
    for (const f of faces) indices.push(f[0], f[1], f[2]);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  }

  const shapeObjects = {};
  for (const [id, latLonPoints] of Object.entries(SHAPES)) {
    const group = new THREE.Group();

    const fillGeo = buildFillGeometry(latLonPoints, R * 1.003);
    const fillMat = new THREE.MeshBasicMaterial({
      color: 0xf4d066,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const fillMesh = new THREE.Mesh(fillGeo, fillMat);
    group.add(fillMesh);

    const lineGeo = buildBoundaryGeometry(latLonPoints, R * 1.006);
    const lineMat = new THREE.LineBasicMaterial({
      color: 0xfff2c2,
      transparent: true,
      opacity: 0,
      linewidth: 2,
    });
    const lineMesh = new THREE.LineLoop(lineGeo, lineMat);
    group.add(lineMesh);

    globeGroup.add(group);
    shapeObjects[id] = { group, fillMat, lineMat };
  }

  // ===== Markers =====
  const markersGroup = new THREE.Group();
  globeGroup.add(markersGroup);

  const PIN_R = 0.04;
  const RING_R = 0.07;

  const matFill    = new THREE.MeshBasicMaterial({ color: 0xfff0a8 });
  const matOutline = new THREE.LineBasicMaterial({ color: 0x4a3000 });

  const markers = [];

  VOLUMES.forEach(v => {
    const center = latLonToVec3(v.lat, v.lon, R * 1.015);
    const pinGroup = new THREE.Group();
    pinGroup.position.copy(center);
    pinGroup.lookAt(center.clone().multiplyScalar(2));

    const disc = new THREE.Mesh(new THREE.CircleGeometry(PIN_R, 24), matFill);
    pinGroup.add(disc);

    const ringPts = [];
    for (let i = 0; i <= 48; i++) {
      const t = (i / 48) * Math.PI * 2;
      ringPts.push(new THREE.Vector3(Math.cos(t) * PIN_R, Math.sin(t) * PIN_R, 0));
    }
    pinGroup.add(new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(ringPts), matOutline));

    const haloPts = [];
    for (let i = 0; i <= 48; i++) {
      const t = (i / 48) * Math.PI * 2;
      haloPts.push(new THREE.Vector3(Math.cos(t) * RING_R, Math.sin(t) * RING_R, 0));
    }
    const halo = new THREE.LineLoop(
      new THREE.BufferGeometry().setFromPoints(haloPts),
      new THREE.LineBasicMaterial({ color: 0xfff2c2, transparent: true, opacity: 0.55 })
    );
    pinGroup.add(halo);

    const hit = new THREE.Mesh(
      new THREE.CircleGeometry(RING_R * 1.4, 16),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    hit.userData.volume = v;
    pinGroup.add(hit);

    markersGroup.add(pinGroup);
    markers.push({ group: pinGroup, halo, hit, data: v });
  });

  // ===== Controls =====
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.enablePan = false;
  controls.minDistance = 2.6;
  controls.maxDistance = 7.0;
  controls.rotateSpeed = 0.7;
  controls.zoomSpeed = 0.6;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.35;

  globeGroup.rotation.y = -Math.PI / 6;

  let interactTimer = null;
  function bumpInteract() {
    controls.autoRotate = false;
    if (interactTimer) clearTimeout(interactTimer);
    interactTimer = setTimeout(() => { controls.autoRotate = true; }, 4000);
  }
  renderer.domElement.addEventListener('pointerdown', bumpInteract);
  renderer.domElement.addEventListener('wheel', bumpInteract, { passive: true });

  // ===== Raycasting (hover + click) =====
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let hovered = null;
  const FILL_OPACITY = 0.34;
  const LINE_OPACITY = 0.95;

  function setPointerFromEvent(ev) {
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x =  ((ev.clientX - rect.left) / rect.width)  * 2 - 1;
    pointer.y = -((ev.clientY - rect.top)  / rect.height) * 2 + 1;
  }

  function pickMarker() {
    raycaster.setFromCamera(pointer, camera);
    const hits = markers.map(m => m.hit);
    const intersects = raycaster.intersectObjects(hits, false);
    if (intersects.length === 0) return null;
    for (const hit of intersects) {
      const worldPos = new THREE.Vector3();
      hit.object.getWorldPosition(worldPos);
      const camDir = camera.position.clone().sub(worldPos).normalize();
      const surfNormal = worldPos.clone().normalize();
      if (camDir.dot(surfNormal) > 0) {
        return markers.find(m => m.hit === hit.object) || null;
      }
    }
    return null;
  }

  function showTooltip(marker, clientX, clientY) {
    if (!tooltip) return;
    const rect = renderer.domElement.getBoundingClientRect();
    tooltip.hidden = false;
    tooltip.innerHTML = `${marker.data.name} <span style="opacity:0.5; margin-left:6px;">Read now</span>`;
    tooltip.style.left = (clientX - rect.left) + 'px';
    tooltip.style.top  = (clientY - rect.top)  + 'px';
  }
  function hideTooltip() { if (tooltip) tooltip.hidden = true; }

  function setHovered(marker) {
    if (marker === hovered) return;
    if (hovered) {
      hovered.halo.scale.set(1, 1, 1);
      const prev = shapeObjects[hovered.data.id];
      if (prev) { prev.fillMat.opacity = 0; prev.lineMat.opacity = 0; }
    }
    hovered = marker;
    if (hovered) {
      hovered.halo.scale.set(1.5, 1.5, 1);
      const cur = shapeObjects[hovered.data.id];
      if (cur) { cur.fillMat.opacity = FILL_OPACITY; cur.lineMat.opacity = LINE_OPACITY; }
      renderer.domElement.style.cursor = 'pointer';
    } else {
      renderer.domElement.style.cursor = '';
    }
  }

  renderer.domElement.addEventListener('pointermove', ev => {
    setPointerFromEvent(ev);
    const m = pickMarker();
    setHovered(m);
    if (m) showTooltip(m, ev.clientX, ev.clientY);
    else hideTooltip();
  });

  renderer.domElement.addEventListener('pointerleave', () => {
    setHovered(null);
    hideTooltip();
  });

  let downX = 0, downY = 0, downT = 0;
  renderer.domElement.addEventListener('pointerdown', ev => {
    downX = ev.clientX; downY = ev.clientY; downT = Date.now();
  });
  renderer.domElement.addEventListener('pointerup', ev => {
    const dx = ev.clientX - downX;
    const dy = ev.clientY - downY;
    const dt = Date.now() - downT;
    if (dt < 500 && dx*dx + dy*dy < 36) {
      setPointerFromEvent(ev);
      const m = pickMarker();
      if (m) window.location.href = m.data.href;
    }
  });

  // ===== Animation loop =====
  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }
  animate();
}
