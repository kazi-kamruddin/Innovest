const express = require("express");
const requireAuth = require("../middleware/requireAuth");
const {
  createInvestorRequest,
  editRequest,
  getSingleRequest,
  getAllInvestorRequests
} = require("../controllers/investorRequestController");

const router = express.Router();

// List all investor requests
router.get("/", requireAuth, getAllInvestorRequests);

router.get("/:id", requireAuth, getSingleRequest);

router.put("/edit-request/:id", requireAuth, editRequest);

// Get a single investor request by ID
//router.get("/:id", requireAuth, getInvestorRequest);

// Create a new investor request
router.post("/create-new-request", requireAuth, createInvestorRequest);

module.exports = router;
