import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// --- Configuración de la Escena ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050505); // Fondo casi negro
scene.fog = new THREE.FogExp2(0x050505, 0.002);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 30;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.getElementById('canvas-container').appendChild(renderer.domElement);

// Controles (OrbitControls)
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.5;

// --- Iluminación ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xff3366, 2, 100);
pointLight.position.set(10, 10, 10);
scene.add(pointLight);

const pointLight2 = new THREE.PointLight(0x3366ff, 1, 100);
pointLight2.position.set(-10, -10, 10);
scene.add(pointLight2);

// --- 1. Crear el Corazón 3D ---
const heartShape = new THREE.Shape();
const x = 0, y = 0;

heartShape.moveTo(x + 5, y + 5);
heartShape.bezierCurveTo(x + 5, y + 5, x + 4, y, x, y);
heartShape.bezierCurveTo(x - 6, y, x - 6, y + 7, x - 6, y + 7);
heartShape.bezierCurveTo(x - 6, y + 11, x - 3, y + 15.4, x + 5, y + 19);
heartShape.bezierCurveTo(x + 12, y + 15.4, x + 16, y + 11, x + 16, y + 7);
heartShape.bezierCurveTo(x + 16, y + 7, x + 16, y, x + 10, y);
heartShape.bezierCurveTo(x + 7, y, x + 5, y + 5, x + 5, y + 5);

const extrudeSettings = {
    depth: 2,
    bevelEnabled: true,
    bevelSegments: 2,
    steps: 2,
    bevelSize: 1,
    bevelThickness: 1
};

const geometryHeart = new THREE.ExtrudeGeometry(heartShape, extrudeSettings);
geometryHeart.center(); // Centrar geometría

const materialHeart = new THREE.MeshPhongMaterial({ 
    color: 0xff0040, 
    shininess: 100,
    specular: 0xffaaaa,
    emissive: 0x330011 
});

const heartMesh = new THREE.Mesh(geometryHeart, materialHeart);
heartMesh.rotation.z = Math.PI; 
heartMesh.scale.set(0.5, 0.5, 0.5);
scene.add(heartMesh);

// --- 2. Anillo ---
const geometryRing = new THREE.TorusGeometry(12, 0.1, 16, 100);
const materialRing = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.3 });
const ringMesh = new THREE.Mesh(geometryRing, materialRing);
ringMesh.rotation.x = Math.PI / 2;
scene.add(ringMesh);

// --- 3. Palabras Flotantes ---
const words = ["Te Amo", "Mi Vida", "Siempre Juntos", "Mi Luz", "Mi Universo", "Mi Todo", "Amor Eterno", "Mi Princesa"];
const textGroup = new THREE.Group();

function createTextTexture(message) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 512;
    canvas.height = 128;
    
    ctx.font = "Bold 60px Arial";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = "#ff3366";
    ctx.shadowBlur = 15;
    ctx.fillText(message, canvas.width / 2, canvas.height / 2);
    
    return new THREE.CanvasTexture(canvas);
}

const radius = 12;
words.forEach((word, i) => {
    const map = createTextTexture(word);
    const material = new THREE.SpriteMaterial({ map: map });
    const sprite = new THREE.Sprite(material);
    
    const angle = (i / words.length) * Math.PI * 2;
    sprite.position.x = Math.cos(angle) * radius;
    sprite.position.z = Math.sin(angle) * radius;
    sprite.position.y = 0;
    
    sprite.scale.set(8, 2, 1);
    textGroup.add(sprite);
});

textGroup.rotation.x = Math.PI / 8;
textGroup.rotation.z = Math.PI / 8;
scene.add(textGroup);

// --- 4. Estrellas ---
const starsGeometry = new THREE.BufferGeometry();
const starsCount = 2000;
const posArray = new Float32Array(starsCount * 3);

for(let i = 0; i < starsCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 100; 
}

starsGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
const starsMaterial = new THREE.PointsMaterial({
    size: 0.15,
    color: 0xffffff,
    transparent: true,
    opacity: 0.8,
});

const starsMesh = new THREE.Points(starsGeometry, starsMaterial);
scene.add(starsMesh);

// --- Animación ---
let time = 0;

function animate() {
    requestAnimationFrame(animate);
    time += 0.01;

    // Latido
    const beat = 1 + Math.sin(time * 5) * 0.05 + Math.sin(time * 10) * 0.05;
    heartMesh.scale.set(0.5 * beat, 0.5 * beat, 0.5 * beat);
    
    // Rotaciones
    heartMesh.rotation.y += 0.005;
    textGroup.rotation.y -= 0.005;
    starsMesh.rotation.y += 0.0005;

    controls.update();
    renderer.render(scene, camera);
}

// --- Eventos ---
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

document.getElementById('openBtn').addEventListener('click', () => {
    document.getElementById('overlay').classList.add('hidden');
    setTimeout(() => {
        document.getElementById('overlay').style.display = 'none';
        document.getElementById('final-message').style.opacity = '1';
        animate(); 
    }, 1000);
});