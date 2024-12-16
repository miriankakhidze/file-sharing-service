const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const zlib = require('zlib');

const fileStoragePath = process.env.FILE_STORAGE_PATH;
const linkExpirationMinutes = parseInt(process.env.LINK_EXPIRATION_MINUTES, 10);
const sharedLinks = new Map(); // In-memory storage for shared links

const generateShortLink = (req, res) => {
    const userId = req.userId;
    const { fileName } = req.body;

    if (!fileName) {
        return res.status(400).json({ message: 'File name is required' });
    }

    const userFolder = path.join(fileStoragePath, `user_${userId}`);
    const filePath = path.join(userFolder, fileName);

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: 'File or folder not found' });
    }

    const linkId = crypto.randomBytes(8).toString('hex');
    const expirationTime = Date.now() + linkExpirationMinutes * 60 * 1000;

    sharedLinks.set(linkId, { filePath, expirationTime });

    const shortLink = `${req.protocol}://${req.get('host')}/download/${linkId}`;
    res.json({ shortLink });
};



const downloadFile = (req, res) => {
    const { linkId } = req.params;

    if (!sharedLinks.has(linkId)) {
        return res.status(404).json({ message: 'Link not found or expired' });
    }

    const { filePath, expirationTime } = sharedLinks.get(linkId);

    if (Date.now() > expirationTime) {
        sharedLinks.delete(linkId);
        return res.status(410).json({ message: 'Link has expired' });
    }

    const stats = fs.statSync(filePath);

    if (stats.isDirectory()) {
        // Compress and send folder
        const archiveName = `${path.basename(filePath)}.tar.gz`;
        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename="${archiveName}"`);

        tar.c({ gzip: true, cwd: filePath }, ['./']).pipe(res);
    } else {
        // Stream file directly
        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename="${path.basename(filePath)}"`);
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);
    }
};

const bufferExample = (req, res) => {
    const { fileName } = req.query;

    if (!fileName) {
        return res.status(400).json({ message: 'File name is required' });
    }

    const filePath = path.join(process.env.FILE_STORAGE_PATH, fileName);

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: 'File not found' });
    }

    const fileBuffer = fs.readFileSync(filePath);
    const bufferSize = 1024; // 1KB
    let offset = 0;

    while (offset < fileBuffer.length) {
        const chunk = fileBuffer.slice(offset, offset + bufferSize);
        console.log(`Chunk (${offset} - ${offset + bufferSize}):`, chunk.toString('utf8'));
        offset += bufferSize;
    }

    res.json({ message: 'File processed in chunks' });
};

const streamFile = (req, res) => {
    const { fileName } = req.query;

    if (!fileName) {
        return res.status(400).json({ message: 'File name is required' });
    }

    const filePath = path.join(process.env.FILE_STORAGE_PATH, fileName);

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: 'File not found' });
    }

    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
};
// const downloadFile = (req, res) => {
//   const { linkId } = req.params;

//   if (!sharedLinks.has(linkId)) {
//     return res.status(404).json({ message: 'Link not found or expired' });
//   }

//   const { filePath, expirationTime } = sharedLinks.get(linkId);

//   if (Date.now() > expirationTime) {
//     sharedLinks.delete(linkId);
//     return res.status(410).json({ message: 'Link has expired' });
//   }

//   const stats = fs.statSync(filePath);

//   if (stats.isDirectory()) {
//     const zipStream = zlib.createGzip();
//     res.setHeader('Content-Type', 'application/octet-stream');
//     res.setHeader('Content-Disposition', `attachment; filename="${path.basename(filePath)}.zip"`);
//     const folderStream = require('tar').c({ gzip: true, cwd: filePath }, ['./']);
//     folderStream.pipe(res);
//   } else {
//     res.setHeader('Content-Type', 'application/octet-stream');
//     res.setHeader('Content-Disposition', `attachment; filename="${path.basename(filePath)}"`);
//     const fileStream = fs.createReadStream(filePath);
//     fileStream.pipe(res);
//   }
// };
module.exports = { generateShortLink, downloadFile, streamFile, bufferExample };