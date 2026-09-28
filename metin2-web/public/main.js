// --- OYUNCU AYARLARI VE BAŞLANGIÇ KONUMU ---
let pStats = { level: 3, hp: 940, maxHp: 1000, exp: 40, maxExp: 100 };
let pPos = { x: 270, y: 200 }; // Haritanın tam merkezi

// --- 5 ADET HAREKETLİ CANAVAR LİSTESİ ---
let mobList = [
    { id: 1, name: "Yabani Köpek", x: 60, y: 60, hp: 90, isDead: false },
    { id: 2, name: "Yabani Köpek", x: 480, y: 70, hp: 90, isDead: false },
    { id: 3, name: "Aç Yabani Köpek", x: 120, y: 320, hp: 120, isDead: false },
    { id: 4, name: "Kurt", x: 450, y: 300, hp: 150, isDead: false },
    { id: 5, name: "Aç Kurt", x: 320, y: 80, hp: 150, isDead: false }
];

const container = document.getElementById('game-container');
const playerEl = document.getElementById('hero-player');

// Canavarları ekrana görsel olarak basan fonksiyon
function renderMonsters() {
    document.querySelectorAll('.enemy-monster').forEach(el => el.remove());

    mobList.forEach(mob => {
        if (mob.isDead) return;
        const mEl = document.createElement('div');
        mEl.className = 'render-object enemy-monster';
        mEl.id = `mob-${mob.id}`;
        mEl.innerText = `[${mob.name}]`;
        mEl.style.left = mob.x + 'px';
        mEl.style.top = mob.y + 'px';
        container.appendChild(mEl);
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
            if (dX < 50 && dY < 50) {
                mob.hp -= 30;
                
                // Vurulma efekti
                const mEl = document.getElementById(`mob-${mob.id}`);
                if (mEl) {
                    mEl.style.backgroundColor = '#ffffff';
                    setTimeout(() => { if (mEl) mEl.style.backgroundColor = '#8b0000'; }, 80);
                }

                if (mob.hp <= 0) {
                    mob.isDead = true;
                    pStats.exp += 35;
                    if (pStats.exp >= pStats.maxExp) {
                        pStats.level++; pStats.exp = 0; pStats.maxHp += 100; pStats.hp = pStats.maxHp;
                    }
                    renderMonsters();
                }
            }
        });
        drawInterface();
    }
});

// Kesintisiz Oyun Motoru Döngüsü
function runEngine() {
    const moveStep = 4;
    if (activeKeys.w && pPos.y > 5) pPos.y -= moveStep;
    if (activeKeys.s && pPos.y < 410) pPos.y += moveStep;
    if (activeKeys.a && pPos.x > 5) pPos.x -= moveStep;
    if (activeKeys.d && pPos.x < 510) pPos.x += moveStep;

    // Canavar Yapay Zekası: Slotlar oyuncuya doğru adım adım ilerler
    mobList.forEach(mob => {
        if (mob.isDead) return;

        let dX = pPos.x - mob.x;
        let dY = pPos.y - mob.y;

        if (Math.abs(dX) < 160 && Math.abs(dY) < 160) {
            if (mob.x < pPos.x) mob.x += 1.2; else mob.x -= 1.2;
            if (mob.y < pPos.y) mob.y += 1.2; else mob.y -= 1.2;
            
            // Oyuncuya çok yaklaştıklarında hasar vururlar
            if (Math.abs(dX) < 22 && Math.abs(dY) < 22) {
                if (Math.random() < 0.025) {
                    pStats.hp -= 8;
                    if (pStats.hp <= 0) {
                        pStats.hp = pStats.maxHp;
                        pPos = { x: 270, y: 200 }; // Ölen oyuncu merkezde doğar
                    }
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
