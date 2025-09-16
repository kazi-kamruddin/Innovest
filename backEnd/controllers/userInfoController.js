const db = require("../config/database");


const getUserInfo = async (req, res) => {
  try {
    const { userId } = req.params;

    const [rows] = await db.execute(
      `SELECT u.id AS user_id, u.name, u.email, ui.location, 
              ui.areas_of_interest, ui.about
       FROM users u
       LEFT JOIN user_info ui ON u.id = ui.user_id
       WHERE u.id = ?`,
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      user: {
        id: rows[0].user_id,
        name: rows[0].name,
        email: rows[0].email,
      },
      location: rows[0].location || null,
      areas_of_interest: rows[0].areas_of_interest || null,
      about: rows[0].about || null,
    });
  } catch (err) {
    console.error("Error retrieving user info:", err);
    res.status(500).json({ error: "Error retrieving user info" });
  }
};


const storeUserInfo = async (req, res) => {
  try {
    const { userId } = req.params;
    const loggedInUserId = req.user.id;

    if (parseInt(userId) !== loggedInUserId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const { location, areas_of_interest, about } = req.body;

    // Check if user exists in `users` table
    const [userCheck] = await db.execute(
      "SELECT id FROM users WHERE id = ?",
      [userId]
    );
    if (userCheck.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if profile already exists in `user_info`
    const [profileCheck] = await db.execute(
      "SELECT id FROM user_info WHERE user_id = ?",
      [userId]
    );

    if (profileCheck.length > 0) {
      // Update existing profile
      await db.execute(
        `UPDATE user_info
         SET location = ?, areas_of_interest = ?, about = ?
         WHERE user_id = ?`,
        [
          location || null,
          areas_of_interest || null,
          about || null,
          userId
        ]
      );
    } else {
      // Insert new profile
      await db.execute(
        `INSERT INTO user_info (user_id, location, areas_of_interest, about)
         VALUES (?, ?, ?, ?)`,
        [
          userId,
          location || null,
          areas_of_interest || null,
          about || null
        ]
      );
    }

    res.status(201).json({ message: "Profile updated successfully" });
  } catch (err) {
    console.error("Error storing user info:", err);
    res.status(500).json({ error: "Error storing user info" });
  }
};



module.exports = {
  getUserInfo,
  storeUserInfo,
};
