// --- 1. 3D SAHNE VE IŞIK KURULUMU ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x7ec0ee); // Metin2 Gökyüzü Mavisi
scene.fog = new THREE.FogExp2(0x7ec0ee, 0.015);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('canvas-container').appendChild(renderer.domElement);

const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.4);
hemiLight.position.set(0, 20, 0);
scene.add(hemiLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
dirLight.position.set(5, 15, 7);
scene.add(dirLight);

// Yeşil Zemin ve Çizgiler
const ground = new THREE.Mesh(new THREE.PlaneGeometry(150, 150), new THREE.MeshStandardMaterial({ color: 0x4c702a, roughness: 0.8 }));
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

const grid = new THREE.GridHelper(150, 75, 0x222222, 0x3d5427);
grid.position.y = 0.01;
scene.add(grid);

// --- 2. OYUNCU VE CANAVAR STATÜLERİ ---
let playerStats = { level: 3, hp: 940, maxHp: 1000, exp: 40, maxExp: 100, isDead: false };

// 3D Savaşçı Grubu (Zırh, Kask ve Kılıç)
const playerGroup = new THREE.Group();
const body = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 1.4, 16), new THREE.MeshStandardMaterial({ color: 0x4a5359, metalness: 0.7 }));
body.position.y = 0.7;
playerGroup.add(body);

const head = new THREE.Mesh(new THREE.SphereGeometry(0.25, 16, 16), new THREE.MeshStandardMaterial({ color: 0xd1d7da, metalness: 0.8 }));
head.position.y = 1.5;
playerGroup.add(head);

const sword = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.1, 0.15), new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.9 }));
sword.position.set(0.5, 0.8, -0.2);
sword.rotation.x = Math.PI / 4;
playerGroup.add(sword);

playerGroup.position.set(0, 0, 0);
scene.add(playerGroup);

// Çoklu 3D Canavar Sistemi (Yabani Köpek Küpleri)
const monsters = [];
const spawnCoordinates = [{x: 0, z: -12}, {x: -10, z: -18}, {x: 12, z: -15}, {x: -15, z: -10}, {x: 14, z: -25}];

function spawnMonster(id, x, z) {
    const monsterGroup = new THREE.Group();
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.6, 1.2), new THREE.MeshStandardMaterial({ color: 0x5a3d28, roughness: 0.9 }));
    torso.position.y = 0.5;
    monsterGroup.add(torso);
    
    const mHead = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 0.4), new THREE.MeshStandardMaterial({ color: 0x5a3d28 }));
    mHead.position.set(0, 0.8, -0.6);
    monsterGroup.add(mHead);

    monsterGroup.position.set(x, 0, z);
    monsterGroup.userData = { id: id, health: 90, maxHealth: 90, startX: x, startZ: z, isDead: false, isAngry: false, lastAttackTime: 0 };
    
    scene.add(monsterGroup);
    monsters.push(monsterGroup);
}
spawnCoordinates.forEach((coord, index) => { spawnMonster(index + 1, coord.x, coord.z); });

