// Temel Sahne Kurulumu
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xa0a0a0);
scene.fog = new THREE.Fog(0xa0a0a0, 10, 50);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('canvas-container').appendChild(renderer.domElement);

// Işıklar
const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444);
hemiLight.position.set(0, 20, 0);
scene.add(hemiLight);

// Zemin (1. Köy Harita Simülasyonu)
const groundGeo = new THREE.PlaneGeometry(100, 100);
const groundMat = new THREE.MeshPhongMaterial({ color: 0x557a2b, depthWrite: false });
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

// Grid (Hareketi gözle net görmek için yere çizgiler ekliyoruz)
const grid = new THREE.GridHelper(100, 50, 0x000000, 0x444444);
grid.position.y = 0.01;
scene.add(grid);

// 3D Oyuncu Karakteri (Mavi Silindir)
const playerGeo = new THREE.CylinderGeometry(0.4, 0.4, 1.5, 16);
const playerMat = new THREE.MeshPhongMaterial({ color: 0x0000ff });
const player = new THREE.Mesh(playerGeo, playerMat);
player.position.set(0, 0.75, 0);
scene.add(player);

// 3D Hayvan / Canavar (Kırmızı Küp - Haritada Sabit)
const monsterGeo = new THREE.BoxGeometry(1, 1, 1);
const monsterMat = new THREE.MeshPhongMaterial({ color: 0x8b0000 });
const monster = new THREE.Mesh(monsterGeo, monsterMat);
monster.position.set(0, 0.5, -10); // Tam karşıda sabit bekliyor
scene.add(monster);

// Klavye Kontrolleri
const keys = { w: false, a: false, s: false, d: false };
window.addEventListener('keydown', (e) => { if(keys[e.key.toLowerCase()] !== undefined) keys[e.key.toLowerCase()] = true; });
window.addEventListener('keyup', (e) => { if(keys[e.key.toLowerCase()] !== undefined) keys[e.key.toLowerCase()] = false; });

// Saldırı Mekaniği (Sol Tık ile Hayvana Vurma)
let monsterHealth = 100;
window.addEventListener('click', () => {
    const distance = player.position.distanceTo(monster.position);
    if (distance < 2.5 && monsterHealth > 0) {
        monsterHealth -= 25;
        monster.material.color.setHex(0xffffff); // Vurulduğunda beyaz flaş efekti
        setTimeout(() => monster.material.color.setHex(0x8b0000), 100);
        if (monsterHealth <= 0) {
            scene.remove(monster); // Öldüğünde haritadan sil
            document.getElementById('ui-overlay').innerText = "Tebrikler! Hayvanı kestiniz.";
        }
    }
});

// Oyun Döngüsü (Render Loop)
function animate() {
    requestAnimationFrame(animate);

    // Oyuncu Hareketi (Düzeltilmiş Gerçekçi WASD Yönleri)
    const speed = 0.1;
    if (keys.w) player.position.z -= speed; // W tuşu ileri (Kırmızı küpe doğru) götürür
    if (keys.s) player.position.z += speed; // S tuşu geriye çeker
    if (keys.a) player.position.x -= speed; // A tuşu sola kaydırır
    if (keys.d) player.position.x += speed; // D tuşu sağa kaydırır

    // Sabit Kamera Takibi (Kamera havada sabit durur, oyuncuyu izler)
    camera.position.set(player.position.x, player.position.y + 6, player.position.z + 10);
    camera.lookAt(player.position);

    renderer.render(scene, camera);
}
animate();
