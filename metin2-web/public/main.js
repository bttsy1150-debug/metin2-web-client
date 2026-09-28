// --- 1. TEMEL MOTOR VE SAHNE KURULUMU ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x7ec0ee); // Metin2 Gökyüzü Mavisi
scene.fog = new THREE.FogExp2(0x7ec0ee, 0.015);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('canvas-container').appendChild(renderer.domElement);

// Işıklandırma Sistemleri
const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.4);
hemiLight.position.set(0, 20, 0);
scene.add(hemiLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
dirLight.position.set(5, 15, 7);
scene.add(dirLight);

// Zemin (1. Köy Çim Kaplaması Simülasyonu)
const groundGeo = new THREE.PlaneGeometry(150, 150);
const groundMat = new THREE.MeshStandardMaterial({ color: 0x4c702a, roughness: 0.8 }); 
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

const grid = new THREE.GridHelper(150, 75, 0x222222, 0x3d5427);
grid.position.y = 0.01;
scene.add(grid);

// --- 2. OYUNCU STATÜ VE GÖRÜNÜM SİSTEMİ ---
let playerStats = { level: 2, hp: 855, maxHp: 900, exp: 35, maxExp: 100, isDead: false };

const playerGroup = new THREE.Group();

// Savaşçı Görünümü (Gövde + Baş + Kılıç)
const bodyGeo = new THREE.CylinderGeometry(0.3, 0.3, 1.4, 16);
const bodyMat = new THREE.MeshStandardMaterial({ color: 0x4a5359, metalness: 0.7, roughness: 0.2 });
const body = new THREE.Mesh(bodyGeo, bodyMat);
body.position.y = 0.7;
playerGroup.add(body);

const headGeo = new THREE.SphereGeometry(0.25, 16, 16);
const headMat = new THREE.MeshStandardMaterial({ color: 0xd1d7da, metalness: 0.8 });
const head = new THREE.Mesh(headGeo, headMat);
head.position.y = 1.5;
playerGroup.add(head);

const swordGeo = new THREE.BoxGeometry(0.05, 1.1, 0.15);
const swordMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.9, roughness: 0.1 });
const sword = new THREE.Mesh(swordGeo, swordMat);
sword.position.set(0.5, 0.8, -0.2);
sword.rotation.x = Math.PI / 4;
playerGroup.add(sword);

playerGroup.position.set(0, 0, 0);
scene.add(playerGroup);

// --- 3. GELİŞMİŞ CANAVAR SİSTEMİ ---
const monsters = [];
const spawnCoordinates = [
    {x: 0, z: -12}, {x: -10, z: -18}, {x: 12, z: -15}, {x: -15, z: -10}, {x: 14, z: -25}
];

function spawnMonster(id, x, z) {
    const monsterGroup = new THREE.Group();
    
    // Canavar Görünümü (Gövde + Kafa Düzeni)
    const torsoGeo = new THREE.BoxGeometry(0.7, 0.6, 1.2);
    const torsoMat = new THREE.MeshStandardMaterial({ color: 0x5a3d28, roughness: 0.9 });
    const torso = new THREE.Mesh(torsoGeo, torsoMat);
    torso.position.y = 0.5;
    monsterGroup.add(torso);
    
    const mHeadGeo = new THREE.BoxGeometry(0.4, 0.4, 0.4);
    const mHead = new THREE.Mesh(mHeadGeo, torsoMat);
    mHead.position.set(0, 0.8, -0.6);
    monsterGroup.add(mHead);

    monsterGroup.position.set(x, 0, z);
    monsterGroup.userData = { 
        id: id, health: 90, maxHealth: 90, startX: x, startZ: z, 
        isDead: false, isAngry: false, lastAttackTime: 0 
    };
    
    scene.add(monsterGroup);
    monsters.push(monsterGroup);
}

// Canavarları Dünyaya Dağıt
spawnCoordinates.forEach((coord, index) => {
    spawnMonster(index + 1, coord.x, coord.z);
});

// --- 4. ARAYÜZ (UI) GÜNCELLEME MOTORU ---
function updateGameUI() {
    let ui = document.getElementById('ui-overlay');
    if (!ui) return;
    
    if (playerStats.isDead) {
        ui.innerHTML = `<b style="color:red; font-size:20px;">ÖLDÜNÜZ!</b><br><br><button onclick="window.resurrectPlayer()" style="padding:10px 20px; font-weight:bold; cursor:pointer;">Şehirde Yeniden Başla</button>`;
        ui.style.pointerEvents = "auto";
        return;
    }
    
    ui.style.pointerEvents = "none";
    let expPercent = (playerStats.exp / playerStats.maxExp) * 100;
    ui.innerHTML = `
        <div style="font-size:16px; font-weight:bold; color:#ffdd00; margin-bottom:5px;">Metin2 Web Test Server [Lv. ${playerStats.level}]</div>
        <div style="width: 250px; background: #444; border: 1px solid #000; padding:2px; margin-bottom:5px;">
            <div style="width: ${(playerStats.hp / playerStats.maxHp) * 100}%; background: red; height: 12px; text-align:center; font-size:10px; line-height:12px;">HP: ${playerStats.hp}/${playerStats.maxHp}</div>
        </div>
        <div style="width: 250px; background: #444; border: 1px solid #000; padding:2px;">
            <div style="width: ${expPercent}%; background: #00ffcc; height: 12px; text-align:center; font-size:10px; line-height:12px; color:#000;">EXP: %${expPercent.toFixed(0)}</div>
        </div>
        <div style="margin-top:8px; font-size:11px; color:#ddd;">WASD: Hareket | Sol Tık: Canavara Saldır</div>
    `;
}

