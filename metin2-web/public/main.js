// --- OYUNCU AYARLARI VE BAŞLANGIÇ KONUMU ---
var pStats = { level: 3, hp: 940, maxHp: 1000, exp: 40, maxExp: 100, yang: 5000, weaponUpgrade: 0 };
var pPos = { x: 270, y: 200 }; 

// --- 5 ADET CANAVAR LİSTESİ ---
var mobList = [
    { id: 1, name: "Yabani Köpek", cssClass: "mob-yabani-kopek", x: 60, y: 60, hp: 90, isDead: false, isAggressive: false },
    { id: 2, name: "Yabani Köpek", cssClass: "mob-yabani-kopek", x: 480, y: 170, hp: 90, isDead: false, isAggressive: false }, 
    { id: 3, name: "Aç Yabani Köpek", cssClass: "mob-ac-yabani-kopek", x: 120, y: 320, hp: 120, isDead: false, isAggressive: false },
    { id: 4, name: "Kurt", cssClass: "mob-kurt", x: 450, y: 300, hp: 150, isDead: false, isAggressive: false },
    { id: 5, name: "Aç Kurt", cssClass: "mob-ac-kurt", x: 320, y: 120, hp: 150, isDead: false, isAggressive: false }
];

var smithPos = { x: 500, y: 80 };
var droppedYangList = [];
var yangIdCounter = 0;
var activeKeys = { w: false, a: false, s: false, d: false };

function spawnDamageText(x, y, amount) {
    var container = document.getElementById('game-container');
    if (!container) return;
    var damageEl = document.createElement('div');
    damageEl.className = 'damage-indicator';
    damageEl.innerText = '-' + amount;
    damageEl.style.left = x + 'px';
    damageEl.style.top = (y - 30) + 'px';
    container.appendChild(damageEl);
    setTimeout(function() { damageEl.remove(); }, 600);
}

function spawnSmithText(x, y, text, isSuccess) {
    var container = document.getElementById('game-container');
    if (!container) return;
    var textEl = document.createElement('div');
    textEl.className = 'blacksmith-text';
    textEl.innerText = text;
    textEl.style.color = isSuccess ? '#00ff00' : '#ff3333';
    textEl.style.left = x + 'px';
    textEl.style.top = (y - 35) + 'px';
    container.appendChild(textEl);
    setTimeout(function() { textEl.remove(); }, 800);
}

function dropYang(x, y) {
    yangIdCounter++;
    var randomAmount = Math.floor(Math.random() * 301) + 150;
    droppedYangList.push({
        id: yangIdCounter,
        x: x + (Math.random() * 20 - 10),
        y: y + (Math.random() * 20 - 10),
        amount: randomAmount
    });
}

function renderMonsters() {
    var container = document.getElementById('game-container');
    if (!container) return;
    
    mobList.forEach(function(mob) {
        var mEl = document.getElementById('mob-' + mob.id);
        if (mob.isDead) {
            if (mEl) mEl.remove();
            return;
        }
        if (!mEl) {
            mEl = document.createElement('div');
            mEl.className = 'render-object enemy-monster ' + mob.cssClass;
            mEl.id = 'mob-' + mob.id;
            
            var nTag = document.createElement('div');
            nTag.className = 'name-tag';
            nTag.innerText = '[' + mob.name + ']';
            mEl.appendChild(nTag);
            
            container.appendChild(mEl);
        }
        mEl.style.left = mob.x + 'px';
        mEl.style.top = mob.y + 'px';
    });
}

function renderPlayer() {
    var playerEl = document.getElementById('hero-player');
    if (playerEl) {
        playerEl.style.left = pPos.x + 'px';
        playerEl.style.top = pPos.y + 'px';
    }
}

function drawInterface() {
    var ui = document.getElementById('stats-ui');
    if (!ui) return;
    
    var currentDamage = 30 + (pStats.weaponUpgrade * 10);
    var cost = (pStats.weaponUpgrade + 1) * 800;
    
    var smithPrompt = "";
    var dX = Math.abs(pPos.x - smithPos.x);
    var dY = Math.abs(pPos.y - smithPos.y);
    if (dX < 50 && dY < 50) {
        if (pStats.weaponUpgrade >= 9) {
            smithPrompt = '<div style="color:#00ff00; font-size:11px; margin-top:4px; text-align:center;"><b>[Silah Maksimum Seviyede!]</b></div>';
        } else {
            smithPrompt = '<div style="color:#ffdd00; font-size:11px; margin-top:4px; text-align:center; background:rgba(255,255,255,0.1); padding:2px; border-radius:4px;"><b>Demirciye Yakınsın!</b><br>Kılıcı Yükseltmek İçin <b>"E"</b> bas.<br>Maliyet: <b>' + cost + ' Yang</b></div>';
        }
    }

    var expPct = (pStats.exp / pStats.maxExp) * 100;
    ui.innerHTML = `
        <div style="font-size:14px; font-weight:bold; color:#ffdd00; margin-bottom:2px; text-align:center;">Metin2 Web [Lv. ${pStats.level}]</div>
        <div style="font-size:12px; color:#aaa; font-weight:bold; text-align:center; margin-bottom:4px;">Geniş Kılıç +${pStats.weaponUpgrade} (Hasar: ${currentDamage})</div>
        <div style="font-size:12px; font-weight:bold; color:#ffcc00; margin-bottom:6px; text-align:center;">Yang: ${pStats.yang.toLocaleString('tr-TR')}</div>
        <div class="ui-bar"><div class="hp-fill" style="width: ${(pStats.hp / pStats.maxHp) * 100}%;">HP: ${pStats.hp}/${pStats.maxHp}</div></div>
        <div class="ui-bar"><div class="exp-fill" style="width: ${expPct}%;">EXP: %${expPct.toFixed(0)}</div></div>
        <div style="font-size:11px; color:#ccc; text-align:center; margin-top:4px; line-height:13px;"><b>WASD:</b> Yürü | <b>Space:</b> Slot Kes</div>
        ${smithPrompt}
    `;
}

