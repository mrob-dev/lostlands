// Lost Lands — stylised low-poly globe with clickable markers.
// Pure three.js (module imports). No earth texture; the editorial
// aesthetic calls for a wireframe icosphere and ink-coloured land outlines.

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const container = document.getElementById('globe-canvas');
const tooltip   = document.getElementById('globe-tooltip');
if (!container) { /* page does not include the globe */ } else {

  // ===== Volume markers =====
  // Each entry: rough centroid of the historical state.
  // available = true means the volume has been written.
  const VOLUMES = [
    { id: 'prussia',          name: 'Prussia',                       lat: 52.5,  lon:  13.4,  href: 'prussia/index.html',          available: true  },
    { id: 'ottoman',          name: 'The Ottoman Empire',            lat: 41.0,  lon:  28.97, href: 'ottoman/index.html',          available: true  },
    { id: 'east-germany',     name: 'East Germany',                  lat: 52.4,  lon:  13.0,  href: 'east-germany/index.html',     available: true  },
    { id: 'yugoslavia',       name: 'Yugoslavia',                    lat: 44.0,  lon:  20.5,  href: 'yugoslavia/index.html',       available: true  },
    { id: 'persia',           name: 'Persia',                        lat: 32.66, lon:  51.67, href: 'persia/index.html',           available: true  },
    { id: 'soviet-union',     name: 'The Soviet Union',              lat: 55.75, lon:  37.62, href: 'soviet-union/index.html',     available: true  },
    { id: 'inca',             name: 'The Inca Empire',               lat: -13.52,lon: -71.97, href: 'inca/index.html',             available: true  },
    { id: 'congo-free-state', name: 'The Congo Free State',          lat: -4.32, lon:  15.32, href: 'congo-free-state/index.html', available: true  },
    { id: 'rome',             name: 'The Roman Empire',              lat: 41.9,  lon:  12.5,  href: 'rome/index.html',             available: true  },
    { id: 'cordoba',          name: 'The Caliphate of Córdoba',      lat: 37.88, lon:  -4.78, href: 'cordoba/index.html',          available: true  },
    { id: 'green-ukraine',    name: 'Green Ukraine',                 lat: 47.0,  lon: 134.0,  href: 'green-ukraine/index.html',    available: true  },
    { id: 'jerusalem',        name: 'The Kingdom of Jerusalem',      lat: 31.78, lon:  35.21, href: 'jerusalem/index.html',        available: true  },
  ];

  // ===== Scene =====
  const scene = new THREE.Scene();
  scene.background = null;

  const camera = new THREE.PerspectiveCamera(40, 2, 0.1, 100);
  camera.position.set(0, 0.6, 4.6);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // Resize handling
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

  // 1. Soft inner sphere — pale ivory, just a hint of mass.
  const innerMat = new THREE.MeshBasicMaterial({ color: 0xeeece8 });
  const innerGeo = new THREE.IcosahedronGeometry(R * 0.985, 3);
  const innerMesh = new THREE.Mesh(innerGeo, innerMat);
  globeGroup.add(innerMesh);

  // 2. Low-poly icosahedron wireframe — the architectural skin.
  const wireGeo = new THREE.IcosahedronGeometry(R, 3);
  const wireMat = new THREE.LineBasicMaterial({ color: 0x292929, transparent: true, opacity: 0.18 });
  const wireMesh = new THREE.LineSegments(new THREE.WireframeGeometry(wireGeo), wireMat);
  globeGroup.add(wireMesh);

  // 3. Latitude / longitude grid — thin, sparse, editorial.
  const gridMat = new THREE.LineBasicMaterial({ color: 0x292929, transparent: true, opacity: 0.32 });
  function addParallel(latDeg) {
    const points = [];
    const phi = THREE.MathUtils.degToRad(90 - latDeg);
    const r = Math.sin(phi) * R * 1.001;
    const y = Math.cos(phi) * R * 1.001;
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
      const x = Math.sin(phi) * Math.cos(theta) * R * 1.001;
      const y = Math.cos(phi) * R * 1.001;
      const z = Math.sin(phi) * Math.sin(theta) * R * 1.001;
      points.push(new THREE.Vector3(x, y, z));
    }
    globeGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), gridMat));
  }
  // Equator + tropics + arctic/antarctic; meridians every 30 degrees.
  [0, 23.5, -23.5, 66.5, -66.5, 45, -45].forEach(addParallel);
  for (let lon = 0; lon < 360; lon += 30) addMeridian(lon);

  // 4. Coastline-style outlines — we don't ship a vector map, but a
  // scattering of dotted small-circles on each continent gives the
  // globe the read of "earth" without leaning on a raster texture.
  // (Pure aesthetic; not geographically precise.)
  function landDot(lat, lon, size) {
    const v = latLonToVec3(lat, lon, R * 1.005);
    const dot = new THREE.Mesh(
      new THREE.SphereGeometry(size, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0x292929, transparent: true, opacity: 0.55 })
    );
    dot.position.copy(v);
    globeGroup.add(dot);
  }
  // Sparse continental hint-points (lat, lon, radius).
  const HINTS = [
    // Europe
    [60,10,0.012],[55,15,0.012],[50,20,0.012],[48,2,0.012],[52,-1,0.012],[41,12,0.012],[40,-3,0.012],[45,25,0.012],[55,30,0.012],[60,30,0.012],
    // Asia
    [55,60,0.014],[55,85,0.014],[60,105,0.014],[55,135,0.014],[35,135,0.012],[28,77,0.014],[35,105,0.014],[22,114,0.012],[14,121,0.012],[1,103,0.012],[33,44,0.012],[25,55,0.012],[35,51,0.012],[40,72,0.012],
    // Africa
    [30,30,0.012],[15,30,0.012],[0,20,0.014],[-15,28,0.012],[-30,25,0.012],[10,10,0.012],[-5,18,0.012],[12,-5,0.012],
    // North America
    [60,-100,0.014],[50,-100,0.014],[40,-100,0.014],[30,-95,0.012],[40,-80,0.012],[55,-130,0.012],[25,-100,0.012],[65,-150,0.012],
    // South America
    [-5,-60,0.014],[-15,-60,0.014],[-30,-65,0.012],[-40,-65,0.012],[-15,-72,0.012],[5,-65,0.012],
    // Oceania
    [-25,135,0.014],[-30,150,0.012],[-20,120,0.012],[-40,175,0.012],
  ];
  HINTS.forEach(([la,lo,r]) => landDot(la,lo,r));

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

  // ===== Markers =====
  const markersGroup = new THREE.Group();
  globeGroup.add(markersGroup);

  const PIN_R = 0.045;
  const RING_R = 0.075;

  const matAvailFill = new THREE.MeshBasicMaterial({ color: 0x292929 });
  const matFwdFill   = new THREE.MeshBasicMaterial({ color: 0xf6f5f3 });
  const matOutline   = new THREE.LineBasicMaterial({ color: 0x292929 });

  const markers = []; // { obj, data }

  VOLUMES.forEach(v => {
    const center = latLonToVec3(v.lat, v.lon, R * 1.012);
    const normal = center.clone().normalize();

    const pinGroup = new THREE.Group();
    pinGroup.position.copy(center);
    pinGroup.lookAt(center.clone().multiplyScalar(2));

    // Filled disc
    const discGeo = new THREE.CircleGeometry(PIN_R, 24);
    const disc = new THREE.Mesh(discGeo, v.available ? matAvailFill : matFwdFill);
    pinGroup.add(disc);

    // Outline ring (so forthcoming pins remain visible)
    const ringPts = [];
    for (let i = 0; i <= 48; i++) {
      const t = (i / 48) * Math.PI * 2;
      ringPts.push(new THREE.Vector3(Math.cos(t) * PIN_R, Math.sin(t) * PIN_R, 0));
    }
    const ringLine = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(ringPts), matOutline);
    pinGroup.add(ringLine);

    // Outer halo ring (drawn larger; expands on hover)
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

    // Hit target: a slightly larger invisible disc for easy clicks
    const hitGeo = new THREE.CircleGeometry(RING_R * 1.4, 16);
    const hit = new THREE.Mesh(hitGeo, new THREE.MeshBasicMaterial({ visible: false }));
    hit.userData.volume = v;
    hit.userData.parent = pinGroup;
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

  // Start the globe rotated so Eurasia is roughly facing the camera
  globeGroup.rotation.y = -Math.PI / 6;

  // Pause auto-rotate on user interaction; resume after 4 s idle.
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
    // Take the closest that is on the camera-facing hemisphere
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
    const status = marker.data.available ? 'Read now' : 'Forthcoming';
    tooltip.innerHTML = `${marker.data.name} <span style="opacity:0.5; margin-left:6px;">${status}</span>`;
    tooltip.style.left = (clientX - rect.left) + 'px';
    tooltip.style.top  = (clientY - rect.top)  + 'px';
  }
  function hideTooltip() { if (tooltip) tooltip.hidden = true; }

  renderer.domElement.addEventListener('pointermove', ev => {
    setPointerFromEvent(ev);
    const m = pickMarker();
    if (m !== hovered) {
      // Reset previous halo
      if (hovered) hovered.halo.scale.set(1, 1, 1);
      hovered = m;
      if (hovered) {
        hovered.halo.scale.set(1.5, 1.5, 1);
        renderer.domElement.style.cursor = 'pointer';
      } else {
        renderer.domElement.style.cursor = '';
      }
    }
    if (hovered) showTooltip(hovered, ev.clientX, ev.clientY);
    else hideTooltip();
  });

  renderer.domElement.addEventListener('pointerleave', () => {
    if (hovered) hovered.halo.scale.set(1, 1, 1);
    hovered = null;
    hideTooltip();
    renderer.domElement.style.cursor = '';
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
