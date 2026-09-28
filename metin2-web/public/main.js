const scene = new THREE.Scene();
scene.background = new THREE.Color(0xa0a0a0);
scene.fog = new THREE.Fog(0xa0a0a0, 10, 50);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('canvas-container').appendChild(renderer.domElement);

const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444);
hemiLight.position.set(0, 20, 0);
scene.add(hemiLight);

const groundGeo = new THREE.PlaneGeometry(100, 100);
const groundMat = new THREE.MeshPhongMaterial({ color: 0x557a2b, depthWrite: false });
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

const playerGeo = new THREE.CapsuleGeometry(0.4, 1, 4, 8);
const playerMat = new THREE.MeshPhongMaterial({ color: 0x0000ff });
const player = new THREE.Mesh(playerGeo, playerMat);
player.position.y = 0.9;
scene.add(player);

const monsterGeo = new THREE.BoxGeometry(1, 1, 1);
const monsterMat = new THREE.MeshPhongMaterial({ color: 0x8b0000 });
const monster = new THREE.Mesh(monsterGeo, monsterMat);
monster.position.set(5, 0.5, -5);
scene.add(monster);

camera.position.set(0, 5, 10);

const keys = { w: false, a: false, s: false, d: false };
window.addEventListener('keydown', (e) => { if(keys[e.key.toLowerCase()] !== undefined) keys[e.key.toLowerCase()] = true; });
window.addEventListener('keyup', (e) => { if(keys[e.key.toLowerCase()] !== undefined) keys[e.key.toLowerCase()] = false; });

let monsterHealth = 100;
window.addEventListener('click', () => {
    const distance = player.position.distanceTo(monster.position);
    if (distance < 2.5 && monsterHealth > 0) {
        monsterHealth -= 25;
        monster.material.color.setHex(0xffffff);
        setTimeout(() => monster.material.color.setHex(0x8b0000), 100);
        if (monsterHealth <= 0) {
            scene.remove(monster);
            document.getElementById('ui-overlay').innerText = "Tebrikler! Hayvani kestiniz.";
        }
    }
});

function animate() {
    requestAnimationFrame(animate);

    const speed = 0.1;
    if (keys.w) player.position.z -= speed;
    if (keys.s) player.position.z += speed;
    if (keys.a) player.position.x -= speed;
    if (keys.d) player.position.x += speed;

    camera.position.set(player.position.x, player.position.y + 4, player.position.z + 8);
    camera.lookAt(player.position);

    renderer.render(scene, camera);
}
animate();
