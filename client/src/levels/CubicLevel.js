import React, { useEffect, useRef } from 'react';
import * as THREE from 'three'; // utilizing three.js library
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'; // for mouse control of the 
import './CubicLevel.css';

const CubicLevel = () => {
    const containerRef = useRef(null);

    useEffect(() => {
        // set up the scene / camera / renderer
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0xffffff, 1);
        containerRef.current.appendChild(renderer.domElement);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        scene.add(ambientLight);

        const pointLight = new THREE.PointLight(0xffffff, 0.5);
        pointLight.position.set(10, 10, 10);
        scene.add(pointLight);

        // create the cube geometry and material
        const geometry = new THREE.BoxGeometry(3, 3, 3); // set the cube at 3x size
        const materials = [
          new THREE.MeshBasicMaterial({ color: 0xff0000 }), // Who: Red
          new THREE.MeshBasicMaterial({ color: 0xffa500 }), // What: Orange
          new THREE.MeshBasicMaterial({ color: 0xffff00 }), // When: Yellow
          new THREE.MeshBasicMaterial({ color: 0x90ee90 }), // Where: Green
          new THREE.MeshBasicMaterial({ color: 0x0000ff }), // Why: Blue
          new THREE.MeshBasicMaterial({ color: 0xcc6ce7 }), // How: Purple
        ];
        const cube = new THREE.Mesh(geometry, materials);
        scene.add(cube);

        // set camera position
        camera.position.set(3, 3, 5);
        camera.lookAt(scene.position);

        //aAdd orbit controls for mouse interaction
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.enableZoom = true;
        controls.enablePan = false;

        // animation loop
        const animate = () => {
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        };

        animate();

        // adjustments for window resizing
        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            containerRef.current.removeChild(renderer.domElement);
        };
    }, []);

    return (
      <div>
          <h1 className="cubic-level-title">Cubic Level</h1>
          <div ref={containerRef} className="cubic-level-container"></div>
      </div>
  );
};

export default CubicLevel;
