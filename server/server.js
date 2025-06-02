const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
    exposedHeaders: ['Content-Disposition', 'Content-Type']
}));

app.use(express.json());

app.use('/images', express.static(path.join(__dirname, 'public/images')));

// MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'mysql',
    database: 'ecsdb'
});

// Connect to the database
db.connect((err) => {
    if (err) {
        console.error('Could not connect to MySQL:', err.message);
        return;
    }
    console.log('Connected to MySQL Database');
});

// Insert a new account into the profiles DB
app.post('/api/users', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    try {
        // Check if the username already exists in the profiles table
        const checkQuery = 'SELECT COUNT(*) AS count FROM profiles WHERE username = ?';
        db.query(checkQuery, [username], async (err, results) => {
            if (err) {
                console.error('Error checking for existing username:', err.message);
                return res.status(500).json({ error: 'Database error' });
            }

            // Username already exists
            if (results[0].count > 0) {
                return res.status(400).json({ error: 'Username already exists' });
            }

            // Encrypt the password for security
            const hashedPassword = await bcrypt.hash(password, 10);

            // Insert the new user into the profiles table
            const insertQuery = 'INSERT INTO profiles (username, password) VALUES (?, ?)';
            db.query(insertQuery, [username, hashedPassword], (err, results) => {
                if (err) {
                    console.error('Error inserting into profiles:', err.message);
                    return res.status(500).json({ error: 'Database error' });
                }

                res.status(201).json({ message: 'User created successfully', userId: results.insertId });
            });
        });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Validate username/password combo on Login page
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    const query = 'SELECT id, password FROM profiles WHERE username = ?';
    db.query(query, [username], async (err, results) => {
        if (err) {
            console.error('Error querying profiles:', err.message);
            return res.status(500).json({ error: 'Database error' });
        }

        if (results.length === 0) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        const { id, password: hashedPassword } = results[0];

        const isMatch = await bcrypt.compare(password, hashedPassword);
        if (isMatch) {
            return res.status(200).json({ 
                message: 'Login successful', 
                userId: id
            });
        } else {
            return res.status(401).json({ error: 'Invalid username or password' });
        }
    });
});


// Multer Setup for Handling File Uploads
const upload = multer({ storage: multer.memoryStorage() });


// Only update one face in the avdata table when new text is stored
app.post('/api/avdata/update', upload.single('file'), (req, res) => {
    const { user_id, face, text } = req.body;
    const file = req.file;

    console.log("Updating Data:", { user_id, face, text, file: file ? file.originalname : "No File" });

    if (!user_id || !face) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const textColumn = face;
    const fileColumn = `${face.replace('_text', '')}_files`;
    const fileNameColumn = `${face.replace('_text', '')}_file_name`;
    const fileTypeColumn = `${face.replace('_text', '')}_file_type`;
    

    // Check if user exists in avdata table
    const checkQuery = `SELECT * FROM avdata WHERE user_id = ?`;
    db.query(checkQuery, [user_id], (err, results) => {
        if (err) {
            console.error("Database error:", err.message);
            return res.status(500).json({ error: "Database check error" });
        }

        if (results.length === 0) {
            console.log(`No entry found for user ${user_id}, inserting new row.`);
            const insertQuery = `INSERT INTO avdata (user_id) VALUES (?)`;
            db.query(insertQuery, [user_id], (insertErr) => {
                if (insertErr) {
                    console.error("Error inserting new user into avdata:", insertErr.message);
                    return res.status(500).json({ error: "Database insert error" });
                }
                console.log(`Inserted new entry for user ${user_id}`);
                updateAvData(user_id, textColumn, fileColumn, fileNameColumn, fileTypeColumn, text, file, res);
            });
        } else {
            updateAvData(user_id, textColumn, fileColumn, fileNameColumn, fileTypeColumn, text, file, res);
        }
    });
});

