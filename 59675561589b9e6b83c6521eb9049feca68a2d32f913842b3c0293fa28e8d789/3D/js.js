window.addEventListener("DOMContentLoaded", init);
function init() {
    // レンダラーを作成
    const canvasElement = document.querySelector('#myCanvas');
    const renderer = new THREE.WebGLRenderer({
        antialias: true,
        canvas: canvasElement,
        alpha: true, // 背景を透明にする
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
    scene.background = new THREE.Color(0x36393e); // 背景色を設定

    // 環境光源を作成
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // 平行光源を作成
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
    directionalLight.castShadow = true; // シャドウを有効にする

    // シャドウバイアスを調整
    directionalLight.shadow.bias = -0.0001; // アーティファクトを軽減

    // ライトの位置とターゲットを設定
    directionalLight.position.set(1500, 1100, 0);
    directionalLight.target.position.set(0, 0, 0);
    scene.add(directionalLight);
    scene.add(directionalLight.target);

    // シャドウの設定
    directionalLight.shadow.mapSize.width = 4096; // シャドウマップの解像度を上げる
    directionalLight.shadow.mapSize.height = 4096;

    // カメラを作成
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 50000);

    // カメラコントローラーを作成
    const controls = new THREE.OrbitControls(camera, canvasElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.2;

    // 回転制御用の変数
    let mesh; // モデルを参照するための変数
    let isRotating = true; // モデルが回転するかどうかのフラグ
    let isLightRotating = false; // 光源が回転するかどうかのフラグ

    // ライトの回転角度を管理する変数
    let lightRotationAngle = 0; // 光源の回転角度

    // 3Dモデルの読み込み
    const loader = new THREE.STLLoader();
    loader.load(
        './StratocasterType.stl',
        function (geometry) {
            // 法線を計算
            geometry.computeVertexNormals();

            // 法線を反転
            const normalArray = geometry.attributes.normal.array;
            for (let i = 0; i < normalArray.length; i++) {
                normalArray[i] = -normalArray[i];
            }
            geometry.attributes.normal.needsUpdate = true;

            // マテリアルを作成
            const material = new THREE.MeshStandardMaterial({
                color: 0xf0c9a2, // 桐っぽい色に変更
                roughness: 0.6,
                metalness: 0.0,
                side: THREE.DoubleSide, // 両面描画
            });

            // メッシュを作成
            mesh = new THREE.Mesh(geometry, material);
            mesh.scale.set(10.0, 10.0, 10.0);
            mesh.position.set(0, 0, 0);
            mesh.castShadow = true; // シャドウを落とす
            mesh.receiveShadow = false; // 自身の影を受け取らない
            scene.add(mesh);

            // モデルのバウンディングボックスを計算
            const box = new THREE.Box3().setFromObject(mesh);
            const size = box.getSize(new THREE.Vector3());
            const center = box.getCenter(new THREE.Vector3());

            // カメラの位置を設定
            const distance = size.length() * 1.5;
            camera.position.copy(center);
            camera.position.z += distance;
            camera.near = size.length() / 100;
            camera.far = size.length() * 100;
            camera.updateProjectionMatrix();

            // カメラコントロールのターゲットを設定
            controls.target.copy(center);
            controls.update();

            // シャドウカメラの視野範囲を調整
            const shadowCamera = directionalLight.shadow.camera;
            shadowCamera.left = -size.x * 1.5;
            shadowCamera.right = size.x * 1.5;
            shadowCamera.top = size.y * 1.5;
            shadowCamera.bottom = -size.y * 1.5;
            shadowCamera.near = 0.5;
            shadowCamera.far = size.z * 10;
            shadowCamera.updateProjectionMatrix();
        },
        undefined,
        function (error) {
            console.error(error);
        }
    );

    // クリックで回転をトグル
    function onUserInteraction() {
        isRotating = !isRotating;
        isLightRotating = !isLightRotating;
    }
    canvasElement.addEventListener('mousedown', onUserInteraction);
    canvasElement.addEventListener('touchstart', onUserInteraction); // モバイル端末対応

    // リアルタイムレンダリング
    tick();
    function tick() {
        requestAnimationFrame(tick);

        // モデルが読み込まれている場合のみ処理
        if (mesh) {
            if (isRotating) {
                // モデルをy軸方向に回転させる
                mesh.rotation.y -= 0.005;
            }
        }

        if (isLightRotating) {
            // 光源を回転させる
            lightRotationAngle += 0.005;

            // ライトの回転半径
            const lightRadius = 1500;
            // ライトの高さ
            const lightHeight = 1100;

            // 光源の位置を更新
            directionalLight.position.x = lightRadius * Math.cos(lightRotationAngle);
            directionalLight.position.z = lightRadius * Math.sin(lightRotationAngle);
            directionalLight.position.y = lightHeight;
        }

        controls.update();
        renderer.render(scene, camera);
    }
}