window.addEventListener('keydown', function(e) {
    var key = e.key.toLowerCase();
    if (activeKeys[key] !== undefined) activeKeys[key] = true;
});

window.addEventListener('keyup', function(e) {
    var key = e.key.toLowerCase();
    if (activeKeys[key] !== undefined) activeKeys[key] = false;
});

window.addEventListener('keydown', function(e) {
    if (e.key === 'e' || e.key === 'E') {
        var dX = Math.abs(pPos.x - smithPos.x);
        var dY = Math.abs(pPos.y - smithPos.y);
        
        if (dX < 50 && dY < 50) {
            if (pStats.weaponUpgrade >= 9) { spawnSmithText(smithPos.x, smithPos.y, "Maks+9!", false); return; }
            var cost = (pStats.weaponUpgrade + 1) * 800;
            if (pStats.yang >= cost) {
                pStats.yang -= cost; pStats.weaponUpgrade++; spawnSmithText(smithPos.x, smithPos.y, "Başarılı! Kılıç + " + pStats.weaponUpgrade, true);
            } else {
                spawnSmithText(smithPos.x, smithPos.y, "Yetersiz Yang!", false);
            }
            drawInterface();
        }
    }

    if (e.key === ' ' || e.code === 'Space') {
        var playerDamage = 30 + (pStats.weaponUpgrade * 10);
        mobList.forEach(function(mob) {
            if (mob.isDead) return;
            var dX = Math.abs(pPos.x - mob.x);
            var dY = Math.abs(pPos.y - mob.y);

            if (dX < 60 && dY < 60) {
                mob.hp -= playerDamage; mob.isAggressive = true; spawnDamageText(mob.x, mob.y, playerDamage);
                
                if (mob.hp <= 0) {
                    mob.isDead = true; pStats.exp += 35; dropYang(mob.x, mob.y);
                    if (pStats.exp >= pStats.maxExp) { pStats.level++; pStats.exp = 0; pStats.maxHp += 100; pStats.hp = pStats.maxHp; }
                    setTimeout(function() {
                        mob.x = Math.floor(Math.random() * 541) + 30; mob.y = Math.floor(Math.random() * 391) + 30;
                        mob.hp = mob.name.includes("Kurt") ? 150 : (mob.name.includes("Aç Yabani") ? 120 : 90);
                        mob.isDead = false; mob.isAggressive = false; renderMonsters();
                    }, 5000);
                }
            }
        });
        drawInterface(); renderMonsters();
    }
});

function runEngine() {
    var moveStep = 4;
    var originalX = pPos.x; var originalY = pPos.y;
    if (activeKeys.w && pPos.y > 15) pPos.y -= moveStep;
    if (activeKeys.s && pPos.y < 435) pPos.y += moveStep;
    if (activeKeys.a && pPos.x > 15) pPos.x -= moveStep;
    if (activeKeys.d && pPos.x < 585) pPos.x += moveStep;

    var distToSmithX = Math.abs(pPos.x - smithPos.x);
    var distToSmithY = Math.abs(pPos.y - smithPos.y);
    if (distToSmithX < 35 && distToSmithY < 25) { pPos.x = originalX; pPos.y = originalY; }
    if (activeKeys.w || activeKeys.a || activeKeys.s || activeKeys.d) { drawInterface(); }

    var container = document.getElementById('game-container');
    if (container) {
        for (var i = droppedYangList.length - 1; i >= 0; i--) {
            var yang = droppedYangList[i];
            var yEl = document.getElementById('yang-' + yang.id);
            if (!yEl) {
                yEl = document.createElement('div'); yEl.className = 'yang-drop'; yEl.id = 'yang-' + yang.id;
                yEl.innerText = yang.amount + ' Yang'; yEl.style.left = yang.x + 'px'; yEl.style.top = yang.y + 'px';
                container.appendChild(yEl);
            }
            if (Math.abs(pPos.x - yang.x) < 25 && Math.abs(pPos.y - yang.y) < 25) {
                pStats.yang += yang.amount; yEl.remove(); droppedYangList.splice(i, 1); drawInterface();
            }
        }
    }

    mobList.forEach(function(mob) {
        if (mob.isDead || !mob.isAggressive) return;
        if (Math.abs(pPos.x - mob.x) < 200 && Math.abs(pPos.y - mob.y) < 200) {
            if (mob.x < pPos.x) mob.x += 1.2; else mob.x -= 1.2;
            if (mob.y < pPos.y) mob.y += 1.2; else mob.y -= 1.2;
            if (Math.abs(pPos.x - mob.x) < 25 && Math.abs(pPos.y - mob.y) < 25) {
                if (Math.random() < 0.025) {
                    pStats.hp -= 8;
                    if (pStats.hp <= 0) { pStats.hp = pStats.maxHp; pPos = { x: 270, y: 200 }; mobList.forEach(function(m) { m.isAggressive = false; }); }
                    drawInterface();
                }
            }
        }
    });

    renderPlayer(); renderMonsters();
    requestAnimationFrame(runEngine);
}

// Bütün yükleme risklerini sıfırlayan asıl başlatıcı döngü
window.onload = function() {
    drawInterface();
    renderMonsters();
    runEngine();
};
