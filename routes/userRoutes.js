const express = require('express');
const { createUser, loginUser, deleteUser } = require('../controllers/userController');
const authenticate = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/create', createUser);
router.post('/login', loginUser);
router.post('/unregister', authenticate, deleteUser);

module.exports = router;