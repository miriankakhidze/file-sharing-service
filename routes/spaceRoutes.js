const express = require('express');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const authenticate = require('../middlewares/authMiddleware');

const { listItems, createItem, deleteItem, uploadFileWithVersion, listFileVersions, downloadFileVersion, deleteFileVersion } = require('../controllers/spaceController');
const { uploadFile, attachMetadata, getMetadata } = require('../controllers/fileController');
const { generateShortLink, downloadFile, bufferExample, streamFile } = require('../controllers/shareController');
const router = express.Router();

router.put('/create', authenticate, createItem);
router.delete('/file', authenticate, deleteItem);

router.get('/', authenticate, listItems);
router.post('/upload', authenticate, upload.single('file'), uploadFile);

router.post('/meta', authenticate, attachMetadata);
router.get('/meta', authenticate, getMetadata);

router.post('/share', authenticate, generateShortLink);
router.get('/download/:linkId', downloadFile);

router.get('/buffer-example', authenticate, bufferExample);
router.get('/stream-file', authenticate, streamFile);

// version
// router.get('/file-versions', authenticate, listFileVersions);
// router.post('/upload', authenticate, upload.single('file'), uploadFileWithVersion);

// router.get('/file-version', authenticate, downloadFileVersion);
// router.delete('/file-version', authenticate, deleteFileVersion);

module.exports = router;