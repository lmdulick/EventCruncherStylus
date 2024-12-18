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
  const [faceFiles, setFaceFiles] = useState({
    0: [], // Who
    1: [], // What
    2: [], // Where
    3: [], // When
    4: [], // Why
    5: [], // How
  });
  

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
    renderer.setClearColor(0xffffff);
    container.appendChild(renderer.domElement);

    // Ambient Light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    // Create Cube
    const geometry = new THREE.BoxGeometry(3, 3, 3);
    const textureLoader = new THREE.TextureLoader();

    const materials = [
      new THREE.MeshBasicMaterial({
        map: textureLoader.load("/images/whenB.jpg"), // WHEN face
      }),
      new THREE.MeshBasicMaterial({
        map: textureLoader.load("/images/whereB.jpg"), // WHERE face
      }),
      new THREE.MeshBasicMaterial({
        map: textureLoader.load("/images/whyB.jpg"), // WHY face
      }),
      new THREE.MeshBasicMaterial({
        map: textureLoader.load("/images/howB.jpg"), // HOW face
      }),
      new THREE.MeshBasicMaterial({
        map: textureLoader.load("/images/whoB.jpg"), // WHO face
      }),
      new THREE.MeshBasicMaterial({
        map: textureLoader.load("/images/whatB.jpg"), // WHAT face
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


    // Method for handling a mouse click on the cube
    const handleMouseClick = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObject(cube);
    
      if (intersects.length > 0) {
        const faceMap = [3, 2, 4, 5, 0, 1];
        // [0] : When (val: 3)
        // [1] : Where (val: 2)
        // [2] : Why (val: 4)
        // [3] : How (val: 5)
        // [4] : Who (val: 0)
        // [5] : What (val: 1)

        const triangleIndex = Math.floor(intersects[0].faceIndex / 2);
        const faceIndex = faceMap[triangleIndex];
    
        console.log("Triangle Index:", triangleIndex);
        console.log("Mapped Face Index:", faceIndex);
    
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


  // Method for handling saving data when user clicks "SAVE" button
  const handleSave = () => {
    const faceLabels = ["Who", "What", "Where", "When", "Why", "How"];
  
    // Update the current face content
    const updatedFaceTexts = {
      ...faceTexts,
      [selectedFaceIndex]: inputText,
    };
  
    setFaceTexts(updatedFaceTexts);
  
    console.log("-----------------------------");

    // Check if a new file was added to the face
    const currentFiles = faceFiles[selectedFaceIndex] || [];
    if (currentFiles.length > 0) {
      console.log(`Files successfully added to face "${faceLabels[selectedFaceIndex]}":`);
      console.log(currentFiles.map((file) => file.name));
    }

    faceLabels.forEach((label, index) => {
      const faceText = updatedFaceTexts[index] || "";
      const files = faceFiles[index]?.map((file) => file.name).join(", ") || "";
      console.log(`${label}: [${faceText}] ${files ? `Files: ${files}` : ""}`);
    });

    console.log("-----------------------------");
  
    setSelectedFaceIndex(null);
    setInputText("");
  };
  

  // Method for handling uploading a file when user clicks "INSERT FILE" button
  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    if (files.length > 0 && selectedFaceIndex !== null) {
      setFaceFiles((prev) => {
        const updatedFiles = [...prev[selectedFaceIndex], ...files]; // Append new files
        return {
          ...prev,
          [selectedFaceIndex]: updatedFiles, // Update the specific face
        };
      });
    }
  };
  
  
  // Method for handling when a user clicks "X" button and deletes an uploaded file
  const handleDeleteFile = (faceIndex, fileIndex) => {
    setFaceFiles((prev) => {
      const updatedFiles = prev[faceIndex].filter((_, i) => i !== fileIndex); // Remove the file at fileIndex
      return {
        ...prev,
        [faceIndex]: updatedFiles, // Update only the selected face's files
      };
    });
  };
  
  
  // Method for formatting the text box's text & bullet points
  const formatText = (command) => {
    const textarea = document.getElementById("text-area");
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
  
    const textBeforeCursor = inputText.substring(0, start);
    const textAfterCursor = inputText.substring(end);
    const currentLine = textBeforeCursor.split("\n").pop();
  
    const lines = inputText.split("\n");
    const lineIndex = lines.length - 1;
    let newText = inputText;
  
    switch (command) {
      case "bullet":
        if (currentLine.startsWith("•")) {
          lines[lineIndex] = currentLine.substring(2);
        } else {
          lines[lineIndex] = `• ${currentLine.trim()}`;
        }
        newText = lines.join("\n");
        break;
      default:
        break;
    }
  
    setInputText(newText);
  };
 

  // Method for auto adding bullet points
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
        // Add a plain new line
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
        <div className="text-area-container">
          <textarea
            id="text-area"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type here..."
          ></textarea>

          {/* File List Textarea */}
          <div className="file-list">
            {faceFiles[selectedFaceIndex]?.map((file, index) => (
              <div key={index} className="file-item">
                <button
                  className="delete-file-button"
                  onClick={() => handleDeleteFile(selectedFaceIndex, index)}
                >
                  X
                </button>
                <span>{file.name}</span>
              </div>
            ))}
          </div>
        </div>

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

        {/* Insert Files / Save Buttons */}
        <div className="button-container">
          <label className="upload-button">
            <input
              type="file"
              onChange={handleFileUpload}
              style={{ display: "none" }}
              multiple
            />
            INSERT FILES
          </label>
          <button onClick={handleSave} className="save-button">
            SAVE
          </button>
        </div>
      </div>      
      )}
    </div>
  );  
};

export default CubicLevel;

