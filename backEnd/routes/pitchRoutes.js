const express = require("express");
const requireAuth = require("../middleware/requireAuth");
const {
  getAllPitches,
  getPitchById,
  getUserPitches,
  createPitch,
  updatePitch,
  deletePitch
} = require("../controllers/pitchController");

const router = express.Router();



router.get("/", getAllPitches);
router.get("/:id", getPitchById);

router.get("/users/:id/pitches", requireAuth, getUserPitches);
router.post("/", requireAuth, createPitch);
router.put("/users/:userId/pitches/:pitchId", requireAuth, updatePitch);
router.delete("/users/:userId/pitches/:pitchId", requireAuth, deletePitch);

module.exports = router;
