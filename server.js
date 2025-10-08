const express = require('express');
const admin = require('firebase-admin');
const multer = require('multer');
const cors = require('cors');
require('dotenv').config(); // load env

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // frontend files

// Parse service account from env
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Single file upload
const upload = multer({ storage: multer.memoryStorage() });

app.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).send('No file uploaded');

  const fileName = req.file.originalname;
  const textContent = req.file.buffer.toString('utf-8');

  const jsonData = {
    name: fileName,
    content: textContent,
    timestamp: new Date().toISOString()
  };

  try {
    await db.collection('files').doc(fileName).set(jsonData);
    res.send('File uploaded and saved to Firebase!');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error saving to Firebase');
  }
});

app.get('/files', async (req, res) => {
  try {
    const snapshot = await db.collection('files').orderBy('timestamp', 'desc').get();
    const files = snapshot.docs.map(doc => doc.data());
    res.json(files);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching files');
  }
});

app.get('/file/:name', async (req, res) => {
  try {
    const doc = await db.collection('files').doc(req.params.name).get();
    if (!doc.exists) return res.status(404).send('File not found');
    res.send(doc.data().content);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching file content');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
