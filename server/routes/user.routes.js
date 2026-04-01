const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");


router.post("/login", userController.loginUser);

// token = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzc0MzMyMjI1LCJleHAiOjE3NzQ0MTg2MjV9.KxNXBEkASlATt9dJsYI3Wvwk3tRBTWKMMmqOdJuKnlI

module.exports = router;
