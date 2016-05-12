const express = require('express');
const router = express.Router();
const knex = require('../db');
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');

router.get('/me', function(req, res, next) {

  if (req.headers.authorization) {
    const token = req.headers.authorization.split(' ')[1];

    // IF it was expired - verify would actually throw an exception
    // we'd have to catch in a try/catch
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // payload is {id: 56}
    knex('users').where({id: payload.id}).first().then(function (user) {
      if (user) {
        res.json({id: user.id, name: user.name})
      } else {
        res.status(403).json({
          error: "Invalid ID"
        })
      }
    })
  } else {
      res.status(403).json({
        error: "No token"
      })
    }
  })

router.post('/signup', function(req, res, next) {
  const errors = []

  if (!req.body.email || !req.body.email.trim()) errors.push("Email can't be blank");
  if (!req.body.name || !req.body.name.trim()) errors.push("Name can't be blank");
  if (!req.body.password || !req.body.password.trim()) errors.push("Password can't be blank");

  if (errors.length) {
    res.status(422).json({
      errors: errors
    })
  } else {
    knex('users')
      .whereRaw('lower(email) = ?', req.body.email.toLowerCase())
      .count()
      .first()
      .then(function (result) {
         if (result.count === "0") {
           const saltRounds = 4;
           const passwordHash = bcrypt.hashSync(req.body.password, saltRounds);

           knex('users')
            .insert({
              email: req.body.email,
              name: req.body.name,
              password_hash: passwordHash
            })
            .returning('*')
            .then(function (users) {
              const user = users[0];
              const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET );
              res.json({
                id: user.id,
                email: user.email,
                name: user.name,
                token: token
              })
            })


         } else {
          res.status(422).json({
            errors: ["Email has already been taken"]
          })
        }
      })
  }
  // require knex
  // √ check email, name, and password are all there
  //  if not, return an error
  // √ check to see if the email already exists in the db
  //  if so, return an error
  // if we're OK
  //  hash password
  //  knex insert stuff from req.body
  //  create a token
  //  send back id, email, name, token
});

module.exports = router;
