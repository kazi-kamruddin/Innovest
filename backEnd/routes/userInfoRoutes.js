const express = require("express");
const requireAuth = require("../middleware/requireAuth");
const { 
        getUserInfo,
        storeUserInfo
} = require("../controllers/userInfoController");

const router = express.Router();



router.get("/:userId", getUserInfo);

router.post("/:userId/edit-profile", requireAuth, storeUserInfo);

module.exports = router;