// --- 3. ARAYÜZ MOTORU ---
function updateGameUI() {
    let ui = document.getElementById('ui-overlay');
    if (!ui) return;
    
    if (playerStats.isDead) {
        ui.innerHTML = `<b style="color:red; font-size:20px;">ÖLDÜNÜZ!</b><br><br><button onclick="window.resurrectPlayer()" style="pointer-events:auto; padding:10px 20px; font-weight:bold; cursor:pointer;">Şehirde Yeniden Başla</button>`;
        return;
    }
    
    let expPercent = (playerStats.exp / playerStats.maxExp) * 100;
    ui.innerHTML = `
        <div style="font-size:16px; font-weight:bold; color:#ffdd00; margin-bottom:5px;">Metin2 Web Test Server [Lv. ${playerStats.level}]</div>
        <div style="width: 250px; background: #444; border: 1px solid #000; padding:2px; margin-bottom:5px;">
            <div style="width: ${(playerStats.hp / playerStats.maxHp) * 100}%; background: red; height: 12px; text-align:center; font-size:10px; line-height:12px;">HP: ${playerStats.hp}/${playerStats.maxHp}</div>
        </div>
        <div style="width: 250px; background: #444; border: 1px solid #000; padding:2px; margin-bottom:10px;">
            <div style="width: ${expPercent}%; background: #00ffcc; height: 12px; text-align:center; font-size:10px; line-height:12px; color:#000;">EXP: %${expPercent.toFixed(0)}</div>
        </div>
        <div style="background: rgba(255,255,255,0.1); padding: 5px; text-align:center; border-radius:4px; margin-bottom:5px;">
            <button id="attack-btn" style="pointer-events:auto; padding: 6px 12px; font-weight: bold; background: #ffdd00; border: none; cursor: pointer; color:#000;">Yabani Köpeğe Saldır!</button>
        </div>
        <div style="font-size:11px; color:#ddd;">WASD: Yürüme Kontrolü</div>
    `;

    setTimeout(() => {
        const btn = document.getElementById('attack-btn');
        if (btn) {
            btn.onclick = function() {
                if (playerStats.isDead) return;
                sword.rotation.z = Math.PI / 3;
                setTimeout(() => sword.rotation.z = 0, 150);
                
                monsters.forEach((monster) => {
                    if (monster.userData.isDead) return;
                    if (playerGroup.position.distanceTo(monster.position) < 3.5) {
                        monster.userData.health -= 30;
                        monster.userData.isAngry = true;
                        if (monster.userData.health <= 0) {
                            monster.userData.isDead = true;
                            scene.remove(monster);
                            playerStats.exp += 35;
                            if (playerStats.exp >= playerStats.maxExp) {
                                playerStats.level++; playerStats.exp = 0; playerStats.maxHp += 120; playerStats.hp = playerStats.maxHp;
                            }
                            setTimeout(() => {
                                monster.userData.health = monster.userData.maxHealth; monster.userData.isDead = false; monster.userData.isAngry = false;
                                monster.position.set(monster.userData.startX, 0, monster.userData.startZ); scene.add(monster);
                            }, 5000);
                        }
                    }
                });
                updateGameUI();
            };
        }
    }, 100);
}

window.resurrectPlayer = function() {
    playerStats.hp = playerStats.maxHp; playerStats.isDead = false;
    playerGroup.position.set(0, 0, 0); playerGroup.rotation.set(0, 0, 0);
    updateGameUI();
};

// --- 4. HAREKET VE AKSİYON DÖNGÜSÜ ---
const keys = { w: false, a: false, s: false, d: false };
window.addEventListener('keydown', (e) => { if(!playerStats.isDead && keys[e.key.toLowerCase()] !== undefined) keys[e.key.toLowerCase()] = true; });
window.addEventListener('keyup', (e) => { if(keys[e.key.toLowerCase()] !== undefined) keys[e.key.toLowerCase()] = false; });

const clock = new THREE.Clock();
function animate() {
    requestAnimationFrame(animate);
    const time = clock.getElapsedTime();

    if (!playerStats.isDead) {
        const speed = 0.12;
        if (keys.w) { playerGroup.position.z -= speed; playerGroup.rotation.y = Math.PI; }
        if (keys.s) { playerGroup.position.z += speed; playerGroup.rotation.y = 0; }
        if (keys.a) { playerGroup.position.x -= speed; playerGroup.rotation.y = -Math.PI / 2; }
        if (keys.d) { playerGroup.position.x += speed; playerGroup.rotation.y = Math.PI / 2; }

        monsters.forEach((monster) => {
            if (monster.userData.isDead) return;
            const dist = monster.position.distanceTo(playerGroup.position);
            if (monster.userData.isAngry) {
                const dir = new THREE.Vector3().subVectors(playerGroup.position, monster.position).normalize();
                if (dist > 1.3) {
                    monster.position.x += dir.x * 0.05; monster.position.z += dir.z * 0.05;
                    monster.lookAt(playerGroup.position.x, monster.position.y, playerGroup.position.z);
                } else {
                    if (time - monster.userData.lastAttackTime > 1.5) {
                        playerStats.hp -= 45; monster.position.y += 0.3; setTimeout(() => monster.position.y = 0, 150);
                        monster.userData.lastAttackTime = time;
                        if (playerStats.hp <= 0) { playerStats.hp = 0; playerStats.isDead = true; playerGroup.rotation.z = Math.PI / 2; }
                        updateGameUI();
                    }
                }
            }
        });
    }
    camera.position.set(playerGroup.position.x, playerGroup.position.y + 6, playerGroup.position.z + 10);
    camera.lookAt(playerGroup.position);
    renderer.render(scene, camera);
}

updateGameUI();
animate();
