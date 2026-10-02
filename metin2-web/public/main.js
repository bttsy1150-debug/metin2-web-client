// --- OYUNCU AYARLARI VE BAŞLANGIÇ KONUMU ---
let pStats = { level: 3, hp: 940, maxHp: 1000, exp: 40, maxExp: 100 };
let pPos = { x: 270, y: 200 }; // Haritanın tam merkezi

// --- 5 ADET HAREKETLİ CANAVAR LİSTESİ ---
// Her canavara ilk başta saldırmaması için 'isAggressive: false' eklendi.
let mobList = [
    { id: 1, name: "Yabani Köpek", x: 60, y: 60, hp: 90, isDead: false, isAggressive: false },
    { id: 2, name: "Yabani Köpek", x: 480, y: 70, hp: 90, isDead: false, isAggressive: false },
    { id: 3, name: "Aç Yabani Köpek", x: 120, y: 320, hp: 120, isDead: false, isAggressive: false },
    { id: 4, name: "Kurt", x: 450, y: 300, hp: 150, isDead: false, isAggressive: false },
    { id: 5, name: "Aç Kurt", x: 320, y: 80, hp: 150, isDead: false, isAggressive: false }
];

const container = document.getElementById('game-container');
const playerEl = document.getElementById('hero-player');

// Canavarları ekrana görsel olarak basan ve konumlarını güncelleyen fonksiyon
function renderMonsters() {
    mobList.forEach(mob => {
        let mEl = document.getElementById(`mob-${mob.id}`);

        if (mob.isDead) {
            if (mEl) mEl.remove();
            return;
        }

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

// Oyuncunun konumunu güncelleyen fonksiyon
function renderPlayer() {
    playerEl.style.left = pPos.x + 'px';
    playerEl.style.top = pPos.y + 'px';
}

// Alt taraftaki HP ve EXP barlarını güncelleyen arayüz motoru
function drawInterface() {
    let ui = document.getElementById('stats-ui');
    if (!ui) return;
    
    let expPct = (pStats.exp / pStats.maxExp) * 100;
    ui.innerHTML = `
        <div style="font-size:14px; font-weight:bold; color:#ffdd00; margin-bottom:6px; text-align:center;">Metin2 Web [Lv. ${pStats.level}]</div>
        <div class="ui-bar"><div class="hp-fill" style="width: ${(pStats.hp / pStats.maxHp) * 100}%;">HP: ${pStats.hp}/${pStats.maxHp}</div></div>
        <div class="ui-bar"><div class="exp-fill" style="width: ${expPct}%;">EXP: %${expPct.toFixed(0)}</div></div>
        <div style="font-size:11px; color:#ccc; text-align:center; margin-top:4px; line-height:14px;">
            <b>WASD:</b> Haritada Özgürce Yürü<br>
            <b>Boşluk (Space):</b> Yakındaki Slotu Kes!
        </div>
    `;
}

// Klavye Dinleyicileri
const activeKeys = { w: false, a: false, s: false, d: false };
window.addEventListener('keydown', (e) => { if (activeKeys[e.key.toLowerCase()] !== undefined) activeKeys[e.key.toLowerCase()] = true; });
window.addEventListener('keyup', (e) => { if (activeKeys[e.key.toLowerCase()] !== undefined) activeKeys[e.key.toLowerCase()] = false; });

// Boşluk tuşuna basıldığında en yakındaki slotu kesme mekaniği
window.addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.code === 'Space') {
        mobList.forEach(mob => {
            if (mob.isDead) return;

            let dX = Math.abs(pPos.x - mob.x);
            let dY = Math.abs(pPos.y - mob.y);

            // Saldırı mesafesi kontrolü
            if (dX < 60 && dY < 60) {
                mob.hp -= 30;
                mob.isAggressive = true; // Oyuncu canavara vurduğu için canavar artık AGRESİF oldu!
                
                // Vurulma efekti
                const mEl = document.getElementById(`mob-${mob.id}`);
                if (mEl) {
                    mEl.style.backgroundColor = '#ffffff';
                    setTimeout(() => { 
                        let currentEl = document.getElementById(`mob-${mob.id}`);
                        if (currentEl) currentEl.style.backgroundColor = '#8b0000'; 
                    }, 80);
                }

                // Ölüm Kontrolü ve Yeniden Doğma (Respawn) Sistemi
                if (mob.hp <= 0) {
                    mob.isDead = true;
                    pStats.exp += 35;
                    
                    if (pStats.exp >= pStats.maxExp) {
                        pStats.level++; 
                        pStats.exp = 0; 
                        pStats.maxHp += 100; 
                        pStats.hp = pStats.maxHp;
                    }

                    // 5 Saniye sonra canavarı rastgele konumda ve pasif (sakin) olarak dirilt
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
                        mob.isAggressive = false; // Yeniden doğan canavar ilk başta yine sakin doğar
                        renderMonsters();
                    }, 5000);
                }
            }
        });
        drawInterface();
        renderMonsters();
    }
});

// Kesintisiz Oyun Motoru Döngüsü
function runEngine() {
    const moveStep = 4;
    if (activeKeys.w && pPos.y > 15) pPos.y -= moveStep;
    if (activeKeys.s && pPos.y < 435) pPos.y += moveStep;
    if (activeKeys.a && pPos.x > 15) pPos.x -= moveStep;
    if (activeKeys.d && pPos.x < 585) pPos.x += moveStep;

    // Canavar Yapay Zekası
    mobList.forEach(mob => {
        if (mob.isDead) return;

        // EĞER OYUNCU VURMADIYSA canavar tamamen hareketsiz kalır ve saldırmaz
        if (!mob.isAggressive) return;

        let dX = pPos.x - mob.x;
        let dY = pPos.y - mob.y;

        // Canavar agresifse oyuncuyu kovalamaya başlar
        if (Math.abs(dX) < 200 && Math.abs(dY) < 200) {
            if (mob.x < pPos.x) mob.x += 1.2; else mob.x -= 1.2;
            if (mob.y < pPos.y) mob.y += 1.2; else mob.y -= 1.2;
            
            // Oyuncuya hasar vurma mekaniği
            if (Math.abs(dX) < 25 && Math.abs(dY) < 25) {
                if (Math.random() < 0.025) {
                    pStats.hp -= 8;
                    if (pStats.hp <= 0) {
                        pStats.hp = pStats.maxHp;
                        pPos = { x: 270, y: 200 }; // Ölen oyuncu merkezde doğar
                        
                        // Oyuncu öldüğü için tüm canavarların agresifliği sıfırlanır (sakinleşirler)
                        mobList.forEach(m => m.isAggressive = false);
                    }
                    drawInterface();
                }
            }
        }
    });

    renderPlayer();
    renderMonsters();
    requestAnimationFrame(runEngine);
}

// İlk tetiklemeyi başlat
drawInterface();
renderMonsters();
runEngine();
