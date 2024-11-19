import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import "./CubicLevel.css";

const CubicLevel = () => {
  const containerRef = useRef(null);
  const [selectedFaceIndex, setSelectedFaceIndex] = useState(null);
  const [faceTexts, setFaceTexts] = useState({});
  const [inputText, setInputText] = useState("");

  useEffect(() => {
    // Labels for cube faces
    const labels = ["WHY", "HOW", "WHAT", "WHO", "WHEN", "WHERE"];

    // Create the scene, camera, and renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0xffffff); // White background
    containerRef.current.appendChild(renderer.domElement);

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    // Create cube
    const geometry = new THREE.BoxGeometry(3, 3, 3);
    const materials = [
      new THREE.MeshBasicMaterial({ color: 0xff0000 }), // Red
      new THREE.MeshBasicMaterial({ color: 0xffa500 }), // Orange
      new THREE.MeshBasicMaterial({ color: 0xffff00 }), // Yellow
      new THREE.MeshBasicMaterial({ color: 0x90ee90 }), // Green
      new THREE.MeshBasicMaterial({ color: 0x0000ff }), // Blue
      new THREE.MeshBasicMaterial({ color: 0xcc6ce7 }), // Purple
    ];
    const cube = new THREE.Mesh(geometry, materials);
    scene.add(cube);

    // Add labels to cube faces
    const labelPositions = [
      new THREE.Vector3(0, 0, 1.55), // Front face
      new THREE.Vector3(0, 0, -1.55), // Back face
      new THREE.Vector3(-1.55, 0, 0), // Left face
      new THREE.Vector3(1.55, 0, 0), // Right face
      new THREE.Vector3(0, 1.55, 0), // Top face
      new THREE.Vector3(0, -1.55, 0), // Bottom face
    ];

    labels.forEach((label, index) => {
      const canvas = document.createElement("canvas");
      canvas.width = 256;
      canvas.height = 128;
      const context = canvas.getContext("2d");
      context.fillStyle = "#000000";
      context.font = "48px Arial";
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText(label, canvas.width / 2, canvas.height / 2);

      const texture = new THREE.CanvasTexture(canvas);
      const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.scale.set(1.5, 1, 1);
      sprite.position.copy(labelPositions[index]);
      scene.add(sprite);
    });

    // Camera setup
    camera.position.set(6, 6, 6);
    camera.lookAt(scene.position);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Raycaster for detecting clicks
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleMouseClick = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObject(cube);

      if (intersects.length > 0) {
        const faceIndex = Math.floor(intersects[0].faceIndex / 2);
        setSelectedFaceIndex(faceIndex);

        // Populate input text if already saved
        setInputText(faceTexts[faceIndex] || "");
      }
    };

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };

    renderer.domElement.addEventListener("click", handleMouseClick);
    animate();

    // Handle window resizing
    window.addEventListener("resize", () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    return () => {
      renderer.domElement.removeEventListener("click", handleMouseClick);
      containerRef.current.removeChild(renderer.domElement);
    };
  }, [faceTexts]);

  const handleSave = () => {
    setFaceTexts((prev) => ({
      ...prev,
      [selectedFaceIndex]: inputText,
    }));
    setSelectedFaceIndex(null);
  };

  return (
    <div>
      <h1 className="cubic-level-title">Cubic Level</h1>
      <div ref={containerRef} className="cubic-level-container"></div>
      {selectedFaceIndex !== null && (
        <div className="text-input-overlay">
            <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type here..."
            ></textarea>
            <button onClick={handleSave}>SAVE</button>
        </div>
        )}
    </div>
  );
};

export default CubicLevel;
