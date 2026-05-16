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
  // `color` matches the colour used on the timeline; `years` is shown
  // in the on-globe legend.
  const VOLUMES = [
    { id: 'prussia',           vol: 'I',     name: 'Prussia',                            lat: 54.71, lon:  20.51, color: '#1d1d1d', years: '1525 – 1947',     href: 'prussia/index.html'           },
    { id: 'ottoman',           vol: 'II',    name: 'The Ottoman Empire',                 lat: 41.68, lon:  26.55, color: '#2a5e3a', years: '1299 – 1922',     href: 'ottoman/index.html'           },
    { id: 'east-germany',      vol: 'III',   name: 'East Germany',                       lat: 52.52, lon:  13.40, color: '#c8a02e', years: '1949 – 1990',     href: 'east-germany/index.html'      },
    { id: 'yugoslavia',        vol: 'IV',    name: 'Yugoslavia',                         lat: 44.81, lon:  20.46, color: '#2a5990', years: '1918 – 2003',     href: 'yugoslavia/index.html'        },
    { id: 'persia',            vol: 'V',     name: 'Persia',                             lat: 32.66, lon:  51.68, color: '#c47a3a', years: '550 BC – 1979',   href: 'persia/index.html'            },
    { id: 'soviet-union',      vol: 'VI',    name: 'The Soviet Union',                   lat: 55.75, lon:  37.62, color: '#b21b1b', years: '1922 – 1991',     href: 'soviet-union/index.html'      },
    { id: 'inca',              vol: 'VII',   name: 'The Inca Empire',                    lat: -13.52,lon: -71.97, color: '#d4a437', years: '1438 – 1572',     href: 'inca/index.html'              },
    { id: 'congo-free-state',  vol: 'VIII',  name: 'The Congo Free State',               lat: -4.32, lon:  15.32, color: '#b54a32', years: '1885 – 1908',     href: 'congo-free-state/index.html'  },
    { id: 'rome',              vol: 'IX',    name: 'The Roman Empire',                   lat: 41.90, lon:  12.50, color: '#8c2a25', years: '27 BC – 1453',    href: 'rome/index.html'              },
    { id: 'cordoba',           vol: 'X',     name: 'The Caliphate of Córdoba',           lat: 37.88, lon:  -4.78, color: '#6f7d36', years: '929 – 1031',      href: 'cordoba/index.html'           },
    { id: 'green-ukraine',     vol: 'XI',    name: 'Green Ukraine',                      lat: 48.48, lon: 135.08, color: '#4d8c52', years: '1917 – 1922',     href: 'green-ukraine/index.html'     },
    { id: 'jerusalem',         vol: 'XII',   name: 'The Kingdom of Jerusalem',           lat: 31.78, lon:  35.21, color: '#c4a849', years: '1099 – 1291',     href: 'jerusalem/index.html'         },
    { id: 'venice',            vol: 'XIII',  name: 'The Republic of Venice',             lat: 45.44, lon:  12.32, color: '#a23b3b', years: '697 – 1797',      href: 'venice/index.html'            },
    { id: 'poland-lithuania',  vol: 'XIV',   name: 'The Polish-Lithuanian Commonwealth', lat: 52.23, lon:  21.01, color: '#c52d2d', years: '1569 – 1795',     href: 'poland-lithuania/index.html'  },
    { id: 'rhodesia',          vol: 'XV',    name: 'Rhodesia',                           lat: -17.83,lon:  31.05, color: '#2d6033', years: '1965 – 1979',     href: 'rhodesia/index.html'          },
    { id: 'nazi-germany',      vol: 'XVI',   name: 'Nazi Germany',                       lat: 49.45, lon:  11.08, color: '#6e0c0c', years: '1933 – 1945',     href: 'nazi-germany/index.html'      },
    { id: 'holy-roman-empire', vol: 'XVII',  name: 'The Holy Roman Empire',              lat: 48.21, lon:  16.37, color: '#8d4d2c', years: '962 – 1806',      href: 'holy-roman-empire/index.html' },
    { id: 'confederacy',       vol: 'XVIII', name: 'The Confederate States of America', lat: 37.54, lon: -77.43, color: '#5a3338', years: '1861 – 1865',     href: 'confederacy/index.html'       },
    { id: 'gran-colombia',     vol: 'XIX',   name: 'Gran Colombia',                      lat:  4.71, lon: -74.07, color: '#2671b0', years: '1819 – 1831',     href: 'gran-colombia/index.html'     },
    { id: 'south-vietnam',     vol: 'XX',    name: 'South Vietnam',                      lat: 10.78, lon: 106.70, color: '#f0c040', years: '1955 – 1975',     href: 'south-vietnam/index.html'     },
    { id: 'republic-of-texas', vol: 'XXI',   name: 'The Republic of Texas',              lat: 30.27, lon: -97.74, color: '#2a4d6e', years: '1836 – 1846',     href: 'republic-of-texas/index.html' },
    { id: 'byzantine',         vol: 'XXII',  name: 'The Byzantine Empire',               lat: 41.01, lon:  28.97, color: '#8a3a72', years: '330 – 1453',      href: 'byzantine/index.html'         },
    { id: 'abbasid',           vol: 'XXIII', name: 'The Abbasid Caliphate',              lat: 33.31, lon:  44.36, color: '#1f1f1f', years: '750 – 1258',      href: 'abbasid/index.html'           },
    { id: 'carthage',          vol: 'XXIV',  name: 'The Carthaginian Empire',            lat: 36.85, lon:  10.32, color: '#7a2d18', years: '814 – 146 BC',    href: 'carthage/index.html'          },
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

    // Republic of Venice at peak (~1500): Veneto, Friuli, Istria and
    // the Dalmatian coast as a single contiguous landward contour. The
    // Stato da Mar holdings further south (Corfu, Crete, Cyprus) are
    // omitted because they are not contiguous with the terraferma.
    'venice': [
      [46.50, 10.00], [46.60, 11.50], [46.60, 13.50], [46.20, 13.80], [45.80, 13.80],
      [45.55, 13.70], [45.20, 14.10], [44.80, 14.60], [44.30, 15.00], [43.70, 15.50],
      [43.20, 16.40], [42.70, 17.50], [42.40, 18.40], [42.10, 19.00], [42.50, 18.10],
      [43.00, 16.70], [43.50, 15.80], [44.10, 14.90], [44.60, 14.30], [44.90, 13.90],
      [45.20, 13.30], [45.40, 12.40], [45.50, 11.50], [45.70, 10.90], [46.00, 10.30],
    ],

    // Polish-Lithuanian Commonwealth at peak (~1619), the largest
    // contiguous European state of its day. Approximate outer contour
    // ignoring later voivodeship boundaries.
    'poland-lithuania': [
      [55.50, 21.00], [56.30, 22.50], [56.80, 24.00], [56.40, 27.00], [55.50, 30.00],
      [54.70, 32.30], [53.50, 34.00], [52.00, 35.00], [50.50, 35.50], [49.00, 35.00],
      [48.00, 33.00], [47.20, 31.00], [47.00, 29.00], [47.60, 26.50], [48.00, 25.50],
      [48.50, 23.00], [49.20, 22.30], [49.50, 19.50], [49.80, 18.30], [50.30, 16.50],
      [51.00, 15.50], [51.80, 15.00], [52.50, 14.80], [53.40, 14.50], [54.00, 15.00],
      [54.40, 16.50], [54.50, 18.30], [54.70, 19.50],
    ],

    // Rhodesia / Southern Rhodesia, 1965 UDI boundaries — equivalent
    // to modern Zimbabwe.
    'rhodesia': [
      [-15.60, 26.20], [-15.60, 28.00], [-15.50, 29.50], [-15.70, 30.50], [-15.85, 31.80],
      [-16.20, 32.70], [-16.80, 32.90], [-17.50, 33.00], [-18.50, 32.90], [-19.50, 33.00],
      [-20.50, 32.50], [-21.50, 31.80], [-22.20, 31.20], [-22.30, 30.30], [-22.30, 29.40],
      [-22.00, 28.00], [-21.50, 27.40], [-20.50, 26.40], [-19.50, 26.00], [-18.50, 25.40],
      [-17.80, 25.80], [-17.00, 26.10], [-16.30, 26.10],
    ],

    // Nazi Germany (Großdeutsches Reich) c. 1941 — the Reich plus
    // Austria, Sudetenland, the Polish corridor and Wartheland, Memel.
    'nazi-germany': [
      [55.30,  5.50], [54.50,  8.50], [54.90, 11.00], [54.70, 13.50], [55.00, 16.50],
      [54.90, 20.00], [55.40, 21.00], [53.50, 23.50], [52.50, 23.50], [51.50, 24.00],
      [50.50, 23.00], [49.50, 22.00], [48.60, 22.50], [48.00, 18.00], [47.60, 16.50],
      [47.00, 15.00], [46.50, 12.00], [46.70,  9.50], [47.50,  7.50], [48.00,  6.00],
      [49.00,  5.50], [51.00,  5.70], [53.00,  5.50],
    ],

    // Holy Roman Empire at peak (~13th century) — central Europe with
    // northern Italy and Burgundian fringes. Simplified outer contour.
    'holy-roman-empire': [
      [54.50,  8.50], [54.50, 14.50], [53.00, 16.50], [51.50, 18.50], [50.00, 19.00],
      [49.00, 18.00], [48.00, 17.00], [47.00, 16.00], [46.00, 14.00], [45.00, 12.00],
      [44.00,  9.00], [43.50,  7.00], [44.50,  6.50], [46.00,  5.50], [47.50,  5.50],
      [49.00,  5.50], [50.50,  4.50], [51.50,  4.00], [52.50,  4.50], [53.50,  6.00],
      [54.00,  7.50],
    ],

    // Confederate States of America (11 seceded states), 1861–1865.
    'confederacy': [
      [36.50, -94.00], [33.00, -94.00], [31.50, -97.00], [29.50, -98.50], [27.50, -97.50],
      [26.00, -97.00], [29.00, -94.00], [30.00, -89.00], [29.00, -89.50], [30.00, -87.50],
      [29.00, -84.00], [25.50, -81.00], [25.50, -80.50], [29.50, -81.50], [32.00, -80.80],
      [33.00, -78.50], [35.50, -75.00], [37.50, -76.00], [38.00, -77.00], [39.00, -77.50],
      [39.50, -78.50], [37.00, -82.50], [36.50, -86.00], [36.50, -90.00],
    ],

    // Gran Colombia (1819–1831) — modern Colombia, Venezuela, Ecuador,
    // Panama.
    'gran-colombia': [
      [12.00, -71.50], [12.00, -69.00], [11.00, -65.00], [10.50, -62.00], [ 8.50, -60.50],
      [ 4.50, -60.50], [ 1.50, -65.00], [-0.50, -69.00], [-3.00, -71.00], [-4.50, -78.00],
      [-3.00, -80.50], [ 0.00, -80.50], [ 4.00, -77.50], [ 7.50, -78.00], [ 9.00, -82.00],
      [11.50, -79.00], [11.50, -75.00],
    ],

    // South Vietnam (1955–1975) — south of the 17th parallel.
    'south-vietnam': [
      [17.00, 105.00], [17.00, 107.50], [16.00, 108.50], [14.50, 109.50], [13.00, 109.50],
      [11.00, 109.00], [ 9.00, 106.00], [ 8.50, 104.50], [10.00, 104.50], [12.00, 105.50],
      [14.00, 106.00], [15.00, 107.00],
    ],

    // Republic of Texas (1836–1846), claimed boundaries — extending
    // far north and west into modern New Mexico, Colorado, Wyoming.
    'republic-of-texas': [
      [42.00, -106.50], [42.00, -103.00], [37.00, -103.00], [37.00, -100.00], [36.50, -100.00],
      [36.50,  -94.00], [33.50,  -94.00], [31.00,  -94.50], [29.50,  -94.00], [28.00,  -97.00],
      [25.50,  -97.00], [26.00,  -99.00], [29.00, -101.00], [30.00, -103.00], [32.00, -106.50],
      [35.00, -106.50], [37.00, -106.50],
    ],

    // Byzantine Empire at Justinian's peak (~565 AD) — simplified
    // contiguous core including Anatolia, the Levant, Egypt, North
    // Africa, southern Italy and the Aegean. Spanish reconquests are
    // omitted as non-contiguous.
    'byzantine': [
      [44.50, 12.50], [44.50, 19.50], [42.50, 22.50], [40.50, 22.50], [38.50, 22.50],
      [36.50, 23.00], [35.50, 26.50], [36.00, 30.00], [37.50, 34.00], [38.50, 36.50],
      [40.00, 37.50], [41.00, 40.00], [40.00, 41.50], [37.00, 42.50], [35.50, 41.00],
      [34.00, 38.50], [32.50, 35.00], [31.00, 34.00], [29.50, 32.50], [30.50, 30.00],
      [32.50, 27.00], [33.00, 22.50], [33.50, 18.00], [34.50, 12.50], [35.50, 11.50],
      [36.50, 10.50], [37.00,  9.50], [38.50,  9.00], [40.00,  9.00], [42.00,  9.50],
      [43.00, 11.50],
    ],

    // Abbasid Caliphate at peak (~800 AD under Harun al-Rashid) —
    // from the Atlas to the Indus, Caspian to southern Arabia.
    'abbasid': [
      [36.50, -5.00], [36.50,  0.00], [37.00,  9.50], [33.00, 12.50], [31.00, 19.00],
      [31.50, 25.00], [31.00, 31.00], [27.00, 33.50], [22.00, 38.50], [16.00, 42.50],
      [13.00, 46.00], [14.00, 50.00], [17.00, 53.00], [22.00, 58.00], [25.00, 60.00],
      [27.50, 63.00], [30.00, 67.00], [33.00, 71.00], [36.00, 73.00], [38.00, 71.00],
      [40.00, 67.00], [41.50, 63.00], [42.00, 58.00], [40.00, 52.00], [40.50, 48.00],
      [41.50, 44.00], [40.50, 42.00], [38.50, 41.00], [37.50, 38.00], [37.00, 35.00],
      [36.00, 32.50], [36.50, 28.00], [35.00, 24.00], [33.00, 19.00], [33.00, 12.00],
      [34.50,  8.00], [35.00,  3.00], [35.50, -2.00],
    ],

    // Carthaginian Empire at peak (~264 BC, before First Punic War) —
    // North African coast from Cyrenaica to the Atlantic, plus
    // contiguous inland territory. (The non-contiguous Sicilian,
    // Sardinian, Corsican and Iberian holdings are omitted.)
    'carthage': [
      [37.40,  9.50], [37.20, 10.30], [37.00, 11.20], [36.70, 11.10], [36.20, 10.60],
      [35.50, 11.10], [34.50, 11.20], [33.50, 10.80], [32.80, 11.20], [32.30, 13.00],
      [31.80, 14.50], [31.40, 16.50], [31.30, 19.00], [30.80, 20.50], [29.50, 20.50],
      [29.00, 18.00], [29.50, 14.00], [30.50, 11.50], [31.50,  9.00], [32.00,  6.00],
      [32.50,  3.00], [33.00,  0.00], [33.50, -3.00], [34.00, -5.50], [34.80, -5.30],
      [35.50, -5.00], [36.20, -4.50], [35.20, -1.50], [34.80,  1.00], [34.80,  4.50],
      [35.50,  7.00], [36.40,  8.50],
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

  // Subdivide each triangle and project the new midpoints onto the
  // sphere of the given radius, so the resulting mesh conforms to the
  // sphere's curvature rather than chord-cutting beneath it. Repeat
  // `depth` times; each iteration quadruples the triangle count.
  function subdivideOntoSphere(positions, indices, radius, depth) {
    let pos = positions.slice();
    let idx = indices.slice();
    for (let d = 0; d < depth; d++) {
      const cache = new Map();
      const newIdx = [];
      function midpoint(a, b) {
        const key = a < b ? `${a}_${b}` : `${b}_${a}`;
        if (cache.has(key)) return cache.get(key);
        const ax = pos[a * 3], ay = pos[a * 3 + 1], az = pos[a * 3 + 2];
        const bx = pos[b * 3], by = pos[b * 3 + 1], bz = pos[b * 3 + 2];
        let mx = (ax + bx) * 0.5, my = (ay + by) * 0.5, mz = (az + bz) * 0.5;
        const len = Math.sqrt(mx * mx + my * my + mz * mz);
        const s = radius / len;
        mx *= s; my *= s; mz *= s;
        const newIndex = pos.length / 3;
        pos.push(mx, my, mz);
        cache.set(key, newIndex);
        return newIndex;
      }
      for (let i = 0; i < idx.length; i += 3) {
        const a = idx[i], b = idx[i + 1], c = idx[i + 2];
        const ab = midpoint(a, b);
        const bc = midpoint(b, c);
        const ca = midpoint(c, a);
        newIdx.push(a, ab, ca, b, bc, ab, c, ca, bc, ab, bc, ca);
      }
      idx = newIdx;
    }
    return { positions: pos, indices: idx };
  }

  // Properly triangulated fill using THREE.ShapeUtils.triangulateShape,
  // applied in the lat/lon plane and projected to the sphere. This handles
  // concave coastlines (Adriatic, Mediterranean, etc.) correctly.
  // We then subdivide each triangle and re-project the new vertices to
  // the sphere, so large polygons hug the curvature rather than cutting
  // chords through it.
  function buildFillGeometry(latLonPoints, radius) {
    let pts = densifyContour(latLonPoints, 12);
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
    // Subdivide twice: each pass quadruples triangles and projects new
    // vertices onto the sphere, eliminating the visible gaps that
    // otherwise appear when a flat triangle dips below the curvature.
    const sub = subdivideOntoSphere(positions, indices, radius, 2);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(sub.positions, 3));
    geo.setIndex(sub.indices);
    geo.computeVertexNormals();
    return geo;
  }

  const shapeObjects = {};
  const volsById = {};
  VOLUMES.forEach(v => { volsById[v.id] = v; });
  for (const [id, latLonPoints] of Object.entries(SHAPES)) {
    const group = new THREE.Group();
    const stateColor = (volsById[id] && volsById[id].color) || '#f4d066';

    const fillGeo = buildFillGeometry(latLonPoints, R * 1.003);
    const fillMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(stateColor),
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const fillMesh = new THREE.Mesh(fillGeo, fillMat);
    group.add(fillMesh);

    const lineGeo = buildBoundaryGeometry(latLonPoints, R * 1.006);
    const lineMat = new THREE.LineBasicMaterial({
      color: new THREE.Color(stateColor).lerp(new THREE.Color('#ffffff'), 0.35),
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

  const PIN_R = 0.038;
  const RING_R = 0.068;

  const matOutline = new THREE.LineBasicMaterial({ color: 0x1a1a1a });

  const markers = [];
  const markersById = {};

  VOLUMES.forEach(v => {
    const center = latLonToVec3(v.lat, v.lon, R * 1.015);
    const pinGroup = new THREE.Group();
    pinGroup.position.copy(center);
    pinGroup.lookAt(center.clone().multiplyScalar(2));

    const fillMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(v.color) });
    const disc = new THREE.Mesh(new THREE.CircleGeometry(PIN_R, 24), fillMat);
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
    const haloMat = new THREE.LineBasicMaterial({ color: new THREE.Color(v.color), transparent: true, opacity: 0.55 });
    const halo = new THREE.LineLoop(
      new THREE.BufferGeometry().setFromPoints(haloPts),
      haloMat
    );
    pinGroup.add(halo);

    const hit = new THREE.Mesh(
      new THREE.CircleGeometry(RING_R * 1.4, 16),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    hit.userData.volume = v;
    pinGroup.add(hit);

    markersGroup.add(pinGroup);
    const entry = { group: pinGroup, halo, haloMat, hit, data: v };
    markers.push(entry);
    markersById[v.id] = entry;
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

  // ===== Snap-to-state (legend → focus) =====
  // Quaternion-based rotation so the focus works correctly regardless
  // of where autoRotate has drifted the camera. We compute the
  // rotation that takes the state's CURRENT world position onto the
  // camera-facing unit vector, then slerp the globeGroup quaternion
  // from its current orientation toward that target.
  let tweening = false;
  let tweenT0 = 0, tweenDur = 0;
  const tweenStartQuat = new THREE.Quaternion();
  const tweenEndQuat   = new THREE.Quaternion();
  let focusedId = null;

  // Camera-distance tween (zoom in on focus, zoom out on auto-rotate resume).
  const DEFAULT_CAM_DIST = camera.position.length();   // initial ~4.65
  const FOCUS_CAM_DIST   = 3.05;                       // closer for "zoom in"
  let zooming = false;
  let zoomT0 = 0, zoomDur = 0, zoomStart = DEFAULT_CAM_DIST, zoomEnd = DEFAULT_CAM_DIST;

  function startZoom(targetDist, dur) {
    zoomStart = camera.position.length();
    zoomEnd   = targetDist;
    zoomT0    = performance.now();
    zoomDur   = dur;
    zooming   = true;
  }

  // Local (rotation-free) unit vector for a given state, computed once.
  function localUnitVec(lat, lon) {
    const latR = THREE.MathUtils.degToRad(lat);
    const lonR = THREE.MathUtils.degToRad(lon);
    return new THREE.Vector3(
       Math.cos(latR) * Math.cos(lonR),
       Math.sin(latR),
      -Math.cos(latR) * Math.sin(lonR),
    );
  }

  function focusOn(id) {
    const v = volsById[id];
    if (!v) return;

    // Where the camera is looking FROM, relative to the globe centre.
    // This is the direction we want the state's surface point to face.
    const camDir = camera.position.clone().sub(controls.target).normalize();

    // Current world direction of this state, including the existing
    // globeGroup orientation.
    const local = localUnitVec(v.lat, v.lon);
    const currentWorldDir = local.clone().applyQuaternion(globeGroup.quaternion);

    // The extra rotation needed: send currentWorldDir → camDir.
    const delta = new THREE.Quaternion().setFromUnitVectors(currentWorldDir, camDir);
    tweenStartQuat.copy(globeGroup.quaternion);
    tweenEndQuat.copy(delta).multiply(globeGroup.quaternion);

    tweenT0 = performance.now();
    tweenDur = 1100;
    tweening = true;

    // Dolly the camera closer for a "zoom in".
    startZoom(FOCUS_CAM_DIST, 1100);

    // Suspend auto-rotate while the user is exploring.
    controls.autoRotate = false;
    if (interactTimer) clearTimeout(interactTimer);
    interactTimer = setTimeout(() => {
      controls.autoRotate = true;
      startZoom(DEFAULT_CAM_DIST, 1500);
      // Fade out the focus highlights when auto-rotate resumes.
      if (focusedId) {
        const o = shapeObjects[focusedId];
        if (o) { o.fillMat.opacity = 0; o.lineMat.opacity = 0; }
        if (markersById[focusedId]) markersById[focusedId].halo.scale.set(1, 1, 1);
        document.querySelectorAll('.globe-legend-item').forEach(el => el.classList.remove('is-active'));
        focusedId = null;
      }
    }, 8000);

    // Highlight this state's polygon; clear any previous.
    for (const [otherId, obj] of Object.entries(shapeObjects)) {
      if (otherId !== id) { obj.fillMat.opacity = 0; obj.lineMat.opacity = 0; }
    }
    const cur = shapeObjects[id];
    if (cur) { cur.fillMat.opacity = FILL_OPACITY; cur.lineMat.opacity = LINE_OPACITY; }

    // Reset all marker haloes; the pulse animation in the render loop
    // will modulate the focused marker's halo continuously.
    Object.values(markersById).forEach(m => { m.halo.scale.set(1, 1, 1); });

    focusedId = id;

    // Update legend visual active state.
    document.querySelectorAll('.globe-legend-item').forEach(el => {
      el.classList.toggle('is-active', el.dataset.id === id);
    });
  }

  // ===== Legend wiring =====
  const legendList = document.getElementById('globe-legend-list');
  if (legendList) {
    legendList.innerHTML = '';
    VOLUMES.forEach(v => {
      const li = document.createElement('li');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'globe-legend-item';
      btn.dataset.id = v.id;
      btn.style.setProperty('--state-color', v.color);
      btn.innerHTML = `
        <span class="globe-legend-vol">Vol. ${v.vol}</span>
        <span class="globe-legend-name">${v.name}</span>
        <span class="globe-legend-years">${v.years}</span>
      `;
      btn.addEventListener('click', () => focusOn(v.id));
      li.appendChild(btn);
      legendList.appendChild(li);
    });
  }

  // ===== Animation loop =====
  function animate() {
    requestAnimationFrame(animate);
    if (tweening) {
      const t = Math.min(1, (performance.now() - tweenT0) / tweenDur);
      // easeInOutQuad
      const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      globeGroup.quaternion.copy(tweenStartQuat).slerp(tweenEndQuat, e);
      if (t >= 1) tweening = false;
    }
    if (zooming) {
      const t = Math.min(1, (performance.now() - zoomT0) / zoomDur);
      const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      const dist = zoomStart + (zoomEnd - zoomStart) * e;
      const dir = camera.position.clone().sub(controls.target).normalize();
      camera.position.copy(controls.target).add(dir.multiplyScalar(dist));
      if (t >= 1) zooming = false;
    }
    // Pulse the focused marker's halo: scale 1.4 ↔ 2.2 with a ~1.4 s
    // period so the user can quickly find which marker is selected.
    if (focusedId && markersById[focusedId]) {
      const t = performance.now() * 0.001;
      const s = 1.8 + 0.45 * Math.sin(t * 4.5);
      markersById[focusedId].halo.scale.set(s, s, 1);
    }
    controls.update();
    renderer.render(scene, camera);
  }
  animate();
}
