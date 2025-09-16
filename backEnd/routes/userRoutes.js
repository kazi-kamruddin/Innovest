const express = require("express");
const {
  loginUser,
  signUpUser,
} = require("../controllers/userController");

const router = express.Router();

// login
router.post("/login", loginUser);

// signUp
router.post("/register", signUpUser);

//token validation
//router.post("/validate-token", validateJwtToken);

module.exports = router;