const express = require("express");
const requireAuth = require("../middleware/requireAuth");
const {
  getInvestorList,
  storeInvestorInfo,
  getInvestorInfo,
  getInvestorInfoPublic
} = require("../controllers/investorInfoController");

const router = express.Router();

// Public route
router.get("/public/:userId", getInvestorInfoPublic);

// Private routes
router.get("/investor-list", getInvestorList);
router.post("/", requireAuth, storeInvestorInfo);
router.get("/:userId", requireAuth, getInvestorInfo);

module.exports = router;
