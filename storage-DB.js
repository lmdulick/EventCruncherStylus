// CREATE TABLE profiles (
//     id INT AUTO_INCREMENT PRIMARY KEY,
//     username VARCHAR(255) UNIQUE,
//     password VARCHAR(255)
// );
    
// INSERT INTO profiles (id, username, password)
//     VALUES (
//         1,
//         'admin',
//         'admin'
// );
    
// CREATE TABLE avdata (
//     id INT AUTO_INCREMENT PRIMARY KEY,
//     user_id INT NOT NULL UNIQUE,
//     who_text TEXT,
//     who_files JSON,
//     what_text TEXT,
//     what_files JSON,
//     when_text TEXT,
//     when_files JSON,
//     where_text TEXT,
//     where_files JSON,
//     why_text TEXT,
//     why_files JSON,
//     how_text TEXT,
//     how_files JSON,
//     FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
// );