const Sauce =     require('../models/Sauce');
const fs =        require('fs');                //import fs:  permet d'accéder au file-system. 

// créer une sauce
exports.createOneSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  const sauce = new Sauce({
    ...sauceObject,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  });
  sauce.save()
  .then( () => {
    res.status(201).json({message: 'sauce créée.'}); 
  })
  .catch((error) => {
    res.status(400).json({error})});
  };
  
// modifier une sauce    
exports.modifyOneSauce = (req, res, next) => {
  const sauceObject = req.file ? {
    ...JSON.parse(req.body.sauce),
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  } : { ...req.body };
  
  Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
    .then(() => res.status(200).json({ message: 'sauce modifiée.' }))
    .catch(error => res.status(400).json({error}));
    };
  
  //supprimer une sauce
  exports.deleteOneSauce = (req, res, next) => {
     Sauce.findOne({
       _id: req.params.id
     })
     .then(sauce => {
       const filename = sauce.imageUrl.split('/images/')[1];
       fs.unlink(`images/${filename}`, () => {
         Sauce.deleteOne({
           _id: req.params.id
         })
         .then(() => res.status(200).json({ message: "Sauce suprimée !"}))
         .catch((error) => res.status(400).json({error}));
       })
       .catch((error) => res.status(500).json({error}));
     });
};
  
  
//accéder à une sauce
exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({_id: req.params.id})
    .then((sauce) => { res.status(200).json(sauce);})
    .catch((error) => {res.status(404).json({error});
  });
};

//accéder à toutes les sauces
exports.getAllSauce = (req, res, next) => {
  console.log('Récuperation de sauce');
  Sauce.find()
  .then((sauces) => {res.status(200).json(sauces);})
  .catch((error) => {res.status(400).json({error});
  });
};

// fonction d'évaluation des sauces (like ou dislike)
// 3 conditions possible car voici ce qu'on reçoit du frontend, la valeur du like est soit: 0, 1 ou -1 (req.body.like)
// un switch statement est parfaitement adapté.

exports.rateOneSauce = (req, res, next) => {
  switch (req.body.like) {
    case 0:                                                   //cas: req.body.like = 0
      Sauce.findOne({ _id: req.params.id })
        .then((sauce) => {
          if (sauce.usersLiked.find( user => user === req.body.userId)) {  // on cherche si l'utilisateur est déjà dans le tableau usersLiked
            Sauce.updateOne({ _id: req.params.id }, {         // si oui, on va mettre à jour la sauce avec le _id présent dans la requête
              $inc: { likes: -1 },                            // on décrémente la valeur des likes de 1 (soit -1)
              $pull: { usersLiked: req.body.userId }          // on retire l'utilisateur du tableau.
            })
              .then(() => { res.status(200).json({ message: "vote enregistré."}); }) //code 201: created
              .catch((error) => { res.status(400).json({error}); });

          } 
          if (sauce.usersDisliked.find(user => user === req.body.userId)) {  //mêmes principes que précédemment avec le tableau usersDisliked
            Sauce.updateOne({ _id: req.params.id }, {
              $inc: { dislikes: -1 },
              $pull: { usersDisliked: req.body.userId }
            })
              .then(() => { res.status(200).json({ message: "vote enregistré." }); })
              .catch((error) => { res.status(400).json({error}); });
          }
        })
        .catch((error) => { res.status(404).json({error}); });
      break;
    
    case 1:                                                 //cas: req.body.like = 1
      Sauce.updateOne({ _id: req.params.id }, {             // on recherche la sauce avec le _id présent dans la requête
        $inc: { likes: 1 },                                 // incrémentaton de la valeur de likes par 1.
        $push: { usersLiked: req.body.userId }              // on ajoute l'utilisateur dans le array usersLiked.
      })
        .then(() => { res.status(200).json({ message: "vote enregistré." }); }) //code 201: created
        .catch((error) => { res.status(400).json({ error }); }); //code 400: bad request
      break;
    
    case -1:                                                  //cas: req.body.like = 1
      Sauce.updateOne({ _id: req.params.id }, {               // on recherche la sauce avec le _id présent dans la requête
        $inc: { dislikes: 1 },                                // on décremente de 1 la valeur de dislikes.
        $push: { usersDisliked: req.body.userId }             // on rajoute l'utilisateur à l'array usersDiliked.
      })
        .then(() => { res.status(200).json({ message: "vote enregistré." }); }) // code 201: created
        .catch((error) => { res.status(400).json({ error }); }); // code 400: bad request
      break;
    default:
      console.error("bad request");
  }
};