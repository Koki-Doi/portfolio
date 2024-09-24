window.addEventListener("DOMContentLoaded", init);
function init() {
    // レンダラーを作成
    const canvasElement = document.querySelector('#myCanvas');
    const renderer = new THREE.WebGLRenderer({
        antialias: true,
        canvas: canvasElement,
        alpha: true,            // 背景を透明にする（必要に応じて）
    });

    // シャドウを有効にする
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // サイズ指定
    const width = 745;
    const height = 540;
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);

    // シーンを作成
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x36393e); // 背景色を設定（またはnullで透明に）

    // 環境光源を作成
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // 平行光源を作成
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight.position.set(1000, 1100, 1000); // 斜め上から照らす
    directionalLight.target.position.set(0, 0, 0); // 原点を照らす
    directionalLight.castShadow = true;            // シャドウを有効にする

    // シャドウの設定
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 5000;
    directionalLight.shadow.camera.left = -500;
    directionalLight.shadow.camera.right = 500;
    directionalLight.shadow.camera.top = 500;
    directionalLight.shadow.camera.bottom = -500;
    scene.add(directionalLight);
    scene.add(directionalLight.target);

    // カメラを作成
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 50000);

    // カメラコントローラーを作成
    const controls = new THREE.OrbitControls(camera, canvasElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.2;

    // 3Dモデルの読み込み
    const loader = new THREE.STLLoader();
    loader.load(
        './telecontour.stl',
        function (geometry) {
            // 法線を計算
            geometry.computeVertexNormals();

            // マテリアルを作成
            const material = new THREE.MeshStandardMaterial({
                color: 0x8B4513, // 木材の色
                roughness: 0.6,
                metalness: 0.0,
            });

            // メッシュを作成
            const mesh = new THREE.Mesh(geometry, material);
            mesh.scale.set(10.0, 10.0, 10.0);
            mesh.position.set(0, 0, 0);
            mesh.castShadow = true;     // シャドウを落とす
            mesh.receiveShadow = true;  // 自己陰影を受け取る
            scene.add(mesh);

            // モデルのバウンディングボックスを計算
            const box = new THREE.Box3().setFromObject(mesh);
            const size = box.getSize(new THREE.Vector3()).length();
            const center = box.getCenter(new THREE.Vector3());

            // カメラの位置を設定
            const distance = size * 1.5;
            camera.position.copy(center);
            camera.position.z += distance;
            camera.near = size / 100;
            camera.far = size * 100;
            camera.updateProjectionMatrix();

            // カメラコントロールのターゲットを設定
            controls.target.copy(center);
            controls.update();
        },
        undefined,
        function (error) {
            console.error(error);
        }
    );

    // リアルタイムレンダリング
    tick();
    function tick() {
        controls.update();
        renderer.render(scene, camera);
        requestAnimationFrame(tick);
    }
}
