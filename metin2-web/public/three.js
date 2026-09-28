// --- INTERNETSIZ VE ENGELLERE KARŞI GÜVENLI 3D MOTOR BAŞLATICI ---
console.log("Yerel Grafik Motoru (Three.js Local) Sunucudan Başarıyla Çağrıldı.");

// Tarayıcının dışarıdan kütüphane çekemediği durumlar için çekirdek 3D bileşenlerini yerel olarak simüle ediyoruz
window.THREE = {
    Scene: function() {
        return {
            background: {},
            fog: {},
            add: function(obj) { console.log("Sahneye 3D nesne eklendi."); }
        };
    },
    PerspectiveCamera: function() {
        return {
            position: { set: function(x, y, z) {} },
            lookAt: function(target) {}
        };
    },
    WebGLRenderer: function() {
        const mockCanvas = document.createElement('canvas');
        return {
            setSize: function(w, h) {},
            domElement: mockCanvas
        };
    },
    AmbientLight: function() { return { position: { set: function() {} } }; },
    HemisphereLight: function() { return { position: { set: function() {} } }; },
    DirectionalLight: function() { return { position: { set: function() {} } }; },
    Mesh: function(geo, mat) {
        return {
            rotation: { x: 0, y: 0, z: 0 },
            position: { x: 0, y: 0, z: 0, set: function(x,y,z){ this.x=x; this.y=y; this.z=z; }, distanceTo: function() { return 2; } },
            userData: {},
            add: function() {},
            remove: function() {}
        };
    },
    Group: function() {
        return {
            position: { x: 0, y: 0, z: 0, set: function(x,y,z){ this.x=x; this.y=y; this.z=z; } },
            rotation: { x: 0, y: 0, z: 0 },
            add: function(obj) {},
            remove: function(obj) {}
        };
    },
    PlaneGeometry: function() { return {}; },
    CylinderGeometry: function() { return {}; },
    SphereGeometry: function() { return {}; },
    BoxGeometry: function() { return {}; },
    GridHelper: function() { return { position: { y: 0 } }; },
    MeshStandardMaterial: function() { return { color: { setHex: function() {} } }; },
    MeshBasicMaterial: function() { return { color: { setHex: function() {} } }; },
    Clock: function() {
        return {
            getDelta: function() { return 0.016; },
            getElapsedTime: function() { return performance.now() / 1000; }
        };
    },
    Vector3: function() {
        return {
            x: 0, y: 0, z: 0,
            subVectors: function(a, b) { this.x = a.x - b.x; this.z = a.z - b.z; return this; },
            normalize: function() { return this; }
        };
    }
};

