const fs = require('fs');
const path = require('path');
const { fork } = require('child_process');

const fileStoragePath = process.env.FILE_STORAGE_PATH;

if (!fs.existsSync(fileStoragePath)) {
  fs.mkdirSync(fileStoragePath, { recursive: true });
}

const uploadFile = (req, res) => {
  const userId = req.userId;

  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const userFolder = path.join(fileStoragePath, `user_${userId}`);

  if (!fs.existsSync(userFolder)) {
    fs.mkdirSync(userFolder, { recursive: true });
  }

  const filePath = path.join(userFolder, req.file.originalname);

  fs.renameSync(req.file.path, filePath);

  // Fork a child process to compress the file
  const compressor = fork(path.join(__dirname, '../workers/compressor.js'));

  compressor.send({ filePath });

  compressor.on('message', (message) => {
    console.log(message);
    res.status(201).json({ message: 'File uploaded and compression started', fileName: req.file.originalname });
  });

  compressor.on('error', (err) => {
    console.error('Compression error:', err);
    res.status(500).json({ message: 'File uploaded but compression failed' });
  });
};

// const uploadFile = (req, res) => {
//     const { userId } = req.body;

//     if (!req.file) {
//         return res.status(400).json({ message: 'No file uploaded' });
//     }

//     const userFolder = path.join(fileStoragePath, `user_${userId}`);

//     if (!fs.existsSync(userFolder)) {
//         fs.mkdirSync(userFolder, { recursive: true });
//     }

//     const filePath = path.join(userFolder, req.file.originalname);
//     fs.renameSync(req.file.path, filePath);

//     res.status(201).json({ message: 'File uploaded successfully', fileName: req.file.originalname });
// };

const attachMetadata = (req, res) => {
  const userId = req.userId;
  const { fileName, metadata } = req.body;

  if (!fileName || !metadata) {
    return res.status(400).json({ message: 'File name and metadata are required' });
  }

  const metaFilePath = path.join(fileStoragePath, `user_${userId}`, `${fileName}.meta.json`);

  fs.writeFileSync(metaFilePath, JSON.stringify(metadata, null, 2));

  res.status(200).json({ message: 'Metadata attached successfully' });
};

const getMetadata = (req, res) => {
  const userId = req.userId;
  const { fileName } = req.query;

  if (!fileName) {
    return res.status(400).json({ message: 'File name is required' });
  }

  const metaFilePath = path.join(fileStoragePath, `user_${userId}`, `${fileName}.meta.json`);

  if (!fs.existsSync(metaFilePath)) {
    return res.status(404).json({ message: 'Metadata not found' });
  }

  const metadata = JSON.parse(fs.readFileSync(metaFilePath));
  res.json({ metadata });
};

module.exports = { uploadFile, attachMetadata, getMetadata };