import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import "./CubicLevel.css";

const labels = ["Who", "What", "Where", "When", "Why", "How"];

const CubicLevel = () => {
  const containerRef = useRef(null);
  const [selectedFaceIndex, setSelectedFaceIndex] = useState(null);
  const [faceTexts, setFaceTexts] = useState({});
  const [inputText, setInputText] = useState("");

  useEffect(() => {
    // Initialize Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const container = containerRef.current;

    const camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0xffffff); // White background
    container.appendChild(renderer.domElement);

    // Ambient Light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    // Create Cube
    const geometry = new THREE.BoxGeometry(3, 3, 3);
    const textureLoader = new THREE.TextureLoader();

    const materials = [
      new THREE.MeshBasicMaterial({
        map: textureLoader.load("/images/whenB.jpg"), // When face !
      }),
      new THREE.MeshBasicMaterial({
        map: textureLoader.load("/images/whereB.jpg"), // Where face !
      }),
      new THREE.MeshBasicMaterial({
        map: textureLoader.load("/images/whyB.jpg"), // Why face !
      }),
      new THREE.MeshBasicMaterial({
        map: textureLoader.load("/images/howB.jpg"), // How face !
      }),
      new THREE.MeshBasicMaterial({
        map: textureLoader.load("/images/whoB.jpg"), // Who face !
      }),
      new THREE.MeshBasicMaterial({
        map: textureLoader.load("/images/whatB.jpg"), // What face !
      }),
    ];    

    const cube = new THREE.Mesh(geometry, materials);
    scene.add(cube);

    // Camera and Controls
    camera.position.set(4, 4, 4);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Raycaster for Face Selection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleMouseClick = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObject(cube);
    
      if (intersects.length > 0) {
        // Correct face mapping for labels
        const faceMap = [3, 2, 4, 5, 0, 1];
        // Who: 0 -p5
        // What: 1 -p6
        // When: 3 -p1
        // Where: 2 - p2
        // Why: 4 -p3
        // How: 5 -p4

        const triangleIndex = Math.floor(intersects[0].faceIndex / 2);
        const faceIndex = faceMap[triangleIndex];
    
        console.log("Triangle Index:", triangleIndex);
        console.log("Mapped Face Index:", faceIndex);

        // Original and clicked images for the faces
        const originalImages = [
          textureLoader.load("/images/whenB.jpg"),   // When face original
          textureLoader.load("/images/whereB.jpg"),  // Where face original
          textureLoader.load("/images/whyB.jpg"),    // Why face original
          textureLoader.load("/images/howB.jpg"),    // How face original
          textureLoader.load("/images/whoB.jpg"),    // Who face original
          textureLoader.load("/images/whatB.jpg"),   // What face original
        ];

        const clickedImages = [
          textureLoader.load("/images/whenR.jpg"),   // When face clicked
          textureLoader.load("/images/whereR.jpg"),  // Where face clicked
          textureLoader.load("/images/whyR.jpg"),    // Why face clicked
          textureLoader.load("/images/howR.jpg"),    // How face clicked
          textureLoader.load("/images/whoR.jpg"),    // Who face clicked
          textureLoader.load("/images/whatR.jpg"),   // What face clicked
        ];

        // Reset all faces to their original textures
        for (let i = 0; i < cube.material.length; i++) {
          cube.material[i].map = originalImages[i];
          cube.material[i].needsUpdate = true;
        }

        // Change only the clicked face to the highlighted texture
        cube.material[faceIndex].map = clickedImages[faceIndex];
        cube.material[faceIndex].needsUpdate = true;

        // Update the state
        setSelectedFaceIndex(faceIndex);
        setInputText(faceTexts[faceIndex] || "");
      }
    };
    
    renderer.domElement.addEventListener("click", handleMouseClick);

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      renderer.domElement.removeEventListener("click", handleMouseClick);
      window.removeEventListener("resize", handleResize);
      container.removeChild(renderer.domElement);
    };
  }, [faceTexts]);

  const handleSave = () => {
    const faceLabels = ["Who", "What", "Where", "When", "Why", "How"];
  
    // Update the current face content
    const updatedFaceTexts = {
      ...faceTexts,
      [selectedFaceIndex]: inputText,
    };
  
    // Generate and print the cube's contents
    const output = faceLabels
      .map((label, index) => `${label}: [${updatedFaceTexts[index] || ""}]`)
      .join("\n");
  
    console.log(output); // Print to terminal
  
    // Update state after logging
    setFaceTexts(updatedFaceTexts);
    setSelectedFaceIndex(null);
  };

  const handleFileUpload = (event) => {
    const files = event.target.files; // Access uploaded files
    if (files.length > 0) {
      console.log("Uploaded Files:");
      for (let i = 0; i < files.length; i++) {
        console.log(`File ${i + 1}:`, files[i].name);
      }
      alert(`${files.length} file(s) uploaded successfully!`);
    }
  };

  const formatText = (command) => {
    const textarea = document.getElementById("text-area");
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
  
    const textBeforeCursor = inputText.substring(0, start);
    const textAfterCursor = inputText.substring(end);
    const currentLine = textBeforeCursor.split("\n").pop();
  
    const lines = inputText.split("\n"); // Split input text into lines
    const lineIndex = lines.length - 1; // Get the current line index
    let newText = inputText;
  
    switch (command) {
      case "bullet":
        // Check if the current line starts with a bullet
        if (currentLine.startsWith("•")) {
          // Remove bullet if it exists
          lines[lineIndex] = currentLine.substring(2);
        } else {
          // Add bullet point
          lines[lineIndex] = `• ${currentLine.trim()}`;
        }
        newText = lines.join("\n");
        break;
      // Add other formatting options here if needed
      default:
        break;
    }
  
    setInputText(newText);
  };
 
  const handleKeyDown = (event) => {
    const textarea = event.target;
  
    if (event.key === "Enter") {
      event.preventDefault();
  
      const start = textarea.selectionStart;
      const textBeforeCursor = inputText.substring(0, start);
      const textAfterCursor = inputText.substring(start);
      const currentLine = textBeforeCursor.split("\n").pop();
  
      let newText;
      if (currentLine.trim().startsWith("•")) {
        // Add a new bullet line
        newText = `${textBeforeCursor}\n• ${textAfterCursor}`;
      } else {
        // Plain new line
        newText = `${textBeforeCursor}\n${textAfterCursor}`;
      }
  
      setInputText(newText);
  
      // Adjust cursor position
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 3; // After '• '
      }, 0);
    }
  };
  

  return (
    <div className="cubic-level">
      <h1 className="cubic-level-title">Cubic Level</h1>
      <div ref={containerRef} className="cubic-level-container"></div>
  
      {selectedFaceIndex !== null && (
        <div className="text-input-overlay">
        {/* Display the face label */}
        <h2 className="face-label">{labels[selectedFaceIndex]}</h2>
      
        {/* Text Input Area */}
        <textarea
          id="text-area"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type here..."
        ></textarea>
      
        {/* Bullet Button */}
        <button
          className="bullet-button"
          onClick={() => formatText("bullet")}
        >
          <img
            src="/images/bulletpoint.jpg"
            alt="Bullet Point"
            className="bullet-image"
          />
        </button>

        {/* Upload Files and Save Buttons */}
        <label className="upload-button">
          <input
            type="file"
            onChange={handleFileUpload}
            style={{ display: "none" }}
            multiple
          />
          UPLOAD FILES
        </label>
        <button onClick={handleSave} className="save-button">
          SAVE
        </button>
      </div>
      )}
    </div>
  );  
};

export default CubicLevel;