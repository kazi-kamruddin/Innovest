const db = require("../config/database");

// POST /investor-info (create or update)
const storeInvestorInfo = async (req, res) => {
  try {
    const {
      user_id,
      fields_of_interest,
      investment_range_min,
      investment_range_max,
      preferred_industries
    } = req.body;

    if (!user_id) {
      return res.status(400).json({ error: "user_id is required" });
    }

    const [userRows] = await db.execute("SELECT id FROM users WHERE id = ?", [user_id]);
    if (userRows.length === 0) {
      return res.status(400).json({ error: "User does not exist" });
    }

    if (req.user.id !== user_id) {
      return res.status(403).json({ error: "Unauthorized: user ID mismatch" });
    }

    const [existing] = await db.execute(
      "SELECT id FROM investor_info WHERE user_id = ?",
      [user_id]
    );

    if (existing.length > 0) {
      await db.execute(
        `UPDATE investor_info 
         SET fields_of_interest = ?, investment_range_min = ?, investment_range_max = ?, preferred_industries = ? 
         WHERE user_id = ?`,
        [
          fields_of_interest || null,
          investment_range_min !== undefined ? parseFloat(investment_range_min) : null,
          investment_range_max !== undefined ? parseFloat(investment_range_max) : null,
          preferred_industries || null,
          user_id
        ]
      );
    } else {
      await db.execute(
        `INSERT INTO investor_info
        (user_id, fields_of_interest, investment_range_min, investment_range_max, preferred_industries) 
        VALUES (?, ?, ?, ?, ?)`,
        [
          user_id,
          fields_of_interest || null,
          investment_range_min !== undefined ? parseFloat(investment_range_min) : null,
          investment_range_max !== undefined ? parseFloat(investment_range_max) : null,
          preferred_industries || null
        ]
      );
    }

    const [updated] = await db.execute(
      "SELECT * FROM investor_info WHERE user_id = ?",
      [user_id]
    );

    res.status(201).json(updated[0]);
  } catch (err) {
    console.error("Investor info creation failed:", err);
    res.status(500).json({ error: "Investor info creation failed" });
  }
};


// GET /investor-info/:userId
const getInvestorInfo = async (req, res) => {
  try {
    const { userId } = req.params;

    const loggedInUserId = req.user.id; 

    if (parseInt(userId) !== loggedInUserId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const [rows] = await db.execute(
      "SELECT * FROM investor_info WHERE user_id = ?",
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Investor info not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("Error retrieving investor info:", err);
    res.status(500).json({ error: "Error retrieving investor info" });
  }
};



// GET /investor-list
const getInvestorList = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT investor_info.*, users.name, users.email
      FROM investor_info
      JOIN users ON investor_info.user_id = users.id
    `);

    if (rows.length === 0) {
      return res.status(404).json({ message: "No investor information found" });
    }

    res.json(rows);
  } catch (err) {
    console.error("Error retrieving investor list:", err);
    res.status(500).json({ error: "Error retrieving investor list" });
  }
};

module.exports = {
  storeInvestorInfo,
  getInvestorInfo,
  getInvestorList
};
