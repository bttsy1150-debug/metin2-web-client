// --- OYUN AYARLARI VE GLOBAL DEĞİŞKENLER ---
var pStats = { level: 3, hp: 940, maxHp: 1000, exp: 40, maxExp: 100, yang: 5000, weaponUpgrade: 0 };

// 3D Sahne Bileşenleri
var scene, camera, renderer;
var playerMesh, smithMesh;
var activeKeys = { w: false, a: false, s: false, d: false };

// 3D Canavar Listesi (X, Z koordinatları 3D uzaya uyarlandı)
var mobList = [
    { id: 1, name: "Yabani Köpek", x: -15, z: -15, hp: 90, isDead: false, isAggressive: false, mesh: null },
    { id: 2, name: "Yabani Köpek", x: 15, z: -10, hp: 90, isDead: false, isAggressive: false, mesh: null },
    { id: 3, name: "Aç Yabani Köpek", x: -10, z: 15, hp: 120, isDead: false, isAggressive: false, mesh: null },
    { id: 4, name: "Kurt", x: 10, z: 10, hp: 150, isDead: false, isAggressive: false, mesh: null },
    { id: 5, name: "Aç Kurt", x: 0, z: -18, hp: 150, isDead: false, isAggressive: false, mesh: null }
];

var smithPos = { x: 18, z: -15 }; // Demirci 3D konumu

// --- THREE.JS BAŞLATIPI SAHNEYİ KURMA ---
function init3D() {
    var container = document.getElementById('threejs-canvas-container');
    if (!container) return;

    // 1. Sahne (Scene)
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a2414); // Metin2 Koyu Yeşil Atmosfer Rengi

    // 2. Kamera (Perspective Camera) - Metin2 Kuş Bakışı Görüş Açısı
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
    
    // 3. Renderer (WebGL Motoru)
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    // 4. Işıklandırma (Ortam ve Güneş Işığı)
    var ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    var directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
    directionalLight.position.set(10, 20, 15);
    scene.add(directionalLight);

    // 5. 3D Zemin (Harita)
    var floorGeo = new THREE.PlaneGeometry(60, 60);
    var floorMat = new THREE.MeshStandardMaterial({ color: 0x2c421e, roughness: 0.8 });
    var floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2; // Zemini yatay pozisyona getiriyoruz
    scene.add(floor);

    // 6. Oyuncu Savaşçı Modeli (Mavi 3D Kutu)
    var playerGeo = new THREE.BoxGeometry(1.5, 2, 1.5);
    var playerMat = new THREE.MeshStandardMaterial({ color: 0x0000ff, roughness: 0.5 });
    playerMesh = new THREE.Mesh(playerGeo, playerMat);
    playerMesh.position.set(0, 1, 0); // Ayakları zemine bassın
    scene.add(playerMesh);

    // 7. Demirci NPC Modeli (Gri 3D Kutu)
    var smithGeo = new THREE.BoxGeometry(2, 2.5, 2);
    var smithMat = new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.5 });
    smithMesh = new THREE.Mesh(smithGeo, smithMat);
    smithMesh.position.set(smithPos.x, 1.25, smithPos.z);
    scene.add(smithMesh);

    // 8. Canavarları Sahneye Ekleme Döngüsü (Kırmızı 3D Kutular)
    mobList.forEach(function(mob) {
        var mobGeo = new THREE.BoxGeometry(1.5, 1.5, 1.5);
        var mobMat = new THREE.MeshStandardMaterial({ color: 0x8b0000, roughness: 0.5 });
        var mMesh = new THREE.Mesh(mobGeo, mobMat);
        mMesh.position.set(mob.x, 0.75, mob.z);
        scene.add(mMesh);
        mob.mesh = mMesh; // JavaScript referansını bağlıyoruz
    });

    // Klavye Eventleri Bağlantısı
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('resize', onWindowResize);

    drawInterface();
    animate();
}

// --- OYUN MOTORU VE ANIMASYON DÖNGÜSÜ ---
function animate() {
    requestAnimationFrame(animate);

    // 1. WASD ile 3D Hareket Kontrolü
    var moveSpeed = 0.15;
    var prevX = playerMesh.position.x;
    var prevZ = playerMesh.position.z;

    if (activeKeys.w) playerMesh.position.z -= moveSpeed;
    if (activeKeys.s) playerMesh.position.z += moveSpeed;
    if (activeKeys.a) playerMesh.position.x -= moveSpeed;
    if (activeKeys.d) playerMesh.position.x += moveSpeed;

    // Harita Sınır Kontrolü (-28, +28 arası)
    if (playerMesh.position.x < -28 || playerMesh.position.x > 28) playerMesh.position.x = prevX;
    if (playerMesh.position.z < -28 || playerMesh.position.z > 28) playerMesh.position.z = prevZ;

    // Demirci Katı Cisim Çarpışma Testi (Fizik)
    var distToSmith = playerMesh.position.distanceTo(smithMesh.position);
    if (distToSmith < 2.2) {
        playerMesh.position.x = prevX;
        playerMesh.position.z = prevZ;
    }

    // 2. Canavar Yapay Zekası ve Takip Algoritması
    mobList.forEach(function(mob) {
        if (mob.isDead || !mob.isAggressive) return;

        var dist = mob.mesh.position.distanceTo(playerMesh.position);
        
        // Slot yakınsa oyuncuya doğru yürür
        if (dist < 15) {
            var dirX = playerMesh.position.x - mob.mesh.position.x;
            var dirZ = playerMesh.position.z - mob.mesh.position.z;
            
            // Normalize etme ve yürüme ivmesi
            mob.mesh.position.x += (dirX / dist) * 0.05;
            mob.mesh.position.z += (dirZ / dist) * 0.05;

            // Vuruş Menzili Kontrolü
            if (dist < 1.8) {
                if (Math.random() < 0.02) {
                    pStats.hp -= 8;
                    if (pStats.hp <= 0) {
                        pStats.hp = pStats.maxHp;
                        playerMesh.position.set(0, 1, 0); // Ölen oyuncu başlangıç noktasında doğar
                        mobList.forEach(function(m) { m.isAggressive = false; });
                    }
                    drawInterface();
                }
            }
        }
    });

    // 3. Metin2 TPS Kamera Takip Sistemi (Oyuncunun arkasından yukarı bakış)
    camera.position.x = playerMesh.position.x;
    camera.position.y = playerMesh.position.y + 16; // Kamera yüksekliği
    camera.position.z = playerMesh.position.z + 18; // Kamera arkaya kayma mesafesi
    camera.lookAt(playerMesh.position); // Kamera sürekli oyuncuya odaklanır

    // Realtime Render
    renderer.render(scene, camera);
}

