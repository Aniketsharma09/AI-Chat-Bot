const express = require('express');
const router = express.Router();
const {registerUserController, loginUserController, getUserController} = require('../controllers/auth.controllers');

router.post('/register', registerUserController);

router.post('/login', loginUserController);

router.get('/user',getUserController);
module.exports = router