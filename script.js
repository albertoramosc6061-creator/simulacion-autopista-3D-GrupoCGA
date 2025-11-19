/* script.js - Simulación 3D (Versión Media)
   - Muestra puntos reales, vectores, minibús que se mueve,
   - Panel lateral con magnitud, velocidad y aceleración aproximada.
*/

// --- Escena, cámara, renderer ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0b1220);

const container = document.getElementById('scene-container');
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(window.devicePixelRatio ? window.devicePixelRatio : 1);
container.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 1, 10000);
camera.position.set(1200, 1200, 1400);

// Orbit controls
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.target.set(500, 1400, 3900);
controls.update();

// --- luces ---
const dirLight = new THREE.DirectionalLight(0xffffff, 0.9);
dirLight.position.set(1000,1000,2000);
scene.add(dirLight);
scene.add(new THREE.AmbientLight(0x666666));

// --- Datos (puntos y coordenadas: unidades en metros) ---
const puntos = [
  { nombre: "Peaje El Alto", coord: [0, 0, 4050] },
  { nombre: "Cervecería B.N.", coord: [300, 800, 3920] },
  { nombre: "Viaducto", coord: [600, 1800, 3780] },
  { nombre: "Terminal Buses", coord: [800, 2500, 3730] },
  { nombre: "Pérez Velasco", coord: [1000, 3200, 3660] }
];

// Escala: estas coordenadas son en metros; para visualización podemos reducir un poco el tamaño
const SCALE = 0.6; // ajustar para que se vea bien en la cámara
function esc(v) { return v * SCALE; }

// --- Dibujar puntos (esferas) ---
const pointGroup = new THREE.Group();
puntos.forEach(p => {
  const g = new THREE.SphereGeometry(12, 24, 16);
  const m = new THREE.MeshStandardMaterial({ color: 0xffd54f });
  const s = new THREE.Mesh(g, m);
  s.position.set(esc(p.coord[0]), esc(p.coord[1]), esc(p.coord[2]));
  s.userData = p;
  pointGroup.add(s);
  // etiqueta simple (sprite)
  const canvas = document.createElement('canvas');
  canvas.width = 256; canvas.height = 64;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(0,0,256,64);
  ctx.fillStyle = '#ffffff';
  ctx.font = '18px Arial';
  ctx.fillText(p.nombre, 8, 34);
  const texture = new THREE.CanvasTexture(canvas);
  const spriteMat = new THREE.SpriteMaterial({ map: texture });
  const sprite = new THREE.Sprite(spriteMat);
  sprite.scale.set(200, 50, 1);
  sprite.position.set(esc(p.coord[0]), esc(p.coord[1]), esc(p.coord[2]) + 60);
  pointGroup.add(sprite);
});
scene.add(pointGroup);

// --- Dibujar líneas (vectores) entre puntos ---
const vectorGroup = new THREE.Group();
const materialesLinea = new THREE.LineBasicMaterial({ color: 0x28a745 });
const tramos = [];
for (let i = 0; i < puntos.length - 1; i++) {
  const a = new THREE.Vector3(...puntos[i].coord.map(esc));
  const b = new THREE.Vector3(...puntos[i+1].coord.map(esc));
  tramos.push({ inicio: a.clone(), fin: b.clone(), nombre: puntos[i].nombre + " → " + puntos[i+1].nombre });
  const geom = new THREE.BufferGeometry().setFromPoints([a, b]);
  const linea = new THREE.Line(geom, materialesLinea);
  vectorGroup.add(linea);

  // flecha (vector dirección)
  const dir = new THREE.Vector3().subVectors(b, a).normalize();
  const arrow = new THREE.ArrowHelper(dir, a, a.distanceTo(b), 0x28a745, 40, 24);
  vectorGroup.add(arrow);
}
scene.add(vectorGroup);

// --- Suelo referencial (plano) ---
const grid = new THREE.GridHelper(4000, 20, 0x555555, 0x222222);
grid.position.set(400, 1400, 3500);
scene.add(grid);

// --- Minibús (punto rojo) ---
const busGeom = new THREE.SphereGeometry(18, 24, 16);
const busMat = new THREE.MeshStandardMaterial({ color: 0xff3b30, metalness: 0.2, roughness: 0.6 });
const bus = new THREE.Mesh(busGeom, busMat);
scene.add(bus);

// --- Variables de animación ---
let segmentIndex = 0;
let progress = 0; // 0..1 within segment
const SEGMENT_DURATION = 6.0; // segundos por tramo (puedes ajustar)
let lastTime = performance.now() / 1000;

// Precalcular distancias y magnitudes
for (let i = 0; i < tramos.length; i++) {
  const d = tramos[i].inicio.distanceTo(tramos[i].fin) / SCALE; // en metros aproximados
  tramos[i].distancia_m = d;
}

// Panel DOM
const tramoEl = document.getElementById('tramo');
const magnEl = document.getElementById('magnitud');
const velEl = document.getElementById('velocidad');
const acEl = document.getElementById('aceleracion');
const btnToggleVectors = document.getElementById('btn-toggle-vectors');
const btnReset = document.getElementById('btn-reset');
let vectorsVisible = true;

btnToggleVectors.addEventListener('click', () => {
  vectorsVisible = !vectorsVisible;
  vectorGroup.visible = vectorsVisible;
  btnToggleVectors.textContent = vectorsVisible ? 'Ocultar vectores' : 'Mostrar vectores';
});

btnReset.addEventListener('click', () => {
  segmentIndex = 0;
  progress = 0;
});

// Variables para cálculo de velocidad y aceleración
let prevSpeed = 0;
let smoothedAccel = 0;

// --- Animar bus ---
function updateBus(dt) {
  if (tramos.length === 0) return;
  const seg = tramos[segmentIndex];
  progress += dt / SEGMENT_DURATION;

  if (progress >= 1) {
    progress = progress - 1;
    segmentIndex++;
    if (segmentIndex >= tramos.length) {
      segmentIndex = 0;
    }
  }

  // posición interpolada
  const pos = new THREE.Vector3().lerpVectors(seg.inicio, seg.fin, progress);
  bus.position.copy(pos);

  // calcular velocidad aproximada: distancia del tramo / duración
  const speed_m_s = seg.distancia_m / SEGMENT_DURATION; // m/s
  // aproximar aceleración como cambio de velocidad entre tramos dividido por duración
  const accel = (speed_m_s - prevSpeed) / SEGMENT_DURATION;
  // suavizar aceleración
  smoothedAccel = smoothedAccel * 0.85 + accel * 0.15;

  // actualizar panel
  tramoEl.textContent = seg.nombre;
  magnEl.textContent = seg.distancia_m.toFixed(1);
  velEl.textContent = speed_m_s.toFixed(2);
  acEl.textContent = smoothedAccel.toFixed(3);

  prevSpeed = speed_m_s;
}

// --- Resize handling ---
function onWindowResize() {
  renderer.setSize(container.clientWidth, container.clientHeight);
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', onWindowResize);

// --- Loop ---
function animate() {
  requestAnimationFrame(animate);
  const now = performance.now() / 1000;
  const dt = Math.min(0.05, now - lastTime);
  lastTime = now;

  updateBus(dt);
  controls.update();
  renderer.render(scene, camera);
}
animate();

// --- Notas para quien modifica: ---
// - Cambia SCALE para ajustar el tamaño global.
// - Ajusta SEGMENT_DURATION para cambiar la velocidad del minibús.
// - Puedes sustituir la esfera por un modelo 3D (gltf) si quieres una versión avanzada.
// - Los cálculos de magnitud están aproximados usando la escala inversa.
