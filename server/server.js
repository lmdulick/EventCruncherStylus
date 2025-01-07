const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const app = express();

app.use(express.json()); // Enable JSON parsing middleware

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



// Start the server
app.listen(4000, () => {
    console.log("Server started on port 4000");
});

// // Route to add a new user
// app.post('/api/users', async (req, res) => {
//     const { firstName, lastName, email, username, password } = req.body;
    
//     // Hash the password before storing
//     const hashedPassword = await bcrypt.hash(password, 10);
    
//     const sql = `INSERT INTO users (first_name, last_name, email, username, password) VALUES (?, ?, ?, ?, ?)`;
//     const values = [firstName, lastName, email, username, hashedPassword];
    
//     db.query(sql, values, (err, result) => {
//         if (err) return res.status(500).json({ error: err.message });
//         res.status(201).json({ message: 'User created', userId: result.insertId });
//     });
// });

// // Route to get user by ID
// app.get('/api/users/:id', (req, res) => {
//     const userId = req.params.id;
    
//     const sql = `SELECT id, first_name, last_name, email, username FROM users WHERE id = ?`;
//     db.query(sql, [userId], (err, result) => {
//         if (err) return res.status(500).json({ error: err.message });
//         if (result.length === 0) return res.status(404).json({ message: 'User not found' });
//         res.json(result[0]);
//     });
// });

// // Route to authenticate user
// app.post('/api/authenticate', (req, res) => {
//     const { username, password } = req.body;
    
//     const sql = `SELECT * FROM users WHERE username = ?`;
//     db.query(sql, [username], async (err, results) => {
//         if (err) return res.status(500).json({ error: err.message });
//         if (results.length === 0) return res.status(404).json({ message: 'User not found' });
        
//         const user = results[0];
        
//         // Compare provided password with stored hashed password
//         const isMatch = await bcrypt.compare(password, user.password);
//         if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });
        
//         res.json({ message: 'Authenticated successfully', userId: user.id });
//     });
// });
