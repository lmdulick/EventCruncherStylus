import React, { useEffect, useRef, useState } from "react";
import * as XLSX from "xlsx";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import "./CubicLevel.css";

const labels = ["Who", "What", "Where", "When", "Why", "How"];

const CubicLevel = () => {
  const containerRef = useRef(null);
  const [selectedFaceIndex, setSelectedFaceIndex] = useState(null);
  const [faceTexts, setFaceTexts] = useState({});
  const [inputText, setInputText] = useState("");
  const [faceFiles, setFaceFiles] = useState({}); 
  const [tempFaceFiles, setTempFaceFiles] = useState({});

  // modal = UI element appearing on top of the main page 
  // X modal = excel spreadsheet modal
  // I modal = instructions modal
  const [isXModalOpen, setIsXModalOpen] = useState(false);
  const [spreadsheetData, setSpreadsheetData] = useState([]);
  const [isIModalOpen, setIsIModalOpen] = useState(false);


  // Toggle between the Instructions Modal and the UI
  const toggleInstructionsModal = () => {
    setIsIModalOpen(!isIModalOpen);
  };
  

  useEffect(() => {
    if (isIModalOpen) {
      const textarea = document.querySelector('.instructions-textbox');

      if (textarea) {
        textarea.addEventListener('input', function () {
          this.style.height = 'auto'; // Reset the height
          this.style.height = `${this.scrollHeight}px`; // Adjust to fit content
        });

        // Cleanup event listener when the modal closes or component unmounts
        return () => {
          textarea.removeEventListener('input', function () {
            this.style.height = 'auto';
            this.style.height = `${this.scrollHeight}px`;
          });
        };
      }
    }
  }, [isIModalOpen]); // Runs only when `isIModalOpen` changes

  // For temporary file uploads
  useEffect(() => {
    if (selectedFaceIndex !== null) {
      setTempFaceFiles((prev) => ({
        ...prev,
        [selectedFaceIndex]: {
          saved: prev[selectedFaceIndex]?.saved || [],
          pending: [],
        },
      }));
    }
  }, [selectedFaceIndex]);
  

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

    // Render Cube Faces
    const materials = [
      new THREE.MeshBasicMaterial({
        map: textureLoader.load("/images/cube_faces/whenBB.jpg"), // WHEN face
      }),
      new THREE.MeshBasicMaterial({
        map: textureLoader.load("/images/cube_faces/whereBB.jpg"), // WHERE face
      }),
      new THREE.MeshBasicMaterial({
        map: textureLoader.load("/images/cube_faces/whyBB.jpg"), // WHY face
      }),
      new THREE.MeshBasicMaterial({
        map: textureLoader.load("/images/cube_faces/howBB.jpg"), // HOW face
      }),
      new THREE.MeshBasicMaterial({
        map: textureLoader.load("/images/cube_faces/whoBB.jpg"), // WHO face
      }),
      new THREE.MeshBasicMaterial({
        map: textureLoader.load("/images/cube_faces/whatBB.jpg"), // WHAT face
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
    
        // Discard unsaved changes for the current face
        if (selectedFaceIndex !== null && selectedFaceIndex !== faceIndex) {
          setTempFaceFiles((prev) => ({
            ...prev,
            [selectedFaceIndex]: {
              saved: prev[selectedFaceIndex]?.saved || [],
              pending: [], // Discard unsaved files
            },
          }));
        }
    
        // Set tempFaceFiles for the new face
        setTempFaceFiles((prev) => ({
          ...prev,
          [faceIndex]: {
            saved: faceFiles[faceIndex]?.saved || [],
            pending: [],
          },
        }));
    
        // Switch to the new face
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
    setFaceFiles((prev) => {
      const updatedFaceFiles = { ...prev };
  
      Object.keys(tempFaceFiles).forEach((faceIndex) => {
        const currentFiles = tempFaceFiles[faceIndex] || { saved: [], pending: [] };
  
        updatedFaceFiles[faceIndex] = {
          saved: [
            ...(currentFiles.saved || []),
            ...(currentFiles.pending || []),
          ],
          pending: [],
        };
      });
  
      return updatedFaceFiles;
    });
  
    // Save the text for the selected face
    if (selectedFaceIndex !== null) {
      setFaceTexts((prev) => ({
        ...prev,
        [selectedFaceIndex]: inputText || "",
      }));
    }
  
    // Reset temporary states
    setSelectedFaceIndex(null);
    setInputText("");
  };
  

  // Method for handling uploading a file when user clicks "INSERT FILE" button
  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
  
    if (files.length > 0 && selectedFaceIndex !== null) {
      setTempFaceFiles((prev) => {
        const currentFiles = prev[selectedFaceIndex] || { saved: [], pending: [] };
  
        return {
          ...prev,
          [selectedFaceIndex]: {
            saved: currentFiles.saved || [],
            pending: [...(currentFiles.pending || []), ...files],
          },
        };
      });
  
      // Add bullet points for the new files
      const newFileNames = files.map((file) => `• ${file.name}`).join("\n");
      setInputText((prevText) => `${prevText}${prevText ? "\n" : ""}${newFileNames}`);
    }
  };
  
  
  // Method for handling when a user clicks "X" button and deletes an uploaded file
  const handleDeleteFile = (faceIndex, fileIndex, type) => {
    setTempFaceFiles((prev) => {
      const currentFiles = prev[faceIndex] || { saved: [], pending: [] };
  
      // Remove the file from the specified type (saved or pending)
      const updatedFiles = {
        ...currentFiles,
        [type]: currentFiles[type].filter((_, i) => i !== fileIndex),
      };
  
      return {
        ...prev,
        [faceIndex]: updatedFiles,
      };
    });
  
    // Optionally update the text box to remove the file name bullet point
    setInputText((prevText) => {
      const fileNameToRemove =
        type === "saved"
          ? tempFaceFiles[faceIndex]?.saved[fileIndex]?.name
          : tempFaceFiles[faceIndex]?.pending[fileIndex]?.name;
  
      if (fileNameToRemove) {
        return prevText
          .split("\n")
          .filter((line) => line.trim() !== `• ${fileNameToRemove}`)
          .join("\n");
      }
  
      return prevText;
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
  
      // Adjust cursor position after '• '
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 3;
      }, 0);
    }
  };

  
  // Method for viewing the cube data in a spreadsheet (xslx) format
  const handleXLSXClick = () => {
    const faceLabels = ["WHO", "WHAT", "WHERE", "WHEN", "WHY", "HOW"];
  
    // Prepare the table data
    const tableData = [
      ["", ...faceLabels], // Header row
      ["TEXT", ...faceLabels.map((_, index) => faceTexts[index] || "")], // Text row
      ["FILES", ...faceLabels.map((_, index) => {
        const { saved = [] } = faceFiles[index] || {};
        return (saved || []).map((file) => file.name).join(",\n");
      })], // Files row
    ];
  
    setSpreadsheetData(tableData);
    setIsXModalOpen(true);
  };
  

  // Method for downloading the spreadsheet
  const handleDownloadClick = async () => {
    const faceLabels = ["WHO", "WHAT", "WHERE", "WHEN", "WHY", "HOW"];
    const zip = new JSZip();
  
    // Step 1: Generate Transposed Data for the Excel File
    const spreadsheetData = [["", ...faceLabels]];
    const textRow = ["TEXT", ...faceLabels.map((_, index) => faceTexts[index] || "")];
    const filesRow = [
      "FILES",
      ...faceLabels.map((_, index) => {
        const { saved = [] } = faceFiles[index] || {};
        return saved.map((file) => file.name).join(", \n");
      }),
    ];
  
    // Add rows to the spreadsheet
    spreadsheetData.push(textRow);
    spreadsheetData.push(filesRow);
  
    // Create a worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(spreadsheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Cube Data");
  
    // Generate Excel buffer
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  
    // Step 2: Add the Excel File to the ZIP
    zip.file("CubeData.xlsx", excelBuffer);
  
    // Step 3: Add Uploaded Files to the ZIP
    Object.entries(faceFiles).forEach(([faceIndex, files]) => {
      const { saved = [] } = files;
      if (Array.isArray(saved)) {
        saved.forEach((file) => {
          zip.file(file.name, file);
        });
      }
    });
  
    // Step 4: Generate the ZIP file and trigger the download
    zip.generateAsync({ type: "blob" }).then((content) => {
      saveAs(content, "CubeDataFolder.zip");
    });
  };
  

  return (
    <div className="cubic-level">
      <h1 className="cubic-level-title">Cubic Level</h1>
      <div ref={containerRef} className="cubic-level-container"></div>
  
      {/* XLSX Button*/}
      <button
        className="xlsx-button"
        onClick={handleXLSXClick}
      >
        <img
          src="/images/buttons/excelButton.jpg" /* may replace with xlsxButton.jpg */
          alt="XLSX Button"
          className="xlsx-image"
        />
      </button>

      {/* Spreadsheet (Modal) Pop-Up */}
      {isXModalOpen && (
        <div className="ssh-modal-overlay">
          <div className="ssh-modal-content">
            <button className="close-button" onClick={() => setIsXModalOpen(false)}>
              X
            </button>
            <table className="spreadsheet-table">
              <thead>
                <tr>
                  {spreadsheetData[0].map((header, index) => (
                    <th key={index}>{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {spreadsheetData.slice(1).map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((cell, cellIndex) => (
                      <td
                        key={cellIndex}
                        style={{
                          whiteSpace: "pre-wrap",
                          ...(cellIndex === 0 && { fontWeight: "bold", backgroundColor: "#f4f4f4" }),
                        }}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Download Button */}
      <button
        className="download-button"
        onClick={handleDownloadClick}
      >
        <img
          src="/images/buttons/downloadButton.jpg"
          alt="Download Button"
          className="download-image"
        />
      </button>
  
      {/* Text Box */}
      {selectedFaceIndex !== null && (
        <div className="text-input-overlay">
          { /* Instructions Button */}
          <button className="instructions-button" onClick={toggleInstructionsModal}>
            ✱
          </button>

          <h2 className="face-label">{labels[selectedFaceIndex]}</h2>
          <div className="text-area-container">
            <textarea
              id="text-area"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type here..."
            ></textarea>
            
            <div className="file-list">
              {/* Saved Files */}
              {tempFaceFiles[selectedFaceIndex]?.saved.map((file, index) => (
                <div key={`saved-${index}`} className="file-item">
                  <button
                    className="delete-file-button"
                    onClick={() => handleDeleteFile(selectedFaceIndex, index, "saved")}
                  >
                    X
                  </button>
                  <span>{file.name}</span>
                </div>
              ))}

              {/* Unsaved Files */}
              {tempFaceFiles[selectedFaceIndex]?.pending.map((file, index) => (
                <div key={`pending-${index}`} className="file-item pending">
                  <button
                    className="delete-file-button"
                    onClick={() => handleDeleteFile(selectedFaceIndex, index, "pending")}
                  >
                    X
                  </button>
                  <span>{file.name} (unsaved)</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bullet Points Button */}
          <button
            className="bullet-button"
            onClick={() => formatText("bullet")}
          >
            <img
              src="/images/buttons/bulletpoint.jpg"
              alt="Bullet Point"
              className="bullet-image"
            />
          </button>

          {/* Upload (Insert Files) & Save Buttons */}
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

      {/* Instructions (Modal) Pop-Up */}
      {isIModalOpen && (
        <div className="i-modal-overlay">
          <div className="i-modal-content">
            <button className="close-button" onClick={toggleInstructionsModal}>
              X
            </button>
            <textarea
              readOnly
              className="instructions-textbox"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              ref={(textarea) => {
                if (textarea) {
                  textarea.style.height = "auto";
                  const newHeight = textarea.scrollHeight;
                  const maxHeight = parseInt(
                    window.getComputedStyle(textarea).getPropertyValue("max-height"),
                    10
                  );
            
                  // Manage scroll bar
                  if (newHeight > maxHeight) {
                    textarea.style.height = `${maxHeight}px`;
                    textarea.style.overflowY = "auto"; // Enable scroll bar
                  } else {
                    textarea.style.height = `${newHeight}px`;
                    textarea.style.overflowY = "hidden"; // Hide scroll bar
                  }
                }
              }}
              placeholder="None."
              ></textarea>
          </div>
        </div>
      )}
    </div>
  );     
};

export default CubicLevel;