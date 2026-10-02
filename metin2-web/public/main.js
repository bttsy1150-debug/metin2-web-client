// --- OYUNCU AYARLARI VE BAŞLANGIÇ KONUMU ---
// weaponUpgrade: Kılıcın artı seviyesi (+0'dan başlar). Base hasar 30'dur.
let pStats = { level: 3, hp: 940, maxHp: 1000, exp: 40, maxExp: 100, yang: 5000, weaponUpgrade: 0 };
let pPos = { x: 270, y: 200 }; 

// --- 5 ADET HAREKETLİ CANAVAR LİSTESİ ---
let mobList = [
    { id: 1, name: "Yabani Köpek", x: 60, y: 60, hp: 90, isDead: false, isAggressive: false },
    { id: 2, name: "Yabani Köpek", x: 480, y: 170, hp: 90, isDead: false, isAggressive: false }, // Demirciye çok binmesin diye Y koordinatı az indirildi
    { id: 3, name: "Aç Yabani Köpek", x: 120, y: 320, hp: 120, isDead: false, isAggressive: false },
    { id: 4, name: "Kurt", x: 450, y: 300, hp: 150, isDead: false, isAggressive: false },
    { id: 5, name: "Aç Kurt", x: 320, y: 120, hp: 150, isDead: false, isAggressive: false }
];

// Sabit Demirci Konumu
const smithPos = { x: 500, y: 80 };

let droppedYangList = [];
let yangIdCounter = 0;

const container = document.getElementById('game-container');
const playerEl = document.getElementById('hero-player');

// Dinamik Efekt Oluşturucular
function spawnDamageText(x, y, amount) {
    const damageEl = document.createElement('div');
    damageEl.className = 'damage-indicator';
    damageEl.innerText = `-${amount}`;
    damageEl.style.left = x + 'px';
    damageEl.style.top = (y - 25) + 'px';
    container.appendChild(damageEl);
    setTimeout(() => { damageEl.remove(); }, 600);
}

function spawnSmithText(x, y, text, isSuccess) {
    const textEl = document.createElement('div');
    textEl.className = 'blacksmith-text';
    textEl.innerText = text;
    textEl.style.color = isSuccess ? '#00ff00' : '#ff3333';
    textEl.style.left = x + 'px';
    textEl.style.top = (y - 30) + 'px';
    container.appendChild(textEl);
    setTimeout(() => { textEl.remove(); }, 800);
}

// Canavar öldüğünde yere Yang düşüren fonksiyon
function dropYang(x, y) {
    yangIdCounter++;
    let randomAmount = Math.floor(Math.random() * (450 - 150 + 1)) + 150;
    
    let yangObj = {
        id: yangIdCounter,
        x: x + (Math.random() * 20 - 10),
        y: y + (Math.random() * 20 - 10),
        amount: randomAmount
    };
    
    droppedYangList.push(yangObj);
}

// Canavarları ve Oyuncuyu Çizen Fonksiyonlar
function renderMonsters() {
    mobList.forEach(mob => {
        let mEl = document.getElementById(`mob-${mob.id}`);
        if (mob.isDead) { if (mEl) mEl.remove(); return; }
        if (!mEl) {
            mEl = document.createElement('div');
            mEl.className = 'render-object enemy-monster';
            mEl.id = `mob-${mob.id}`;
            mEl.innerText = `[${mob.name}]`;
            container.appendChild(mEl);
        }
        mEl.style.left = mob.x + 'px';
        mEl.style.top = mob.y + 'px';
    });
}

function renderPlayer() {
    playerEl.style.left = pPos.x + 'px';
    playerEl.style.top = pPos.y + 'px';
}

// Geliştirilmiş Alt Arayüz Paneli
function drawInterface() {
    let ui = document.getElementById('stats-ui');
    if (!ui) return;
    
    // Mevcut hasarı hesapla (Temel 30 + her artı seviyesi için 10 hasar)
    let currentDamage = 30 + (pStats.weaponUpgrade * 10);
    // Bir sonraki artı basma maliyeti hesaplama
    let cost = (pStats.weaponUpgrade + 1) * 800;
    
    let smithPrompt = "";
    // Oyuncu demirciye yakınsa arayüzde bildirim göster
    let dX = Math.abs(pPos.x - smithPos.x);
    let dY = Math.abs(pPos.y - smithPos.y);
    if (dX < 50 && dY < 50) {
        if (pStats.weaponUpgrade >= 9) {
            smithPrompt = `<div style="color:#00ff00; font-size:11px; margin-top:4px; text-align:center;"><b>[Silah Maksimum Seviyede!]</b></div>`;
        } else {
            smithPrompt = `<div style="color:#ffdd00; font-size:11px; margin-top:4px; text-align:center; background:rgba(255,255,255,0.1); padding:2px; border-radius:4px;"><b>Demirciye Yakınsın!</b><br>Kılıcı Yükseltmek İçin <b>"E"</b> bas.<br>Maliyet: <b>${cost} Yang</b></div>`;
        }
    }

    let expPct = (pStats.exp / pStats.maxExp) * 100;
    ui.innerHTML = `
        <div style="font-size:14px; font-weight:bold; color:#ffdd00; margin-bottom:2px; text-align:center;">Metin2 Web [Lv. ${pStats.level}]</div>
        <div style="font-size:12px; color:#aaa; font-weight:bold; text-align:center; margin-bottom:4px;">Geniş Kılıç +${pStats.weaponUpgrade} (Hasar: ${currentDamage})</div>
        <div style="font-size:12px; font-weight:bold; color:#ffcc00; margin-bottom:6px; text-align:center;">Yang: ${pStats.yang.toLocaleString('tr-TR')}</div>
        <div class="ui-bar"><div class="hp-fill" style="width: ${(pStats.hp / pStats.maxHp) * 100}%;">HP: ${pStats.hp}/${pStats.maxHp}</div></div>
        <div class="ui-bar"><div class="exp-fill" style="width: ${expPct}%;">EXP: %${expPct.toFixed(0)}</div></div>
        <div style="font-size:11px; color:#ccc; text-align:center; margin-top:4px; line-height:13px;">
            <b>WASD:</b> Yürü | <b>Space:</b> Slot Kes
        </div>
        ${smithPrompt}
    `;
}