window.resurrectPlayer = function() {
    playerStats.hp = playerStats.maxHp;
    playerStats.isDead = false;
    playerGroup.position.set(0, 0, 0);
    playerGroup.rotation.set(0, 0, 0);
    updateGameUI();
};

// --- 5. HAREKET VE AKSİYON KONTROLLERİ ---
const keys = { w: false, a: false, s: false, d: false };
window.addEventListener('keydown', (e) => { if(!playerStats.isDead && keys[e.key.toLowerCase()] !== undefined) keys[e.key.toLowerCase()] = true; });
window.addEventListener('keyup', (e) => { if(keys[e.key.toLowerCase()] !== undefined) keys[e.key.toLowerCase()] = false; });

window.addEventListener('click', () => {
    if (playerStats.isDead) return;

    // Kılıç sallama rotasyon efekti
    if (sword.parent) {
        sword.rotation.z = Math.PI / 3;
        setTimeout(() => sword.rotation.z = 0, 150);
    }

    monsters.forEach((monster) => {
        if (monster.userData.isDead) return;

        const distance = playerGroup.position.distanceTo(monster.position);
        if (distance < 2.8) {
            monster.userData.health -= 30;
            monster.userData.isAngry = true; 
            
            monster.children.forEach(c => { if(c.material) c.material.color.setHex(0xffffff) });
            setTimeout(() => { monster.children.forEach(c => { if(c.material) c.material.color.setHex(0xff0000) }); }, 100);

            if (monster.userData.health <= 0) {
                monster.userData.isDead = true;
                scene.remove(monster);
                playerStats.exp += 35;
                
                if (playerStats.exp >= playerStats.maxExp) {
                    playerStats.level += 1;
                    playerStats.exp = 0;
                    playerStats.maxHp += 120;
                    playerStats.hp = playerStats.maxHp;
                    
                    const levelLight = new THREE.PointLight(0x00ff00, 3, 5);
                    levelLight.position.set(playerGroup.position.x, 2, playerGroup.position.z);
                    scene.add(levelLight);
                    setTimeout(() => scene.remove(levelLight), 1000);
                }
                
                setTimeout(() => {
                    monster.userData.health = monster.userData.maxHealth;
                    monster.userData.isDead = false;
                    monster.userData.isAngry = false;
                    monster.position.set(monster.userData.startX, 0, monster.userData.startZ);
                    monster.children.forEach(c => { if(c.material) c.material.color.setHex(0x5a3d28) });
                    scene.add(monster);
                }, 5000);
            }
        }
    });
    updateGameUI();
});

// --- 6. GERÇEK ZAMANLI OYUN DÖNGÜSÜ (AI VE HASAR ALGORİTMASI) ---
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    const time = clock.getElapsedTime();

    if (!playerStats.isDead) {
        const speed = 0.12;
        let moved = false;
        
        // Yön Kontrolleri (WASD)
        if (keys.w) { playerGroup.position.z -= speed; playerGroup.rotation.y = Math.PI; moved = true; }
        if (keys.s) { playerGroup.position.z += speed; playerGroup.rotation.y = 0; moved = true; }
        if (keys.a) { playerGroup.position.x -= speed; playerGroup.rotation.y = -Math.PI / 2; moved = true; }
        if (keys.d) { playerGroup.position.x += speed; playerGroup.rotation.y = Math.PI / 2; moved = true; }

        if (moved) { playerGroup.position.y = Math.sin(time * 12) * 0.08; } else { playerGroup.position.y = 0; }

        // Canavar Kovalama Yapay Zekası ve Saldırı Döngüsü
        monsters.forEach((monster) => {
            if (monster.userData.isDead) return;
            const dist = monster.position.distanceTo(playerGroup.position);

            if (monster.userData.isAngry) {
                const dir = new THREE.Vector3().subVectors(playerGroup.position, monster.position).normalize();
                if (dist > 1.3) {
                    monster.position.x += dir.x * 0.05;
                    monster.position.z += dir.z * 0.05;
                    monster.lookAt(playerGroup.position.x, monster.position.y, playerGroup.position.z);
                } else {
                    // Canavar her 1.5 saniyede bir oyuncuya hasar verir
                    if (time - monster.userData.lastAttackTime > 1.5) {
                        playerStats.hp -= 45; 
                        monster.position.y += 0.3; 
                        setTimeout(() => monster.position.y = 0, 150);
                        monster.userData.lastAttackTime = time;
                        
                        if (playerStats.hp <= 0) {
                            playerStats.hp = 0;
                            playerStats.isDead = true;
                            playerGroup.rotation.z = Math.PI / 2; 
                        }
                        updateGameUI();
                    }
                }
            }
        });
    }

    // Yumuşak Kamera Takibi
