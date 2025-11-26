const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors());
app.use(express.json());
app.get('/', (req, res) => res.send('USC Forum API running'));
app.listen(5000, () => console.log('API running on port 5000'));
