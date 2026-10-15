const express = require("express");
const requireAuth = require("../middleware/requireAuth");
const optionalAuth = require("../middleware/optionalAuth");
const {
  getAllPitches,
  getPitchById,
  getUserPitches,
  createPitch,
  createPitchInResponse,
  updatePitch,
  deletePitch
} = require("../controllers/pitchController");

const router = express.Router();
for (const name of ['id', 'userId', 'pitchId', 'requestId']) router.param(name, require('../middleware/validateId'));



router.get("/", getAllPitches);
router.get("/:id", optionalAuth, getPitchById);

router.get("/users/:id/pitches", requireAuth, getUserPitches);
router.post("/", requireAuth, createPitch);
router.post("/in-response/:requestId", requireAuth, createPitchInResponse);
router.put("/users/:userId/pitches/:pitchId", requireAuth, updatePitch);
router.delete("/users/:userId/pitches/:pitchId", requireAuth, deletePitch);

module.exports = router;
