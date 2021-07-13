
const express = require('express');
const bodyParser = require('body-parser');
const userCtrl = require('../controllers/user');
const router = express.Router();
const { body, validationResult } = require('express-validator');  // on importe le package express-validator


// la route pour se connecter, on précise l'uri (en utilisant les controllers dans le dossier contollers)
router.post('/signup', [
    body('email').isEmail(),                // ici, on utilise express-validator et on précise ce qu'on veut []
    body('password').isLength({ min: 5 })
],                            // on vérifie avec la fonction créée plus haut si on a bien ce qu'on a demandé
    userCtrl.signup);

router.post('/login', [
    body('email').isEmail(),
    body('password').isLength({ min: 5 })
],
    userCtrl.login);

module.exports = router;