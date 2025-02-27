// const express = require('express');
// const mysql = require('mysql2');
// const bcrypt = require('bcryptjs');
// const cors = require('cors');
// const path = require('path');
// const app = express();

// app.use(cors({
//     origin: 'http://localhost:3000',
//     methods: ['GET', 'POST', 'PUT', 'DELETE'],
//     credentials: true,
// }));

// app.use(express.json());

// app.use('/images', express.static(path.join(__dirname, 'public/images')));

// // MySQL connection
// const db = mysql.createConnection({
//     host: 'localhost',
//     user: 'root',
//     password: 'mysql',
//     database: 'ecsdb'
// });

// // Connect to the database
// db.connect((err) => {
//     if (err) {
//         console.error('Could not connect to MySQL:', err.message);
//         return;
//     }
//     console.log('Connected to MySQL Database');
// });

// // Insert a new account into the profiles DB
// app.post('/api/users', async (req, res) => {
//     const { username, password } = req.body;

//     if (!username || !password) {
//         return res.status(400).json({ error: 'Username and password are required' });
//     }

//     try {
//         // Check if the username already exists in the profiles table
//         const checkQuery = 'SELECT COUNT(*) AS count FROM profiles WHERE username = ?';
//         db.query(checkQuery, [username], async (err, results) => {
//             if (err) {
//                 console.error('Error checking for existing username:', err.message);
//                 return res.status(500).json({ error: 'Database error' });
//             }

//             if (results[0].count > 0) {
//                 // Username already exists
//                 return res.status(400).json({ error: 'Username already exists' });
//             }

//             // Encrypt the password for security
//             const hashedPassword = await bcrypt.hash(password, 10);

//             // Insert the new user into the profiles table
//             const insertQuery = 'INSERT INTO profiles (username, password) VALUES (?, ?)';
//             db.query(insertQuery, [username, hashedPassword], (err, results) => {
//                 if (err) {
//                     console.error('Error inserting into profiles:', err.message);
//                     return res.status(500).json({ error: 'Database error' });
//                 }

//                 res.status(201).json({ message: 'User created successfully', userId: results.insertId });
//             });
//         });
//     } catch (error) {
//         console.error('Error creating user:', error);
//         res.status(500).json({ error: 'Server error' });
//     }
// });

// // Validate username/password combo on Login page
// app.post('/api/login', (req, res) => {
//     const { username, password } = req.body;

//     if (!username || !password) {
//         return res.status(400).json({ error: 'Username and password are required' });
//     }

//     const query = 'SELECT id, password FROM profiles WHERE username = ?';
//     db.query(query, [username], async (err, results) => {
//         if (err) {
//             console.error('Error querying profiles:', err.message);
//             return res.status(500).json({ error: 'Database error' });
//         }

//         if (results.length === 0) {
//             return res.status(401).json({ error: 'Invalid username or password' });
//         }

//         const { id, password: hashedPassword } = results[0];

//         const isMatch = await bcrypt.compare(password, hashedPassword);
//         if (isMatch) {
//             return res.status(200).json({ 
//                 message: 'Login successful', 
//                 userId: id // Include the user's ID in the response
//             });
//         } else {
//             return res.status(401).json({ error: 'Invalid username or password' });
//         }
//     });
// });


// // Only update one face in the avdata table when new text is stored
// app.post('/api/avdata/update', (req, res) => {
//     const { user_id, face, text } = req.body;

//     console.log("Updating:", { user_id, face, text });

//     if (!user_id || !face || text === undefined) {
//         return res.status(400).json({ error: 'Missing required fields' });
//     }

//     const query = `
//         UPDATE avdata 
//         SET ${face} = ? 
//         WHERE user_id = ?
//     `;

//     db.query(query, [text, user_id], (err, results) => {
//         if (err) {
//             console.error('Error updating data:', err.message);
//             return res.status(500).json({ error: 'Database error' });
//         }
//         res.status(200).json({ message: `Updated ${face} successfully` });
//     });
// });

// // Fetch saved data in the avdata table
// app.get('/api/avdata/:userId', (req, res) => {
//     const userId = req.params.userId;

//     if (!userId) {
//         return res.status(400).json({ error: 'User ID is required' });
//     }

//     const query = `SELECT * FROM avdata WHERE user_id = ?`;

//     db.query(query, [userId], (err, results) => {
//         if (err) {
//             console.error('Error retrieving data:', err.message);
//             return res.status(500).json({ error: 'Database error' });
//         }
        
//         if (results.length === 0) {
//             return res.status(404).json({ error: 'No data found for this user' });
//         }

//         res.status(200).json(results[0]); // Return the first (only) row of user data
//     });
// });




// // Start the server
// app.listen(4000, () => {
//     console.log("Server started on port 4000");
// });

// // localhost:4000/api/avdata/1










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

            if (results[0].count > 0) {
                // Username already exists
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
                userId: id // Include the user's ID in the response
            });
        } else {
            return res.status(401).json({ error: 'Invalid username or password' });
        }
    });
});


// Multer Setup for Handling File Uploads
const upload = multer({ storage: multer.memoryStorage() });


