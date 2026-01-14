const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const jwt = require('jsonwebtoken');
const path = require('path');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET = process.env.JWT_SECRET || "SBF_SECRET_KEY"; // Use Render env vars for security

app.use(cors());
app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(__dirname)); // ← REQUIRED
app.use('/images', express.static(path.join(__dirname, 'images')));

// SQLite database (persistent if using Render disk)
const db = new sqlite3.Database('sbf-booking/data/bookings.db', err => {
  if (err) console.error(err);
  else console.log('SQLite ready');
});

db.run(`
CREATE TABLE IF NOT EXISTS bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  email TEXT,
  date TEXT,
  time TEXT,
  message TEXT
)
`);

// Owner credentials
const OWNER = { username: "Frazer", password: "SBFLOG12" };

// -------------------- Routes --------------------

// Login (owner)
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (username === OWNER.username && password === OWNER.password) {
    const token = jwt.sign({ username }, SECRET, { expiresIn: '2h' });
    return res.json({ success: true, token });
  }
  res.status(401).json({ success: false, message: 'Invalid credentials' });
});

// Get bookings (protected)
app.get('/api/bookings', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });

  const token = authHeader.split(' ')[1];
  try {
    jwt.verify(token, SECRET);
    db.all(`SELECT * FROM bookings ORDER BY id DESC`, [], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
  } catch {
    res.status(401).json({ error: 'Unauthorized' });
  }
});

// Add booking
app.post('/api/book', (req, res) => {
  const { name, email, date, time, message } = req.body;
  db.run(
    `INSERT INTO bookings (name, email, date, time, message) VALUES (?, ?, ?, ?, ?)`,
    [name, email, date, time, message],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    }
  );
});

// Serve pages
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/index.html', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/booking.html', (req, res) => res.sendFile(path.join(__dirname, 'booking.html')));
app.get('/portfolio.html', (req, res) => res.sendFile(path.join(__dirname, 'portfolio.html')));
app.get('/requests.html', (req, res) => res.sendFile(path.join(__dirname, 'requests.html')));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));



