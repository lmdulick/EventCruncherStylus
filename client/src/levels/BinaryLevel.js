// WRONG ATTEMPT AT CREATING CUBIC LEVEL W/ TEXT BOXES ON FACES
import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import "./BinaryLevel.css";

const BinaryLevel = () => {
  const containerRef = useRef(null);
  const [selectedFace, setSelectedFace] = useState(null);
  const [faceTexts, setFaceTexts] = useState({
    front: "WHERE",
    back: "WHAT",
    left: "WHEN",
    right: "WHERE",
    top: "WHY",
    bottom: "HOW",
  });

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    containerRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 0.5);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    // Cube geometry and materials
    const cubeGeometry = new THREE.BoxGeometry(3, 3, 3);
    const materials = [
      new THREE.MeshBasicMaterial({ color: 0xff0000 }), // Front: Red
      new THREE.MeshBasicMaterial({ color: 0xffa500 }), // Back: Orange
      new THREE.MeshBasicMaterial({ color: 0xffff00 }), // Left: Yellow
      new THREE.MeshBasicMaterial({ color: 0x90ee90 }), // Right: Green
      new THREE.MeshBasicMaterial({ color: 0x0000ff }), // Top: Blue
      new THREE.MeshBasicMaterial({ color: 0xcc6ce7 }), // Bottom: Purple
    ];
    const cube = new THREE.Mesh(cubeGeometry, materials);
    scene.add(cube);

    // Text planes for each face
    const createTextPlane = (text, position, rotation) => {
      const canvas = document.createElement("canvas");
      canvas.width = 256;
      canvas.height = 256;
      const context = canvas.getContext("2d");

      // Draw text
      context.fillStyle = "white";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = "black";
      context.font = "28px Arial";
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText(text, canvas.width / 2, canvas.height / 2);

      const texture = new THREE.CanvasTexture(canvas);
      const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
      const planeGeometry = new THREE.PlaneGeometry(2.8, 2.8);
      const plane = new THREE.Mesh(planeGeometry, material);

      plane.position.set(position.x, position.y, position.z);
      plane.rotation.set(rotation.x, rotation.y, rotation.z);
      return plane;
    };

    const textPlanes = [
      createTextPlane(faceTexts.front, new THREE.Vector3(0, 0, 1.5), new THREE.Euler(0, 0, 0)), // Front
      createTextPlane(faceTexts.back, new THREE.Vector3(0, 0, -1.5), new THREE.Euler(0, Math.PI, 0)), // Back
      createTextPlane(faceTexts.left, new THREE.Vector3(-1.5, 0, 0), new THREE.Euler(0, Math.PI / 2, 0)), // Left
      createTextPlane(faceTexts.right, new THREE.Vector3(1.5, 0, 0), new THREE.Euler(0, -Math.PI / 2, 0)), // Right
      createTextPlane(faceTexts.top, new THREE.Vector3(0, 1.5, 0), new THREE.Euler(-Math.PI / 2, 0, 0)), // Top
      createTextPlane(faceTexts.bottom, new THREE.Vector3(0, -1.5, 0), new THREE.Euler(Math.PI / 2, 0, 0)), // Bottom
    ];

    textPlanes.forEach((plane) => scene.add(plane));

    camera.position.set(5, 5, 7);
    camera.lookAt(scene.position);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onMouseClick = (event) => {
      // Convert mouse position to normalized device coordinates
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(textPlanes);

      if (intersects.length > 0) {
        const face = intersects[0].object;
        setSelectedFace(face);
      }
    };

    window.addEventListener("click", onMouseClick);

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("click", onMouseClick);
      containerRef.current.removeChild(renderer.domElement);
    };
  }, [faceTexts]);

  const handleTextChange = (event) => {
    if (!selectedFace) return;
    const updatedTexts = { ...faceTexts };
    updatedTexts[selectedFace.name] = event.target.value;
    setFaceTexts(updatedTexts);
  };

  return (
    <div>
      <h1 className="cubic-level-title">Cubic Level</h1>
      <div ref={containerRef} className="cubic-level-container"></div>
      {selectedFace && (
        <div className="text-input-overlay">
          <textarea
            value={faceTexts[selectedFace.name]}
            onChange={handleTextChange}
          ></textarea>
        </div>
      )}
    </div>
  );
};

export default BinaryLevel;