// En Temel Kararlı 3D Sahne Kurulumu
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x7ec0ee); // Mavi Gökyüzü

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('canvas-container').appendChild(renderer.domElement);

// Işıklar
const light = new THREE.AmbientLight(0xffffff, 1.5);
scene.add(light);

// Yeşil Çimenlik Zemin
const ground = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), new THREE.MeshBasicMaterial({ color: 0x4c702a }));
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

// Çizgiler (Hareketi görmek için)
const grid = new THREE.GridHelper(100, 50, 0x000000, 0x222222);
grid.position.y = 0.01;
scene.add(grid);

// Oyuncu Karakteri (Mavi Kutu)
const player = new THREE.Mesh(new THREE.BoxGeometry(1, 2, 1), new THREE.MeshBasicMaterial({ color: 0x0000ff }));
player.position.set(0, 1, 0);
scene.add(player);

// Sabit Duran Canavar (Kırmızı Kutu)
const monster = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({ color: 0x8b0000 }));
monster.position.set(0, 0.5, -10);
scene.add(monster);

// Klavye Kontrolleri
const keys = { w: false, a: false, s: false, d: false };
window.addEventListener('keydown', (e) => { if(keys[e.key.toLowerCase()] !== undefined) keys[e.key.toLowerCase()] = true; });
window.addEventListener('keyup', (e) => { if(keys[e.key.toLowerCase()] !== undefined) keys[e.key.toLowerCase()] = false; });

// Canavar Kesme Mekaniği (Yaklaşınca Tıkla)
window.addEventListener('click', () => {
    if (player.position.distanceTo(monster.position) < 3) {
        scene.remove(monster);
        document.getElementById('ui-overlay').innerText = "Tebrikler! Hayvanı kestiniz. Yenilemek için F5 yapın.";
    }
});

// Oyun Döngüsü
function animate() {
    requestAnimationFrame(animate);

    // Düzeltilmiş Yönler ile Yürüme
    if (keys.w) player.position.z -= 0.1;
    if (keys.s) player.position.z += 0.1;
    if (keys.a) player.position.x -= 0.1;
    if (keys.d) player.position.x += 0.1;

    // Kamera Takibi
    camera.position.set(player.position.x, player.position.y + 5, player.position.z + 10);
    camera.lookAt(player.position);

    renderer.render(scene, camera);
}
document.getElementById('ui-overlay').innerText = "Yönlendirme: WASD ile hareket et | Sol Tık: Hayvana Saldır";
animate();
