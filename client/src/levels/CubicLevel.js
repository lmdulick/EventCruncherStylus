import React, { useEffect, useRef, useState } from "react";
import * as XLSX from "xlsx";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import "./CubicLevel.css";


const CubicLevel = () => {
  const containerRef = useRef(null);

  // Mouse Indexing
  const [selectedFaceIndex, setSelectedFaceIndex] = useState(null);
  const [activeFaceIndex, setActiveFaceIndex] = useState(null);

  // Data Text Box & Files
  const [faceTexts, setFaceTexts] = useState({});
  const [inputText, setInputText] = useState("");
  const [faceFiles, setFaceFiles] = useState({}); 
  const [tempFaceFiles, setTempFaceFiles] = useState({});
  
  // DI = default instructions text box
  const [isDITextBoxVisible, setIsDITextBoxVisible] = useState(true);

  // CI modal = criteria instructions modal
  const [isCIModalOpen, setIsCIModalOpen] = useState(false);
  const [criteriaInstructions, setCriteriaInstructions] = useState({
    0: "", // Who
    1: "", // What
    2: "", // When
    3: "", // Where
    4: "", // Why
    5: "", // How
  });

  // XLSX modal = excel spreadsheet modal
  const [isXlsxModalOpen, setIsXlsxModalOpen] = useState(false);
  const [spreadsheetData, setSpreadsheetData] = useState([]);

  // Global Variables
  const labels = ["Who", "What", "When", "Where", "Why", "How"];
  const textureLoader = new THREE.TextureLoader();
  const materials = [];


  // Toggle Default Instructions text box visibility
  const toggleDITextBox = () => {
    setIsDITextBoxVisible(!isDITextBoxVisible);
  };

  // Show the Default Instructions text box when the page first renders
  useEffect(() => {
    setIsDITextBoxVisible(true);
  }, []);

  // Toggle between the Criteria Instructions Modal and the UI
  const toggleCIModal = () => {
    setIsCIModalOpen(!isCIModalOpen);
  };

  // Update Criteria Instructions for the selected face
  const handleCIChange = (faceIndex, value) => {
    setCriteriaInstructions((prev) => ({
      ...prev,
      [faceIndex]: value,
    }));
  };

  // Adjust the size of the Criteria Instructions modal
  useEffect(() => {
    if (isCIModalOpen) {
      const textarea = document.querySelector('.ci-textbox');

      if (textarea) {
        textarea.addEventListener('input', function () {
          this.style.height = 'auto';
          this.style.height = `${this.scrollHeight}px`;
        });

        return () => {
          textarea.removeEventListener('input', function () {
            this.style.height = 'auto';
            this.style.height = `${this.scrollHeight}px`;
          });
        };
      }
    }
  }, [isCIModalOpen]);

  // Store temporary file uploads (before "Save" is clicked)
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

    // Assign textures to the materials array
    materials.push(
      new THREE.MeshBasicMaterial({
          map: textureLoader.load("/images/cube_faces/whoB.jpg"),
      }),
      new THREE.MeshBasicMaterial({
          map: textureLoader.load("/images/cube_faces/whatB.jpg"),
      }),
      new THREE.MeshBasicMaterial({
          map: textureLoader.load("/images/cube_faces/whenB.jpg"),
      }),
      new THREE.MeshBasicMaterial({
          map: textureLoader.load("/images/cube_faces/whereB.jpg"),
      }),
      new THREE.MeshBasicMaterial({
          map: textureLoader.load("/images/cube_faces/whyB.jpg"),
      }),
      new THREE.MeshBasicMaterial({
          map: textureLoader.load("/images/cube_faces/howB.jpg"),
      })
    );
  
    const cube = new THREE.Mesh(geometry, materials);
    scene.add(cube);

    // Camera and Controls
    camera.position.set(4, 4, 4);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Raycaster for Face Selection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // Map for Cube Faces
    const faceMap = [0, 1, 2, 3, 4, 5];

    // Method for resetting a face from red -> black
    const resetFaceTextures = (currentFaceIndex) => {
      materials.forEach((material, index) => {
          if (index !== currentFaceIndex && labels[index]) {
              const defaultLabel = labels[index].toLowerCase();
              material.map = textureLoader.load(`/images/cube_faces/${defaultLabel}B.jpg`);
              material.needsUpdate = true;
          }
      });
    };

    // Method for handling a mouse click on the cube
    const handleMouseClick = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObject(cube);

      if (intersects.length > 0) {
          const triangleIndex = Math.floor(intersects[0].faceIndex / 2);
          const faceIndex = faceMap[triangleIndex]; // Map triangle index to face index

          if (faceIndex >= 0 && faceIndex < materials.length) {
              // Reset all other faces to their default textures
              resetFaceTextures(faceIndex);

              // Apply the red texture to the newly selected face
              const currentLabel = labels[faceIndex].toLowerCase();
              materials[faceIndex].map = textureLoader.load(
                  `/images/cube_faces/${currentLabel}R.jpg`
              );
              materials[faceIndex].needsUpdate = true;

              // Update state
              setActiveFaceIndex(faceIndex);
              setSelectedFaceIndex(faceIndex);
              setInputText(faceTexts[faceIndex] || "");
          } else {
              console.error(`Invalid face index: ${faceIndex}`);
          }
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
    if (activeFaceIndex !== null && materials[activeFaceIndex]) {
        // Reset the active face texture
        materials[activeFaceIndex].map = textureLoader.load(
            `/images/cube_faces/${labels[activeFaceIndex].toLowerCase()}B.jpg`
        );
        materials[activeFaceIndex].needsUpdate = true;
    }

    // Save the changes for the selected face
    setFaceFiles((prev) => {
        const updatedFaceFiles = { ...prev };

        // Update only the currently selected face
        if (selectedFaceIndex !== null) {
            const currentFiles = tempFaceFiles[selectedFaceIndex] || { saved: [], pending: [] };
            updatedFaceFiles[selectedFaceIndex] = {
                saved: [
                    ...(currentFiles.saved || []), // Retain previously saved files
                    ...(currentFiles.pending || []), // Add pending files
                ],
                pending: [], // Clear pending files after saving
            };
        }

        return updatedFaceFiles;
    });

    if (selectedFaceIndex !== null) {
        setFaceTexts((prev) => ({
            ...prev,
            [selectedFaceIndex]: inputText || "",
        }));
    }

    // Clear temp state and reset text input
    setTempFaceFiles((prev) => ({
        ...prev,
        [selectedFaceIndex]: { saved: [], pending: [] },
    }));
    setInputText("");
    setActiveFaceIndex(null);
    setSelectedFaceIndex(null);

    // Optionally, show default instructions
    setIsDITextBoxVisible(true);
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
  
    // Update the text box to remove the file name bullet point
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
  
      // Adjust cursor position after '•'
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 3;
      }, 0);
    }
  };

  
  // Method for viewing the cube data in a spreadsheet (xslx) format
  const handleXLSXClick = () => {
    const faceLabels = ["WHO", "WHAT", "WHEN", "WHERE", "WHY", "HOW"];
  
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
    setIsXlsxModalOpen(true);
  };
  

  // Method for downloading the spreadsheet
  const handleDownloadClick = async () => {
    const faceLabels = ["WHO", "WHAT", "WHEN", "WHERE", "WHY", "HOW"];
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

      {/* Default Instructions Text Box */}
      {isDITextBoxVisible && (
        <div className="text-input-overlay">
          <h2 className="face-label"></h2>
          <textarea
            className="di-textbox"
            readOnly
            value={`Welcome to the CUBIC LEVEL! \n\nHere’s how to interact with the cube:
  • Spin the cube by clicking and dragging.
  • Click on a face to open the corresponding text box.
  • Use the "Insert Files" button to add files.
  • Click "Save" to store your changes.
  • Click the "Excel" button in the bottom right corner to view 
  the cubic data in a spreadsheet format.
  • Click the "Download" button in the bottom right corner to 
  download the cubic data and uploaded files.`}
          />
        </div>
      )}

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

      {/* XLSX Spreadsheet (Modal) Pop-Up */}
      {isXlsxModalOpen && (
        <div className="ssh-modal-overlay">
          <div className="ssh-modal-content">
            <button className="close-button" onClick={() => setIsXlsxModalOpen(false)}>
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
          { /* Criteria Instructions Button */}
          <button className="ci-button" onClick={toggleCIModal}>
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
              {faceFiles[selectedFaceIndex]?.saved.map((file, index) => (
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

              {/* Unsaved (Pending) Files */}
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

      {/* Criteria Instructions Modal */}
      {isCIModalOpen && (
        <div className="ci-modal-overlay">
          <div className="ci-modal-content">
            <button className="close-button" onClick={toggleCIModal}>
              X
            </button>
            {/* Label of Cube Face */}
            <h2 className="ci-modal-face-label">
              Criteria Instructions : {labels[selectedFaceIndex]}
              {/* Criteria Instructions for the {labels[selectedFaceIndex]} Face */}
            </h2>
            {/* Criteria Instructions Text Box */}
            <textarea
              className="ci-textbox"
              value={criteriaInstructions[selectedFaceIndex] || ""}
              onChange={(e) =>
                handleCIChange(selectedFaceIndex, e.target.value)
              }
              ref={(textarea) => {
                if (textarea) {
                  textarea.style.height = "auto";
                  const newHeight = textarea.scrollHeight;
                  const maxHeight = parseInt(
                    window.getComputedStyle(textarea).getPropertyValue("max-height"),
                    10
                  );
                  if (newHeight > maxHeight) {
                    textarea.style.height = `${maxHeight}px`;
                    textarea.style.overflowY = "auto";
                  } else {
                    textarea.style.height = `${newHeight}px`;
                    textarea.style.overflowY = "hidden";
                  }
                }
              }}
              placeholder={`Enter criteria instructions for the ${labels[selectedFaceIndex]} face...`}
              // placeholder={`None.`}
            ></textarea>
          </div>
        </div>
      )}
    </div>
  );
};

export default CubicLevel;