function updateAvData(user_id, textColumn, fileColumn, fileNameColumn, fileTypeColumn, text, file, res) {
    let query, values;

    if (file) {
        console.log("Storing file:", file.originalname, "Size:", file.size, "Type:", file.mimetype);

        query = `UPDATE avdata SET ${textColumn} = ?, ${fileColumn} = ?, ${fileNameColumn} = ?, ${fileTypeColumn} = ? WHERE user_id = ?`;
        values = [text || "", file.buffer, file.originalname, file.mimetype, user_id];
    } else {
        query = `UPDATE avdata SET ${textColumn} = ? WHERE user_id = ?`;
        values = [text || "", user_id];
    }

    db.query(query, values, (err, results) => {
        if (err) {
            console.error("Database error:", err.message);
            return res.status(500).json({ error: "Database update error" });
        }
        res.status(200).json({ message: `Updated ${textColumn} successfully` });
    });
}


app.get('/api/avdata/files/:userId/:face', (req, res) => {
    const { userId, face } = req.params;
    const fileColumn = `${face.replace('_text', '')}_files`;
    const fileNameColumn = `${face.replace('_text', '')}_file_name`;
    const fileTypeColumn = `${face.replace('_text', '')}_file_type`;
    
    console.log(`Fetching file for user ${userId}, face ${face}`);

    const query = `SELECT ${fileColumn}, ${fileNameColumn}, ${fileTypeColumn} FROM avdata WHERE user_id = ?`;

    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Database error while fetching file:', err.message);
            return res.status(500).json({ error: 'Database error while fetching file' });
        }

        if (results.length === 0 || !results[0][fileColumn]) {
            console.warn(`No file found for user ${userId}, face ${face}`);
            return res.status(404).json({ error: 'File not found' });
        }

        const fileData = results[0][fileColumn];
        let fileName = results[0][fileNameColumn] || `${face}.bin`;
        const fileType = results[0][fileTypeColumn] || "application/octet-stream";

        console.log("Retrieved File from DB:");
        console.log(` - File Name: ${fileName}`);
        console.log(` - File Type: ${fileType}`);
        console.log(` - File Size: ${fileData.length} bytes`);
        
        res.setHeader('Content-Type', fileType);
        res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(fileName)}"`);
        console.log("Here's the headers: ", res.getHeaders());
        res.send(Buffer.from(fileData));
    });
});


app.get('/api/avdata/:userId', (req, res) => {
    const userId = req.params.userId;

    if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    const query = `SELECT user_id, who_text, what_text, when_text, where_text, why_text, how_text FROM avdata WHERE user_id = ?`;

    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Database error while fetching user data:', err.message);
            return res.status(500).json({ error: 'Database error' });
        }

        if (results.length === 0) {
            console.error(`No data found for user ${userId}`);
            return res.status(404).json({ error: 'No data found for this user' });
        }

        console.log(`User data retrieved for user ${userId}`);
        res.status(200).json(results[0]);
    });
});


app.delete('/api/avdata/delete-file', (req, res) => {
    const { user_id, face } = req.body;

    if (!user_id || !face) {
        return res.status(400).json({ error: 'Missing required parameters' });
    }

    const fileColumn = `${face.replace('_text', '')}_files`;
    const fileNameColumn = `${face.replace('_text', '')}_file_name`;
    const fileTypeColumn = `${face.replace('_text', '')}_file_type`;

    const query = `UPDATE avdata SET ${fileColumn} = NULL, ${fileNameColumn} = NULL, ${fileTypeColumn} = NULL WHERE user_id = ?`;

    db.query(query, [user_id], (err, results) => {
        if (err) {
            console.error('Database error while deleting file:', err.message);
            return res.status(500).json({ error: 'Database update error' });
        }
        res.status(200).json({ message: `File for ${face} deleted successfully` });
    });
});


