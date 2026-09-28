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

// Grid (Çizgiler)
const grid = new THREE.GridHelper(100, 50, 0x000000, 0x444444);
grid.position.y = 0.01;
scene.add(grid);

// 3D Oyuncu Karakteri (Mavi Silindir)
const playerGeo = new THREE.CylinderGeometry(0.4, 0.4, 1.5, 16);
const playerMat = new THREE.MeshPhongMaterial({ color: 0x0000ff });
const player = new THREE.Mesh(playerGeo, playerMat);
player.position.set(0, 0.75, 0);
scene.add(player);

// --- ÇOKLU CANAVAR SİSTEMİ ---
const monsters = [];
const maxMonsters = 5;

// Canavar Oluşturma Fonksiyonu
function spawnMonster(id, x, z) {
    const monsterGeo = new THREE.BoxGeometry(1, 1, 1);
    const monsterMat = new THREE.MeshPhongMaterial({ color: 0x8b0000 });
    const monster = new THREE.Mesh(monsterGeo, monsterMat);
    
    monster.position.set(x, 0.5, z);
    monster.userData = { id: id, health: 100, startX: x, startZ: z, isDead: false };
    
    scene.add(monster);
    monsters.push(monster);
}

// İlk Başlangıçta 5 Tane Canavarı Farklı Koordinatlara Dağıt
spawnMonster(1, 0, -10);
spawnMonster(2, -8, -15);
spawnMonster(3, 8, -12);
spawnMonster(4, -12, -8);
spawnMonster(5, 10, -20);

// Klavye Kontrolleri
const keys = { w: false, a: false, s: false, d: false };
window.addEventListener('keydown', (e) => { if(keys[e.key.toLowerCase()] !== undefined) keys[e.key.toLowerCase()] = true; });
window.addEventListener('keyup', (e) => { if(keys[e.key.toLowerCase()] !== undefined) keys[e.key.toLowerCase()] = false; });

// Saldırı Mekaniği (En Yakındaki Canavara Vurma)
window.addEventListener('click', () => {
    monsters.forEach((monster) => {
        if (monster.userData.isDead) return; // Ölü canavara vurma

        const distance = player.position.distanceTo(monster.position);
        
        // Eğer canavara yakınsak vur
        if (distance < 2.5) {
            monster.userData.health -= 25;
            monster.material.color.setHex(0xffffff); // Vurulduğunda beyaz flaş efekti
            setTimeout(() => { if(!monster.userData.isDead) monster.material.color.setHex(0x8b0000); }, 100);
            
            document.getElementById('ui-overlay').innerText = `Canavara Vurdun! Kalan Can: %${monster.userData.health}`;

            if (monster.userData.health <= 0) {
                monster.userData.isDead = true;
                scene.remove(monster); // Haritadan kaldır
                document.getElementById('ui-overlay').innerText = "Canavar kesildi! 5 saniye sonra yeniden doğacak.";
                
                // 5 Saniye Sonra Yeniden Doğma Mantığı (RESPAWN)
                setTimeout(() => {
                    monster.userData.health = 100;
                    monster.userData.isDead = false;
                    monster.position.set(monster.userData.startX, 0.5, monster.userData.startZ);
                    monster.material.color.setHex(0x8b0000);
                    scene.add(monster);
                    document.getElementById('ui-overlay').innerText = "Yönlendirme: WASD ile hareket et | Sol Tık: Hayvana Saldır";
                }, 5000);
            }
        }
    });
});

// Oyun Döngüsü (Render Loop)
function animate() {
    requestAnimationFrame(animate);

    // Oyuncu Hareketi
    const speed = 0.1;
    if (keys.w) player.position.z -= speed;
    if (keys.s) player.position.z += speed;
    if (keys.a) player.position.x -= speed;
    if (keys.d) player.position.x += speed;

    // Sabit Kamera Takibi
    camera.position.set(player.position.x, player.position.y + 6, player.position.z + 10);
    camera.lookAt(player.position);

    renderer.render(scene, camera);
}
animate();
