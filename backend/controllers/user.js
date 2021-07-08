
const bcrypt = require('bcrypt');   // pour hasher le mot de passe                                                 
const jwt = require('jsonwebtoken');
const User = require('../models/User');

function maskator(sentence) {
  if (typeof sentence === "string") {
    let headMail = sentence.slice(0,1);
    let bodyMail = sentence.slice(1, sentence.length-4);
    let bottomMail = sentence.slice(sentence.length-4, sentence.length);
    let final = [];
    var masked = bodyMail.split('');
    var maskedMail = [];
    for(let i in masked) {
      masked[i] = '*';
      maskedMail += masked[i];  
    }
    final += headMail + maskedMail + bottomMail
    return final;
  }
  console.log(sentence + " is not a mail");
  return false
}

// inscription d'un utilisateur
exports.signup = (req, res, next) => {
  bcrypt.hash(req.body.password, 10)
  .then(hash => {
    const user = new User ({
      email: maskator(req.body.email),
      password: hash
    });
    console.log(user);
    user.save()
      .then(() => {
        res.status(201).json({message: 'utilisateur crée !'})
      })
      .catch(error => res.status(400).json({error}));
  })
  .catch(error => res.status(500).json({error}));
};

// connexion de l'utilisateur
exports.login = (req, res, next) => {
  User.findOne({ email: maskator(req.body.email) })
    .then(user => {
      if (!user) {
        return res.status(401).json({ error: 'Utilisateur non trouvé !' });
      }
      bcrypt.compare(req.body.password, user.password)
        .then(valid => {
          if (!valid) {
            return res.status(401).json({ error: 'Mot de passe incorrect !' });
          }
          res.status(200).json({
            userId: user._id,
            token: jwt.sign(
              { userId: user._id },
              'RANDOM_TOKEN_SECRET',
              { expiresIn: '24h' }
            )
          });
        })
        .catch(error => res.status(500).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
};
