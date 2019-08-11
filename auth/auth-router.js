const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");

const generateToken = require("../util/tokenHelpers").generateToken;
const restrict = require("../util/tokenHelpers").restrict;
const Users = require("../user/user-model");

router.post("/api/register", (req, res) => {
  const user = req.body;

  if (!user.username.trim() || !user.password.trim()) {
    res.status(400).json({
      errorMessage: "Please provide a username, and password."
    });
  } else {
    //generate hash from user's password
    const hash = bcrypt.hashSync(user.password, 10); //2 ^ n times

    //override use.password with hash
    user.password = hash;

    // Add user to database and send back response, with token info
    Users.add(user)
      .then(userId => {
        user.id = userId;
        //Create token with user info - Login the user when registering
        const token = generateToken(user);

        res.status(201).json({ user: user, userId: user.id, token: token });
      })
      .catch(error => {
        console.log(error);
        res.status(500).json({
          errorMessage: "Please provide a different username."
        });
      });
  }
});

router.post("/api/login", (req, res) => {
  let { username, password } = req.body;

  if (!username.trim() || !password.trim()) {
    res.status(400).json({
      errorMessage: "Please provide a username, and password."
    });
  } else {
    Users.findBy({ username }) // Check username exist in database
      .first()
      .then(user => {
        if (user && bcrypt.compareSync(password, user.password)) {
          // Check that password is same as in database
          const token = generateToken(user); // Create token because user is valid
          res.status(200).json({ user: user, userId: user.id, token }); // Send token to client
        } else {
          res.status(400).json({ errorMessage: "Invalid Credentials" });
        }
      })
      .catch(error => {
        res.status(500).json({
          errorMessage: "There was an error logging user"
        });
      });
  }
});

router.get("/api/user", restrict, (req, res) => {
  if (req.userInfo) {
    const { subject, user } = req.userInfo;
    if (subject && user) res.status(200).json({ userId: subject, user });
    else res.status(400).json({ errorMessage: "No current user. Please login." });
  } else res.status(400).json({ errorMessage: "No current user. Please login." });
});

router.put("/api/user/:id", restrict, async (req, res) => {
  const userId = req.params.id;
  const user = req.body;
  if (!user || Object.keys(user).length === 0) {
    res.status(400).json({
      errorMessage: "Please provide the information to be updated"
    });
  } else {
    try {
      //generate hash from user's password
      const hash = bcrypt.hashSync(user.password, 10); //2 ^ n times
      //override use.password with hash
      user.password = hash;

      const count = await Users.update(userId, user);
      if (count === 0) {
        res.status(400).json({
          count: count,
          message: "Please provide a valid user id and information"
        });
      } else {
        res.status(200).json({ count: count, userId, user: user });
      }
    } catch (err) {
      res.status(500).json({ errorMessage: "There was an error updating the user's information" });
    }
  }
});

module.exports = router;
