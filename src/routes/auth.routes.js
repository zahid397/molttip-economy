const express = require("express");
const { getNonce, verifySignature } = require("../controllers/auth.controller");

const router = express.Router();

router.post("/nonce", getNonce);
router.post("/verify", verifySignature);

module.exports = router;
