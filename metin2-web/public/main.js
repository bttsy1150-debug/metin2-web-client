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

// Canavar Oluşturma Fonksiyonu
function spawnMonster(id, x, z) {
    const monsterGeo = new THREE.BoxGeometry(1, 1, 1);
    const monsterMat = new THREE.MeshPhongMaterial({ color: 0x8b0000 });
    const monster = new THREE.Mesh(monsterGeo, monsterMat);
    
    monster.position.set(x, 0.5, z);
    // isAngry: Vurulduğunda true olacak ve oyuncuyu takip edecek
    monster.userData = { id: id, health: 100, startX: x, startZ: z, isDead: false, isAngry: false };
    
    scene.add(monster);
    monsters.push(monster);
}

// 5 Canavarı Farklı Koordinatlara Dağıt
spawnMonster(1, 0, -10);
spawnMonster(2, -8, -15);
spawnMonster(3, 8, -12);
spawnMonster(4, -12, -8);
spawnMonster(5, 10, -20);

// Klavye Kontrolleri
const keys = { w: false, a: false, s: false, d: false };
window.addEventListener('keydown', (e) => { if(keys[e.key.toLowerCase()] !== undefined) keys[e.key.toLowerCase()] = true; });
window.addEventListener('keyup', (e) => { if(keys[e.key.toLowerCase()] !== undefined) keys[e.key.toLowerCase()] = false; });

// Saldırı Mekaniği
window.addEventListener('click', () => {
    monsters.forEach((monster) => {
        if (monster.userData.isDead) return;

        const distance = player.position.distanceTo(monster.position);
        
        if (distance < 2.5) {
            monster.userData.health -= 25;
            monster.userData.isAngry = true; // CANAVAR SİNİRLENDİ (TAKİP BAŞLIYOR)
            monster.material.color.setHex(0xffffff); // Vurulma efekti
            setTimeout(() => { if(!monster.userData.isDead) monster.material.color.setHex(0xff0000); }, 100); // Sinirlenince rengini tam kırmızı yap
            
            document.getElementById('ui-overlay').innerText = `Canavara Vurdun! Canı: %${monster.userData.health} - Seni Takip Ediyor!`;

            if (monster.userData.health <= 0) {
                monster.userData.isDead = true;
                monster.userData.isAngry = false;
                scene.remove(monster);
                document.getElementById('ui-overlay').innerText = "Canavar kesildi! 5 saniye sonra yerinde yeniden doğacak.";
                
                // RESPAWN
                setTimeout(() => {
                    monster.userData.health = 100;
                    monster.userData.isDead = false;
                    monster.userData.isAngry = false;
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

    // --- YAPAY ZEKA: SİNİRLENEN CANAVARLARIN OYUNCUYA KOŞMASI ---
    monsters.forEach((monster) => {
        if (!monster.userData.isDead && monster.userData.isAngry) {
            // Oyuncu ile canavar arasındaki yönü hesapla
            const dir = new THREE.Vector3();
            dir.subVectors(player.position, monster.position).normalize();
            
            // Eğer canavar oyuncuya çok çok yakın değilse üstüne doğru yürüt
            const dist = monster.position.distanceTo(player.position);
            if (dist > 1.2) {
                const monsterSpeed = 0.04; // Canavarın size koşma hızı
                monster.position.x += dir.x * monsterSpeed;
                monster.position.z += dir.z * monsterSpeed;
            } else {
                document.getElementById('ui-overlay').innerText = "Canavar size vuruyor! Dikkat edin!";
            }
        }
    });

    // Sabit Kamera Takibi
    camera.position.set(player.position.x, player.position.y + 6, player.position.z + 10);
    camera.lookAt(player.position);

    renderer.render(scene, camera);
}
animate();