// Klavye Dinleyicileri
const activeKeys = { w: false, a: false, s: false, d: false };
window.addEventListener('keydown', (e) => { if (activeKeys[e.key.toLowerCase()] !== undefined) activeKeys[e.key.toLowerCase()] = true; });
window.addEventListener('keyup', (e) => { if (activeKeys[e.key.toLowerCase()] !== undefined) activeKeys[e.key.toLowerCase()] = false; });

// "Space" (Saldırı) ve "E" (Demirci Artı Basma) Dinleyicisi
window.addEventListener('keydown', (e) => {
    // --- DEMİRCİ ETKİLEŞİMİ (E TUŞU) ---
    if (e.key === 'e' || e.key === 'E') {
        let dX = Math.abs(pPos.x - smithPos.x);
        let dY = Math.abs(pPos.y - smithPos.y);
        
        // Demirciye yakınlık kontrolü
        if (dX < 50 && dY < 50) {
            if (pStats.weaponUpgrade >= 9) {
                spawnSmithText(smithPos.x, smithPos.y, "Maks+9!", false);
                return;
            }
            
            let cost = (pStats.weaponUpgrade + 1) * 800;
            
            // Para kontrolü
            if (pStats.yang >= cost) {
                pStats.yang -= cost;
                pStats.weaponUpgrade++; // Web sürümünde şimdilik %100 başarıyla geçer!
                spawnSmithText(smithPos.x, smithPos.y, "Başarılı! Kılıç + " + pStats.weaponUpgrade, true);
            } else {
                spawnSmithText(smithPos.x, smithPos.y, "Yetersiz Yang!", false);
            }
            drawInterface();
        }
    }

    // --- SALDIRI MEKANİĞİ (SPACE TUŞU) ---
    if (e.key === ' ' || e.code === 'Space') {
        // Dinamik hasarı hesapla
        let playerDamage = 30 + (pStats.weaponUpgrade * 10);

        mobList.forEach(mob => {
            if (mob.isDead) return;

            let dX = Math.abs(pPos.x - mob.x);
            let dY = Math.abs(pPos.y - mob.y);

            if (dX < 60 && dY < 60) {
                mob.hp -= playerDamage;
                mob.isAggressive = true; 
                
                spawnDamageText(mob.x, mob.y, playerDamage);
                
                const mEl = document.getElementById(`mob-${mob.id}`);
                if (mEl) {
                    mEl.style.backgroundColor = '#ffffff';
                    setTimeout(() => { 
                        let currentEl = document.getElementById(`mob-${mob.id}`);
                        if (currentEl) currentEl.style.backgroundColor = '#8b0000'; 
                    }, 80);
                }

                if (mob.hp <= 0) {
                    mob.isDead = true;
                    pStats.exp += 35;
                    
                    dropYang(mob.x, mob.y);
                    
                    if (pStats.exp >= pStats.maxExp) {
                        pStats.level++; pStats.exp = 0; pStats.maxHp += 100; pStats.hp = pStats.maxHp;
                    }

                    setTimeout(() => {
                        mob.x = Math.floor(Math.random() * (570 - 30 + 1)) + 30;
                        mob.y = Math.floor(Math.random() * (420 - 30 + 1)) + 30;
                        
                        if (mob.name.includes("Aç Kurt") || mob.name === "Kurt") {
                            mob.hp = 150;
                        } else if (mob.name.includes("Aç Yabani Köpek")) {
                            mob.hp = 120;
                        } else {
                            mob.hp = 90;
                        }
                        
                        mob.isDead = false;
                        mob.isAggressive = false; 
                        renderMonsters();
                    }, 5000);
                }
            }
        });
        drawInterface();
        renderMonsters();
    }
});

// Oyun Motoru Ana Döngüsü
function runEngine() {
    const moveStep = 4;
    let originalX = pPos.x;
    let originalY = pPos.y;

    if (activeKeys.w && pPos.y > 15) pPos.y -= moveStep;
    if (activeKeys.s && pPos.y < 435) pPos.y += moveStep;
    if (activeKeys.a && pPos.x > 15) pPos.x -= moveStep;
    if (activeKeys.d && pPos.x < 585) pPos.x += moveStep;

    // Demirci NPC'sinin içinden geçmeyi engelleme (Katı cisim fiziği)
    let distToSmithX = Math.abs(pPos.x - smithPos.x);
    let distToSmithY = Math.abs(pPos.y - smithPos.y);
    if (distToSmithX < 35 && distToSmithY < 25) {
        pPos.x = originalX;
        pPos.y = originalY;
    }

    // Gerçek zamanlı arayüz uyarısı için mesafe takibi
    if (activeKeys.w || activeKeys.a || activeKeys.s || activeKeys.d) {
        drawInterface();
    }

    // Yerdeki Yang'ları Toplama Kontrolü
    droppedYangList.forEach((yang, index) => {
        let yEl = document.getElementById(`yang-${yang.id}`);
        
        if (!yEl) {
            yEl = document.createElement('div');
            yEl.className = 'yang-drop';
            yEl.id = `yang-${yang.id}`;
            yEl.innerText = `${yang.amount} Yang`;
            yEl.style.left = yang.x + 'px';
            yEl.style.top = yang.y + 'px';
            container.appendChild(yEl);
