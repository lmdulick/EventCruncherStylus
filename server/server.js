const express = require('express')
const app = express()

app.get("/api", (req, res) => {
    res.json({"users": ["userOne", "userTwo", "userThree"]})
})

// need port 5000 ??
app.listen(4000, () => {console.log("Server started on port 4000")})

// http://localhost:4000/api