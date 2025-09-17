const express = require("express");
const requireAuth = require("../middleware/requireAuth");
const {
  createInvestorRequest,
  editRequest,
  markRequestAsClosed,
  getMyClosedRequests,
  reopenRequest,
  getSingleRequest,
  getAllInvestorRequests
} = require("../controllers/investorRequestController");

const router = express.Router();

router.get("/", requireAuth, getAllInvestorRequests);
router.get("/my-closed", requireAuth, getMyClosedRequests);
router.put("/:id/reopen", requireAuth, reopenRequest);
router.get("/:id", requireAuth, getSingleRequest);
router.put("/edit-request/:id", requireAuth, editRequest);
router.put("/:id/close", requireAuth, markRequestAsClosed);
router.post("/create-new-request", requireAuth, createInvestorRequest);

module.exports = router;
