const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const folder = path.join(__dirname, 'texts'); // folder with your .txt files

app.use(express.static('public')); // frontend files

// Get list of text files
app.get('/files', (req, res) => {
  try {
    const files = fs.readdirSync(folder).filter(f => f.endsWith('.txt'));
    res.json(files);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error reading files');
  }
});

// Get content of a specific file
app.get('/file/:name', (req, res) => {
  const filePath = path.join(folder, req.params.name);
  if (!fs.existsSync(filePath)) return res.status(404).send('File not found');

  const content = fs.readFileSync(filePath, 'utf-8');
  res.send(content);
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
