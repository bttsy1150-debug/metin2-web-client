// --- SADECE İNTERNETSİZ ÇALIŞAN SAF SİMÜLASYON MOTORU ---
console.log("Metin2 Web Test Server Başlatıldı.");

// Statü değişkenleri
let lv = 2;
let hp = 855;
let maxHp = 900;
let exp = 35;
let maxExp = 100;

// Ekrandaki siyahlığı kırıp doğrudan 2D/3D oyun barlarını basıyoruz
function buildPureUI() {
    let ui = document.getElementById('ui-overlay');
    if (!ui) return;
    
    // Tarayıcı kısıtlamalarını aşmak için pointer ve görünümü zorluyoruz
    ui.style.pointerEvents = "auto";
    ui.style.display = "block";
    
    let expPercent = (exp / maxExp) * 100;
    
    ui.innerHTML = `
        <div style="font-size:18px; font-weight:bold; color:#ffdd00; margin-bottom:10px; text-shadow: 1px 1px 2px #000;">
            Metin2 Web Test Server [Lv. ${lv}]
        </div>
        <div style="width: 250px; background: #222; border: 2px solid #555; padding:2px; margin-bottom:8px; border-radius:4px;">
            <div style="width: ${(hp / maxHp) * 100}%; background: #ff0000; height: 16px; text-align:center; font-size:11px; line-height:16px; font-weight:bold; color:#fff; transition: width 0.2s;">
                HP: ${hp}/${maxHp}
            </div>
        </div>
        <div style="width: 250px; background: #222; border: 2px solid #555; padding:2px; margin-bottom:15px; border-radius:4px;">
            <div style="width: ${expPercent}%; background: #00ffcc; height: 16px; text-align:center; font-size:11px; line-height:16px; font-weight:bold; color:#000; transition: width 0.2s;">
                EXP: %${expPercent.toFixed(0)}
            </div>
        </div>
        <div style="background: rgba(255,255,255,0.1); padding: 10px; border-radius: 4px; text-align:center;">
            <button id="attack-btn" style="padding: 10px 20px; font-size: 14px; font-weight: bold; background: #ffdd00; border: none; border-radius: 4px; cursor: pointer; color:#000;">
                Yabani Köpeğe Saldır!
            </button>
        </div>
        <div id="game-log" style="margin-top:10px; font-size:12px; color:#aaa; text-align:center; min-height:20px;">
            Yakınlarda 5 adet Yabani Köpek tespit edildi.
        </div>
    `;

    // Saldırı buton mantığı
    setTimeout(() => {
        const btn = document.getElementById('attack-btn');
        const log = document.getElementById('game-log');
        if (btn) {
            btn.onclick = function() {
                hp -= 30;
                exp += 20;
                if (hp <= 0) hp = maxHp; // Can bitince test için yenilensin
                if (exp >= maxExp) {
                    lv++;
                    exp = 0;
                    maxHp += 100;
                    hp = maxHp;
                    log.innerHTML = `<span style="color:#00ff00; font-weight:bold;">TEBRİKLER! LEVEL ATLANDI! [Lv. ${lv}]</span>`;
                } else {
                    log.innerHTML = `Köpeğe vurdun! Köpek de sana vurdu (-30 HP).`;
                }
                buildPureUI(); // Ekranı güncelle
            };
        }
    }, 100);
}

// Dünyayı başlat
buildPureUI();
