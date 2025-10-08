const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const app = express();
const folder = path.join(__dirname, 'texts');

// Serve static files
app.use(express.static(__dirname));

// Multer setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, folder);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});
const upload = multer({ storage: storage });

// Get list of files
app.get('/files', (req, res) => {
  const files = fs.readdirSync(folder).filter(f => f.endsWith('.txt'));
  res.json(files);
});

// Get single file content
app.get('/file/:name', (req, res) => {
  res.sendFile(path.join(folder, req.params.name));
});

// Upload file
app.post('/upload', upload.single('file'), (req, res) => {
  res.json({ success: true, file: req.file.originalname });
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
