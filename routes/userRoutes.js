const express = require("express");
const { createUser, loginUser } = require("../controllers/UserController.js");

const router = express.Router();

router.post("/createUser", createUser);
router.post("/login", loginUser);

module.exports = router;