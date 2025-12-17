const express = require('express');
const app = express();
const cors = require('cors');
const mysql = require('mysql');
app.use(cors());
app.use(express.json());
app.get('/', (req, res) => res.send('USC Forum API running'));
app.listen(5000, () => console.log('API running on port 5000'));

// Database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'usc_forum'
});
db.connect(err => {
    if (err) {
        console.error('Error connecting to database:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

/* SAMPLE ON HOW TO GET 
app.get('/posts', (req, res) => {
    const query = 'SELECT * FROM posts';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching posts:', err);
            return res.status(500).json({ error: 'Failed to fetch posts' });
        }
        res.json(results);
    });
});
*/