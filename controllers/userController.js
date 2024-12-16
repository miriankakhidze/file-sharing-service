const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const userStoragePath = process.env.USER_STORAGE_PATH;

const createUser = (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }

    const userId = uuidv4();
    const userFile = path.join(userStoragePath, `user_${userId}.json`);

    if (!fs.existsSync(userStoragePath)) {
        fs.mkdirSync(userStoragePath, { recursive: true });
    }

    const userData = { id: userId, username, password };
    fs.writeFileSync(userFile, JSON.stringify(userData, null, 2));

    res.status(201).json({ message: 'User created successfully', userId });
};

const loginUser = (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }

    const files = fs.readdirSync(userStoragePath);

    for (const file of files) {
        const userFile = path.join(userStoragePath, file);
        const userData = JSON.parse(fs.readFileSync(userFile));

        if (userData.username === username && userData.password === password) {
            const token = jwt.sign({ id: userData.id, username }, process.env.JWT_SECRET, {
                expiresIn: '1h',
            });
            return res.json({ message: 'Login successful', token });
        }
    }

    res.status(401).json({ message: 'Invalid username or password' });
};

const deleteUser = (req, res) => {
    const userId = req.userId;

    const userFilePath = path.join(userStoragePath, `user_${userId}.json`);
    const userFolderPath = path.join(process.env.FILE_STORAGE_PATH, `user_${userId}`);

    // Check if user exists
    if (!fs.existsSync(userFilePath)) {
        return res.status(404).json({ message: 'User not found' });
    }

    // Delete user profile
    fs.unlinkSync(userFilePath);

    // Delete user folder and contents
    if (fs.existsSync(userFolderPath)) {
        fs.rmSync(userFolderPath, { recursive: true, force: true });
    }

    // Cleanup shared links
    // for (const [linkId, linkData] of sharedLinks.entries()) {
    //     if (linkData.filePath.startsWith(userFolderPath)) {
    //         sharedLinks.delete(linkId);
    //     }
    // }

    res.status(200).json({ message: 'User account and associated data deleted successfully' });
};

module.exports = { createUser, loginUser, deleteUser };