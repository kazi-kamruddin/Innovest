const express = require("express");
const requireAuth = require("../middleware/requireAuth");
const {
  getInvestorList,
  storeInvestorInfo,
  getInvestorInfo
} = require("../controllers/investorInfoController");

const router = express.Router();



router.get("/investor-list", getInvestorList);

router.post("/", requireAuth, storeInvestorInfo);
router.get("/:userId", requireAuth, getInvestorInfo);

module.exports = router;
