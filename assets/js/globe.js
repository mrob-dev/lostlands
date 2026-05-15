// Lost Lands — stylised globe with an earth-outline texture and
// per-state boundary polygons that appear on hover.
//
// On hover over a marker, the approximate territorial boundary of that
// lost state (at peak extent) is drawn on the globe surface as an
// ink-coloured outline. The polygons are hand-encoded approximations,
// not surveyed boundaries.

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const container = document.getElementById('globe-canvas');
const tooltip   = document.getElementById('globe-tooltip');
if (!container) { /* page does not include the globe */ } else {

  // ===== Volume markers =====
  // Each entry: rough centroid of the historical state.
  const VOLUMES = [
    { id: 'prussia',          name: 'Prussia',                       lat: 52.5,  lon:  13.4,  href: 'prussia/index.html'          },
    { id: 'ottoman',          name: 'The Ottoman Empire',            lat: 41.0,  lon:  28.97, href: 'ottoman/index.html'          },
    { id: 'east-germany',     name: 'East Germany',                  lat: 52.4,  lon:  13.0,  href: 'east-germany/index.html'     },
    { id: 'yugoslavia',       name: 'Yugoslavia',                    lat: 44.0,  lon:  20.5,  href: 'yugoslavia/index.html'       },
    { id: 'persia',           name: 'Persia',                        lat: 32.66, lon:  51.67, href: 'persia/index.html'           },
    { id: 'soviet-union',     name: 'The Soviet Union',              lat: 55.75, lon:  37.62, href: 'soviet-union/index.html'     },
    { id: 'inca',             name: 'The Inca Empire',               lat: -13.52,lon: -71.97, href: 'inca/index.html'             },
    { id: 'congo-free-state', name: 'The Congo Free State',          lat: -4.32, lon:  15.32, href: 'congo-free-state/index.html' },
    { id: 'rome',             name: 'The Roman Empire',              lat: 41.9,  lon:  12.5,  href: 'rome/index.html'             },
    { id: 'cordoba',          name: 'The Caliphate of Córdoba',      lat: 37.88, lon:  -4.78, href: 'cordoba/index.html'          },
    { id: 'green-ukraine',    name: 'Green Ukraine',                 lat: 47.0,  lon: 134.0,  href: 'green-ukraine/index.html'    },
    { id: 'jerusalem',        name: 'The Kingdom of Jerusalem',      lat: 31.78, lon:  35.21, href: 'jerusalem/index.html'        },
  ];

  // ===== Approximate boundary polygons =====
  // Each polygon is an array of [lat, lon] points outlining the state
  // at its rough peak territorial extent. Hand-encoded; not surveyed.
  const SHAPES = {
    'prussia': [
      [54.2,  6.3], [54.5,  8.4], [54.5, 11.0], [54.8, 13.4], [54.4, 16.0],
      [54.4, 18.0], [55.0, 20.9], [54.6, 22.8], [53.4, 23.2], [50.8, 23.4],
      [50.0, 19.4], [50.4, 16.6], [50.6, 13.5], [50.4,  9.5], [50.7,  6.0],
      [51.8,  5.9], [53.5,  6.3],
    ],
    'ottoman': [
      [48.0, 16.4], [48.0, 26.0], [46.4, 32.5], [44.6, 36.0], [41.7, 42.0],
      [38.5, 46.5], [37.0, 49.5], [33.0, 47.4], [30.0, 47.6], [22.0, 46.0],
      [15.0, 49.0], [12.7, 43.5], [16.5, 41.0], [22.0, 35.0], [27.0, 30.0],
      [31.0, 24.0], [31.5, 11.0], [37.0, 11.0], [37.0,  3.0], [37.0, 12.0],
      [38.5, 20.5], [40.3, 19.4], [42.0, 19.5], [44.0, 17.4], [45.5, 16.5],
      [46.6, 17.0],
    ],
    'east-germany': [
      [54.5, 11.0], [54.7, 14.4], [53.0, 14.3], [51.5, 14.8], [50.8, 14.6],
      [50.3, 12.4], [50.5, 11.8], [50.7, 10.6], [51.5, 10.0], [51.8, 10.6],
      [53.5, 10.7], [54.1, 11.0],
    ],
    'yugoslavia': [
      [46.9, 13.4], [46.5, 16.7], [46.2, 19.0], [46.0, 21.0], [45.4, 22.7],
      [44.2, 22.7], [43.0, 23.0], [41.8, 22.9], [41.3, 20.8], [41.8, 19.5],
      [42.5, 18.5], [43.0, 17.0], [43.4, 16.4], [44.5, 15.0], [45.5, 13.5],
      [46.0, 13.5],
    ],
    'persia': [
      [40.0, 45.0], [38.5, 49.0], [37.5, 55.0], [37.5, 62.0], [33.0, 66.0],
      [28.0, 66.0], [25.0, 62.0], [25.0, 58.0], [27.5, 55.0], [26.8, 51.0],
      [29.0, 50.0], [30.5, 47.0], [33.0, 44.0], [36.5, 42.0], [38.5, 43.5],
    ],
    'soviet-union': [
      [60.0, 19.5], [60.5, 27.0], [69.0, 30.0], [71.0, 50.0], [73.0, 80.0],
      [78.0, 105.0], [73.0, 140.0], [62.0, 170.0], [55.0, 160.0], [50.0, 158.0],
      [42.0, 132.0], [42.0, 100.0], [38.0, 80.0], [37.0, 67.0], [40.0, 55.0],
      [40.0, 50.0], [42.0, 47.0], [44.5, 40.0], [45.5, 35.0], [47.0, 30.0],
      [50.0, 26.0], [54.5, 22.0], [56.0, 21.0], [55.0, 20.0],
    ],
    'inca': [
      [1.0, -78.0], [-2.0, -79.5], [-5.0, -80.5], [-8.5, -79.0], [-13.0, -77.5],
      [-17.0, -73.0], [-19.0, -71.0], [-25.0, -70.5], [-30.0, -71.0], [-35.0, -71.5],
      [-35.0, -69.5], [-30.0, -67.0], [-22.0, -65.0], [-16.0, -68.0], [-12.0, -73.0],
      [-7.0, -76.0], [-2.0, -77.5],
    ],
    'congo-free-state': [
      [5.4, 18.0], [5.0, 23.0], [4.0, 29.0], [-1.0, 29.5], [-3.5, 29.0],
      [-8.0, 28.0], [-11.0, 28.5], [-13.5, 30.0], [-13.0, 27.0], [-11.0, 22.0],
      [-7.0, 20.0], [-6.0, 17.0], [-5.0, 12.5], [-4.5, 12.4], [-5.7, 12.5],
      [-5.0, 16.0], [-2.0, 16.0], [0.0, 14.0], [3.0, 16.0],
    ],
    'rome': [
      [58.0, -5.0], [55.0,  0.0], [50.0,  5.0], [50.0,  8.0], [49.0, 13.0],
      [48.0, 17.0], [47.0, 25.0], [46.0, 28.0], [44.5, 32.5], [42.0, 41.0],
      [37.0, 43.5], [33.0, 47.0], [29.0, 49.0], [27.0, 35.0], [25.0, 34.0],
      [22.5, 33.0], [22.0, 25.0], [30.0, 19.0], [33.0, 12.0], [36.0, 10.0],
      [35.0, -1.0], [36.0, -5.0], [37.0, -9.0], [42.0, -9.5], [45.0, -2.0],
      [48.0, -5.0], [52.0, -5.5], [55.0, -3.0],
    ],
    'cordoba': [
      [43.5, -9.0], [43.0, -7.0], [43.0, -2.0], [42.5,  2.0], [41.5,  3.5],
      [39.0,  1.0], [37.5, -1.5], [36.5, -3.5], [36.0, -5.5], [36.5, -7.5],
      [37.5, -9.0], [40.0, -9.5],
    ],
    'green-ukraine': [
      [50.0, 127.0], [52.0, 132.0], [54.0, 140.0], [50.0, 142.0], [44.0, 137.0],
      [42.5, 131.0], [44.0, 130.0], [46.0, 128.0],
    ],
    'jerusalem': [
      [36.0, 36.0], [35.5, 36.5], [34.5, 36.4], [33.5, 36.0], [33.0, 35.8],
      [32.5, 35.6], [31.5, 35.5], [29.8, 34.9], [30.5, 34.7], [32.0, 34.7],
      [33.0, 35.1], [34.0, 35.5], [35.0, 35.7],
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

  // ===== Globe =====
  const R = 1.4;
  const globeGroup = new THREE.Group();
  scene.add(globeGroup);

  // 1. The earth-textured sphere.
  // The equirectangular map's prime meridian is in the centre of the
  // image; Three.js's default sphere UV has u=0 at the +X axis, so the
  // image needs a half-revolution offset to align lon=0 with the +X
  // axis of our latLonToVec3 function.
  const earthTexture = new THREE.TextureLoader().load('assets/textures/earth-outline.png');
  earthTexture.colorSpace = THREE.SRGBColorSpace;
  earthTexture.offset.x = 0.25;
  earthTexture.wrapS = THREE.RepeatWrapping;
  earthTexture.wrapT = THREE.ClampToEdgeWrapping;

  const innerGeo = new THREE.SphereGeometry(R * 0.99, 96, 48);
  const innerMat = new THREE.MeshBasicMaterial({
    map: earthTexture,
    color: 0xf6f5f3,  // tints the white-paper texture to match the page
  });
  const innerMesh = new THREE.Mesh(innerGeo, innerMat);
  globeGroup.add(innerMesh);

  // 2. Latitude / longitude grid — thin, sparse, editorial.
  const gridMat = new THREE.LineBasicMaterial({ color: 0x292929, transparent: true, opacity: 0.18 });
  function addParallel(latDeg) {
    const points = [];
    const phi = THREE.MathUtils.degToRad(90 - latDeg);
    const r = Math.sin(phi) * R * 1.002;
    const y = Math.cos(phi) * R * 1.002;
    const SEG = 96;
    for (let i = 0; i <= SEG; i++) {
      const t = (i / SEG) * Math.PI * 2;
      points.push(new THREE.Vector3(Math.cos(t) * r, y, Math.sin(t) * r));
    }
    globeGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), gridMat));
  }
  function addMeridian(lonDeg) {
    const points = [];
    const theta = THREE.MathUtils.degToRad(lonDeg);
    const SEG = 96;
    for (let i = 0; i <= SEG; i++) {
      const phi = (i / SEG) * Math.PI;
      const x = Math.sin(phi) * Math.cos(theta) * R * 1.002;
      const y = Math.cos(phi) * R * 1.002;
      const z = Math.sin(phi) * Math.sin(theta) * R * 1.002;
      points.push(new THREE.Vector3(x, y, z));
    }
    globeGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), gridMat));
  }
  [0, 23.5, -23.5, 66.5, -66.5, 45, -45].forEach(addParallel);
  for (let lon = 0; lon < 360; lon += 30) addMeridian(lon);

  // ===== Helpers =====
  function latLonToVec3(latDeg, lonDeg, radius) {
    const phi = THREE.MathUtils.degToRad(90 - latDeg);
    const theta = THREE.MathUtils.degToRad(lonDeg);
    return new THREE.Vector3(
      radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta)
    );
  }

  // Build a closed great-circle-interpolated outline for a boundary polygon
  // so the line follows the curvature of the sphere between vertices.
  function buildBoundaryGeometry(latLonPoints, radius) {
    const points = [];
    const SUBDIV = 12;  // segments between each pair of polygon vertices
    for (let i = 0; i < latLonPoints.length; i++) {
      const a = latLonPoints[i];
      const b = latLonPoints[(i + 1) % latLonPoints.length];
      for (let j = 0; j < SUBDIV; j++) {
        const t = j / SUBDIV;
        const lat = a[0] + (b[0] - a[0]) * t;
        const lon = a[1] + (b[1] - a[1]) * t;
        points.push(latLonToVec3(lat, lon, radius));
      }
    }
    return new THREE.BufferGeometry().setFromPoints(points);
  }

  // Build a fan-triangulated filled shape (centroid-based) for the surface
  // wash that appears under the outline on hover.
  function buildFillGeometry(latLonPoints, radius) {
    // Compute simple lat/lon centroid (good enough for these small-ish polygons)
    let sLat = 0, sLon = 0;
    for (const p of latLonPoints) { sLat += p[0]; sLon += p[1]; }
    const cLat = sLat / latLonPoints.length;
    const cLon = sLon / latLonPoints.length;

    const SUBDIV = 12;
    const ringPoints = [];
    for (let i = 0; i < latLonPoints.length; i++) {
      const a = latLonPoints[i];
      const b = latLonPoints[(i + 1) % latLonPoints.length];
      for (let j = 0; j < SUBDIV; j++) {
        const t = j / SUBDIV;
        ringPoints.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
      }
    }

    const positions = [];
    const center = latLonToVec3(cLat, cLon, radius);
    positions.push(center.x, center.y, center.z);
    for (const p of ringPoints) {
      const v = latLonToVec3(p[0], p[1], radius);
      positions.push(v.x, v.y, v.z);
    }

    const indices = [];
    const N = ringPoints.length;
    for (let i = 0; i < N; i++) {
      indices.push(0, 1 + i, 1 + ((i + 1) % N));
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  }

  // ===== Boundary shapes per volume =====
  // For each shape, build a hidden line-loop outline and a hidden filled
  // wash. Both are revealed on hover and hidden on un-hover.
  const shapeObjects = {};
  for (const [id, latLonPoints] of Object.entries(SHAPES)) {
    const group = new THREE.Group();

    const fillGeo = buildFillGeometry(latLonPoints, R * 1.004);
    const fillMat = new THREE.MeshBasicMaterial({
      color: 0x292929,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const fillMesh = new THREE.Mesh(fillGeo, fillMat);
    group.add(fillMesh);

    const lineGeo = buildBoundaryGeometry(latLonPoints, R * 1.007);
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x292929,
      transparent: true,
      opacity: 0,
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

  const matFill    = new THREE.MeshBasicMaterial({ color: 0x292929 });
  const matOutline = new THREE.LineBasicMaterial({ color: 0x292929 });

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
      new THREE.LineBasicMaterial({ color: 0x292929, transparent: true, opacity: 0.35 })
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
  const FILL_OPACITY = 0.22;
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
    // Hide previous
    if (hovered) {
      hovered.halo.scale.set(1, 1, 1);
      const prev = shapeObjects[hovered.data.id];
      if (prev) { prev.fillMat.opacity = 0; prev.lineMat.opacity = 0; }
    }
    hovered = marker;
    // Show new
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

  // Click handling — distinguish drag from click
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