app.post("/api/update-criteria", async (req, res) => {
    const { userId, face, text } = req.body;
  
    console.log("Received Update Request:", { userId, face, text });
  
    if (userId !== "1") {
      console.warn("Unauthorized Access Attempt:", userId);
      return res.status(403).json({ error: "Unauthorized: Only admin can update criteria instructions." });
    }
  
    try {
      // Check if any row exists in the criteria table
      db.query("SELECT COUNT(*) AS count FROM criteria", (err, result) => {
        if (err) {
          console.error("Error checking criteria count:", err);
          return res.status(500).json({ error: "Database error while checking existing data." });
        }
  
        const rowCount = result[0].count;
  
        if (rowCount === 0) {
          // If no row exists, insert a default empty row
          const insertQuery = `
            INSERT INTO criteria (who_text, what_text, when_text, where_text, why_text, how_text) 
            VALUES ("", "", "", "", "", "")
          `;
  
          db.query(insertQuery, (insertErr, insertResult) => {
            if (insertErr) {
              console.error("Error inserting default criteria row:", insertErr);
              return res.status(500).json({ error: "Database error while inserting default row." });
            }
  
            console.log("Default criteria row inserted:", insertResult);
  
            updateCriteria();
          });
        } else {
          // If row exists, update it directly
          updateCriteria();
        }
      });
  
      function updateCriteria() {
        const query = `UPDATE criteria SET ${face} = ? WHERE id = 1`;
  
        db.query(query, [text], (updateErr, updateResult) => {
          if (updateErr) {
            console.error("Database Error:", updateErr);
            return res.status(500).json({ error: "Database error while updating criteria." });
          }
  
          console.log("Criteria Updated Successfully:", updateResult);
          res.json({ message: "Criteria updated successfully!" });
        });
      }
    } catch (error) {
      console.error("Server Error:", error);
      res.status(500).json({ error: "Server error." });
    }
  });
  
  app.get("/api/get-criteria", async (req, res) => {
    try {
      db.query("SELECT * FROM criteria LIMIT 1", (err, result) => {
        if (err) {
          console.error("Error fetching criteria:", err);
          return res.status(500).json({ error: "Database error." });
        }
  
        if (result.length === 0) {
          console.warn("No criteria found in database.");
          return res.json({
            who_text: "None.",
            what_text: "None.",
            when_text: "None.",
            where_text: "None.",
            why_text: "None.",
            how_text: "None.",
          });
        }
  
        console.log("Retrieved Criteria:", result[0]);
        res.json(result[0]);
      });
    } catch (error) {
      console.error("Server Error:", error);
      res.status(500).json({ error: "Server error." });
    }
  });
  

  app.post('/api/avfiles/upload', upload.array('files', 10), (req, res) => {
    const { user_id, face } = req.body;
    const files = req.files;

    if (!user_id || !face || !files?.length) {
        return res.status(400).json({ error: 'Missing user_id, face, or files' });
    }

    const values = files.map(file => [
        user_id,
        face,
        file.buffer,
        file.originalname,
        file.mimetype,
    ]);

    const query = `INSERT INTO avfiles (user_id, face, file_data, file_name, file_type) VALUES ?`;

    db.query(query, [values], (err) => {
        if (err) {
            console.error("File upload error:", err);
            return res.status(500).json({ error: "Upload failed" });
        }

        res.status(200).json({ message: "Files uploaded successfully" });
    });
});


app.get('/api/avfiles/:userId/:face', (req, res) => {
    const { userId, face } = req.params;

    const query = `SELECT id, file_name, file_type FROM avfiles WHERE user_id = ? AND face = ?`;
    db.query(query, [userId, face], (err, results) => {
        if (err) {
            console.error("Error fetching files:", err);
            return res.status(500).json({ error: "Error fetching files" });
        }
        res.json(results);
    });
});

app.get('/api/avfiles/download/:fileId', (req, res) => {
    const { fileId } = req.params;

    const query = `SELECT file_data, file_name, file_type FROM avfiles WHERE id = ?`;
    db.query(query, [fileId], (err, results) => {
        if (err || !results.length) {
            console.error("Download error:", err || "File not found");
            return res.status(404).json({ error: "File not found" });
        }

        const { file_data, file_name, file_type } = results[0];
        res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(file_name)}"`);
        res.setHeader("Content-Type", file_type);
        res.send(Buffer.from(file_data));
    });
});


app.delete('/api/avfiles/delete/:fileId', (req, res) => {
    const { fileId } = req.params;

    const query = `DELETE FROM avfiles WHERE id = ?`;
    db.query(query, [fileId], (err) => {
        if (err) {
            console.error("Delete error:", err);
            return res.status(500).json({ error: "Delete failed" });
        }
        res.json({ message: "File deleted" });
    });
});


// Start the server
app.listen(4000, () => {
    console.log("Server started on port 4000");
});

// localhost:4000/api/avdata/1