// Only update one face in the avdata table when new text is stored
// app.post('/api/avdata/update', (req, res) => {
//     const { user_id, face, text } = req.body;

//     console.log("Updating:", { user_id, face, text });

//     if (!user_id || !face || text === undefined) {
//         return res.status(400).json({ error: 'Missing required fields' });
//     }

//     const query = `
//         UPDATE avdata 
//         SET ${face} = ? 
//         WHERE user_id = ?
//     `;

//     db.query(query, [text, user_id], (err, results) => {
//         if (err) {
//             console.error('Error updating data:', err.message);
//             return res.status(500).json({ error: 'Database error' });
//         }
//         res.status(200).json({ message: `Updated ${face} successfully` });
//     });
// });
// Update avdata table for text or files
app.post('/api/avdata/update', upload.single('file'), (req, res) => {
    const { user_id, face, text } = req.body;
    const file = req.file;

    console.log("🟢 Updating Data:", { user_id, face, text, file: file ? file.originalname : "No File" });

    if (!user_id || !face) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const textColumn = face;
    const fileColumn = `${face.replace('_text', '_files')}`;

    let query, values;

    if (file) {
        console.log("🟢 Storing file:", file.originalname, "Size:", file.size);

        query = `UPDATE avdata SET ${textColumn} = ?, ${fileColumn} = ? WHERE user_id = ?`;
        values = [text || "", file.buffer, user_id];
    } else {
        query = `UPDATE avdata SET ${textColumn} = ? WHERE user_id = ?`;
        values = [text || "", user_id];
    }

    db.query(query, values, (err, results) => {
        if (err) {
            console.error("🔴 Database error:", err.message);
            return res.status(500).json({ error: "Database update error" });
        }
        res.status(200).json({ message: `Updated ${face} successfully` });
    });
});


// Send files as blob type
// app.get('/api/avdata/files/:userId/:face', (req, res) => {
//     const { userId, face } = req.params;
//     const fileColumn = `${face.replace('_text', '_files')}`;

//     const query = `SELECT ${fileColumn} FROM avdata WHERE user_id = ?`;

//     db.query(query, [userId], (err, results) => {
//         if (err) {
//             console.error('Error retrieving file:', err.message);
//             return res.status(500).json({ error: 'Database error' });
//         }
//         if (results.length === 0 || !results[0][fileColumn]) {
//             return res.status(404).json({ error: 'File not found' });
//         }

//         res.setHeader('Content-Type', 'application/octet-stream');
//         res.setHeader('Content-Disposition', `attachment; filename=${face}.bin`);
//         res.send(results[0][fileColumn]);
//     });
// });
app.get('/api/avdata/files/:userId/:face', (req, res) => {
    const { userId, face } = req.params;
    const fileColumn = `${face}_files`;

    console.log(`🟢 Fetching file for user ${userId}, face ${face}`);

    const query = `SELECT ${fileColumn} FROM avdata WHERE user_id = ?`;

    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error('🔴 Database error while fetching file:', err.message);
            return res.status(500).json({ error: 'Database error while fetching file' });
        }

        if (results.length === 0 || !results[0][fileColumn]) {
            console.warn(`⚠️ No file found for user ${userId}, face ${face}`);
            return res.status(404).json({ error: 'File not found' });
        }

        const fileData = results[0][fileColumn];

        if (!fileData) {
            console.warn(`⚠️ Empty file column for user ${userId}, face ${face}`);
            return res.status(404).json({ error: 'File not found in database' });
        }

        console.log(`🟢 Sending file for user ${userId}, size: ${fileData.length} bytes`);

        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename=${face}.png`);
        res.send(Buffer.from(fileData));
    });
});







// Fetch saved data in the avdata table
// app.get('/api/avdata/:userId', (req, res) => {
//     const userId = req.params.userId;

//     if (!userId) {
//         return res.status(400).json({ error: 'User ID is required' });
//     }

//     const query = `SELECT * FROM avdata WHERE user_id = ?`;

//     db.query(query, [userId], (err, results) => {
//         if (err) {
//             console.error('Error retrieving data:', err.message);
//             return res.status(500).json({ error: 'Database error' });
//         }
        
//         if (results.length === 0) {
//             return res.status(404).json({ error: 'No data found for this user' });
//         }

//         res.status(200).json(results[0]); // Return the first (only) row of user data
//     });
// });
app.get('/api/avdata/:userId', (req, res) => {
    const userId = req.params.userId;

    if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    const query = `SELECT user_id, who_text, what_text, when_text, where_text, why_text, how_text FROM avdata WHERE user_id = ?`;

    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error('🔴 Database error while fetching user data:', err.message);
            return res.status(500).json({ error: 'Database error' });
        }

        if (results.length === 0) {
            console.error(`🔴 No data found for user ${userId}`);
            return res.status(404).json({ error: 'No data found for this user' });
        }

        console.log(`🟢 User data retrieved for user ${userId}`);
        res.status(200).json(results[0]);
    });
});





// Start the server
app.listen(4000, () => {
    console.log("Server started on port 4000");
});

// localhost:4000/api/avdata/1