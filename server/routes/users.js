const express = require("express");
const { createUser, loginUser, verifyToken, getUser, refreshToken } = require("../controllers/users");
const router = express.Router();

router.post("/login", loginUser);
router.post("/register", createUser);
router.get("/users", verifyToken, getUser);
router.get("/refresh", refreshToken, verifyToken, getUser);

module.exports = router;