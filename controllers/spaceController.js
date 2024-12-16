const fs = require('fs');
const path = require('path');

const userStoragePath = process.env.FILE_STORAGE_PATH;

const listItems = (req, res) => {
    const userId = req.userId;
    const userFolder = path.join(userStoragePath, `user_${userId}`);

    if (!fs.existsSync(userFolder)) {
        return res.status(404).json({ message: 'User folder not found' });
    }

    const items = fs.readdirSync(userFolder);
    res.json({ items });
};

const createItem = (req, res) => {
    const userId = req.userId;
    const { name, type } = req.body; // 'type' can be 'file' or 'folder'

    if (!name || !type) {
        return res.status(400).json({ message: 'Name and type are required' });
    }

    const userFolder = path.join(userStoragePath, `user_${userId}`);
    const itemPath = path.join(userFolder, name);

    if (!fs.existsSync(userFolder)) {
        fs.mkdirSync(userFolder, { recursive: true });
    }

    if (type === 'folder') {
        if (!fs.existsSync(itemPath)) {
            fs.mkdirSync(itemPath);
            return res.status(201).json({ message: 'Folder created successfully' });
        }
        return res.status(400).json({ message: 'Folder already exists' });
    }

    if (type === 'file') {
        if (!fs.existsSync(itemPath)) {
            fs.writeFileSync(itemPath, '');
            return res.status(201).json({ message: 'File created successfully' });
        }
        return res.status(400).json({ message: 'File already exists' });
    }

    res.status(400).json({ message: 'Invalid type' });
};

const deleteItem = (req, res) => {
    const userId = req.userId;
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ message: 'Name is required' });
    }

    const userFolder = path.join(userStoragePath, `user_${userId}`);
    const itemPath = path.join(userFolder, name);

    if (!fs.existsSync(itemPath)) {
        return res.status(404).json({ message: 'File or folder not found' });
    }

    const stats = fs.statSync(itemPath);

    if (stats.isDirectory()) {
        const contents = fs.readdirSync(itemPath);
        if (contents.length > 0) {
            return res.status(400).json({ message: 'Folder is not empty' });
        }
        fs.rmdirSync(itemPath);
        return res.json({ message: 'Folder deleted successfully' });
    }

    fs.unlinkSync(itemPath);
    res.json({ message: 'File deleted successfully' });
};


const uploadFileWithVersion = (req, res) => {
    const userId = req.userId; // Assume userId is set by authentication middleware
    const { folderPath } = req.body;

    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: 'No files uploaded' });
    }

    const userFolderPath = path.join(process.env.FILE_STORAGE_PATH, `user_${userId}`, folderPath || '');
    if (!fs.existsSync(userFolderPath)) {
        return res.status(404).json({ message: 'Folder not found' });
    }

    req.files.forEach((file) => {
        const fileBaseName = path.basename(file.originalname, path.extname(file.originalname));
        const fileExt = path.extname(file.originalname);
        const fileDir = path.join(userFolderPath, fileBaseName);

        // Create a directory for the file if it doesn't exist
        if (!fs.existsSync(fileDir)) {
            fs.mkdirSync(fileDir);
        }

        // Get the new version number
        const version = fs.readdirSync(fileDir).length + 1;
        const versionedFileName = `${fileBaseName}_v${version}${fileExt}`;
        const filePath = path.join(fileDir, versionedFileName);

        // Move the uploaded file
        fs.renameSync(file.path, filePath);
    });

    res.status(201).json({ message: 'Files uploaded with version control' });
};


const listFileVersions = (req, res) => {
    const userId = req.userId;
    const { folderPath, fileName } = req.query;

    const fileDir = path.join(process.env.FILE_STORAGE_PATH, `user_${userId}`, folderPath, fileName);

    if (!fs.existsSync(fileDir) || !fs.lstatSync(fileDir).isDirectory()) {
        return res.status(404).json({ message: 'File not found' });
    }

    const versions = fs.readdirSync(fileDir);
    res.json({ versions });
};

const downloadFileVersion = (req, res) => {
    const userId = req.userId;
    const { folderPath, fileName, version } = req.query;

    const filePath = path.join(
        process.env.FILE_STORAGE_PATH,
        `user_${userId}`,
        folderPath,
        fileName,
        `${fileName}_v${version}`
    );

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: 'File version not found' });
    }

    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${path.basename(filePath)}"`);
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
};

const deleteFileVersion = (req, res) => {
    const userId = req.userId;
    const { folderPath, fileName, version } = req.body;

    const filePath = path.join(
        process.env.FILE_STORAGE_PATH,
        `user_${userId}`,
        folderPath,
        fileName,
        `${fileName}_v${version}`
    );

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: 'File version not found' });
    }

    fs.unlinkSync(filePath);
    res.status(200).json({ message: 'File version deleted successfully' });
};

module.exports = { listItems, createItem, deleteItem, uploadFileWithVersion, uploadFileWithVersion, listFileVersions, downloadFileVersion, deleteFileVersion };