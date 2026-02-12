const express = require("express");
const {
  registerAgent,
  getAgent,
  getAllAgents,
} = require("../controllers/agent.controller");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.post("/", protect, registerAgent);     // cleaner than /register
router.get("/", getAllAgents);
router.get("/:id", getAgent);

module.exports = router;