// --- INTERACTION & EVENT LISTENERS ---
function onKeyDown(e) {
    var key = e.key.toLowerCase();
    if (activeKeys[key] !== undefined) activeKeys[key] = true;
    if (key === 'w' || key === 'a' || key === 's' || key === 'd') drawInterface();

    // DEMİRCİ ETKİLEŞİMİ (E TUŞU)
    if (e.key === 'e' || e.key === 'E') {
        var dist = playerMesh.position.distanceTo(smithMesh.position);
        if (dist < 4.0) {
            if (pStats.weaponUpgrade >= 9) return;
            var cost = (pStats.weaponUpgrade + 1) * 800;
            if (pStats.yang >= cost) {
                pStats.yang -= cost;
                pStats.weaponUpgrade++;
                // Demirci Başarılı Parlama Efekti (Yeşil Renk Değişimi)
                smithMesh.material.color.setHex(0x00ff00);
                setTimeout(function() { smithMesh.material.color.setHex(0x555555); }, 500);
            }
            drawInterface();
        }
    }

    // SPACE TUŞU İLE SALDIRI
    if (e.key === ' ' || e.code === 'Space') {
        var damage = 30 + (pStats.weaponUpgrade * 10);
        mobList.forEach(function(mob) {
            if (mob.isDead) return;
            var dist = playerMesh.position.distanceTo(mob.mesh.position);
            
            // Saldırı Menzili kontrolü
            if (dist < 4.0) {
                mob.hp -= damage;
                mob.isAggressive = true;
                
                // Canavara Vurulma Flaş Efekti (Beyaz Renk)
                mob.mesh.material.color.setHex(0xffffff);
                setTimeout(function() { if (mob.mesh) mob.mesh.material.color.setHex(0x8b0000); }, 100);

                if (mob.hp <= 0) {
                    mob.isDead = true;
                    pStats.exp += 35;
                    pStats.yang += Math.floor(Math.random() * 300) + 150; // Doğrudan cüzdana Yang eklenir
                    scene.remove(mob.mesh); // 3D Sahneden kaldırılıyor

                    if (pStats.exp >= pStats.maxExp) {
                        pStats.level++; pStats.exp = 0; pStats.maxHp += 100; pStats.hp = pStats.maxHp;
                    }

                    // 3D Respawn Mekanizması
                    setTimeout(function() {
                        mob.isDead = false;
                        mob.isAggressive = false;
                        mob.hp = mob.name.includes("Kurt") ? 150 : 90;
                        mob.mesh.position.set(Math.random() * 40 - 20, 0.75, Math.random() * 40 - 20);
                        scene.add(mob.mesh);
                    }, 5000);
                }
            }
        });
        drawInterface();
    }
}

function onKeyUp(e) {
    var key = e.key.toLowerCase();
    if (activeKeys[key] !== undefined) activeKeys[key] = false;
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function drawInterface() {
    var ui = document.getElementById('stats-ui');
    if (!ui) return;
    
    var currentDamage = 30 + (pStats.weaponUpgrade * 10);
    var cost = (pStats.weaponUpgrade + 1) * 800;
    var smithPrompt = "";
    
    if (playerMesh && smithMesh) {
        var dist = playerMesh.position.distanceTo(smithMesh.position);
        if (dist < 4.0) {
            if (pStats.weaponUpgrade >= 9) {
                smithPrompt = '<div style="color:#00ff00; font-size:11px; margin-top:4px; text-align:center;"><b>[Silah Maksimum Seviyede!]</b></div>';
            } else {
                smithPrompt = '<div style="color:#ffdd00; font-size:11px; margin-top:4px; text-align:center;"><b>Demirciye Yakınsın!</b><br>Kılıcı Yükseltmek İçin <b>"E"</b> bas.<br>Maliyet: <b>' + cost + ' Yang</b></div>';
            }
        }
    }

    var expPct = (pStats.exp / pStats.maxExp) * 100;
    ui.innerHTML = `
