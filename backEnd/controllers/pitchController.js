const db = require("../config/database");

const getAllPitches = async (req, res) => {
  try {
    let sql = `
      SELECT pitches.*, users.id AS user_id, users.name AS user_name, users.email AS user_email
      FROM pitches
      JOIN users ON pitches.user_id = users.id
      WHERE 1=1
    `;
    const params = [];

    if (req.query.industry) {
      sql += " AND pitches.industry LIKE ?";
      params.push(`%${req.query.industry}%`);
    }
    if (req.query.stage) {
      sql += " AND pitches.stage LIKE ?";
      params.push(`%${req.query.stage}%`);
    }
    if (req.query.country) {
      sql += " AND pitches.country LIKE ?";
      params.push(`%${req.query.country}%`);
    }

    const [rows] = await db.execute(sql, params);
    res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch pitches" });
  }
};


const getPitchById = async (req, res) => {
  try {
    const [rows] = await db.execute(
      `
      SELECT pitches.*, users.id AS user_id, users.name AS user_name, users.email AS user_email
      FROM pitches
      JOIN users ON pitches.user_id = users.id
      WHERE pitches.id = ?
      `,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Pitch not found" });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch pitch" });
  }
};


//-----------------------------------------------------------------------------------------


const getUserPitches = async (req, res) => {
  try {
    const [userRows] = await db.execute("SELECT * FROM users WHERE id = ?", [
      req.params.id,
    ]);

    if (userRows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const [pitches] = await db.execute(
      "SELECT * FROM pitches WHERE user_id = ?",
      [req.params.id]
    );

    res.status(200).json(pitches);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch user pitches" });
  }
};


const createPitch = async (req, res) => {
  try {
    const {
      user_id,
      title,
      company_location,
      country,
      cell_number,
      industry,
      stage,
      ideal_investor_role,
      total_raising_amount,
      minimum_investment,
      the_business,
      the_market,
      progress,
      objective,
    } = req.body;

    if (!user_id || !title || !industry) {
      return res
        .status(400)
        .json({ error: "user_id, title, and industry are required" });
    }

    const [result] = await db.execute(
      `INSERT INTO pitches 
        (user_id, title, company_location, country, cell_number, industry, stage, ideal_investor_role, 
        total_raising_amount, minimum_investment, the_business, the_market, progress, objective) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user_id,
        title,
        company_location || null,
        country || null,
        cell_number || null,
        industry,
        stage || null,
        ideal_investor_role || null,
        total_raising_amount || null,
        minimum_investment || null,
        the_business || null,
        the_market || null,
        progress || null,
        objective || null,
      ]
    );

    const [pitchRows] = await db.execute(
      "SELECT * FROM pitches WHERE id = ?",
      [result.insertId]
    );

    res.status(201).json(pitchRows[0]);
  } catch (err) {
    console.error("Pitch creation failed:", err);
    res.status(500).json({ error: "Pitch creation failed" });
  }
};


const updatePitch = async (req, res) => {
  try {
    const { userId, pitchId } = req.params;

    const [pitchRows] = await db.execute(
      "SELECT * FROM pitches WHERE id = ?",
      [pitchId]
    );

    if (pitchRows.length === 0) {
      return res.status(404).json({ error: "Pitch not found" });
    }

    if (pitchRows[0].user_id !== parseInt(userId)) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const {
      title,
      company_location,
      country,
      cell_number,
      industry,
      stage,
      ideal_investor_role,
      total_raising_amount,
      minimum_investment,
      the_business,
      the_market,
      progress,
      objective,
    } = req.body;

    await db.execute(
      `UPDATE pitches 
       SET title=?, company_location=?, country=?, cell_number=?, industry=?, stage=?, ideal_investor_role=?, 
           total_raising_amount=?, minimum_investment=?, the_business=?, the_market=?, progress=?, objective=?
       WHERE id=?`,
      [
        title,
        company_location || null,
        country || null,
        cell_number || null,
        industry,
        stage || null,
        ideal_investor_role || null,
        total_raising_amount || null,
        minimum_investment || null,
        the_business || null,
        the_market || null,
        progress || null,
        objective || null,
        pitchId,
      ]
    );

    const [updatedRows] = await db.execute(
      "SELECT * FROM pitches WHERE id = ?",
      [pitchId]
    );

    res.status(200).json({
      message: "Pitch updated successfully",
      pitch: updatedRows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update pitch" });
  }
};


const deletePitch = async (req, res) => {
  try {
    const { userId, pitchId } = req.params;

    const [pitchRows] = await db.execute(
      "SELECT * FROM pitches WHERE id = ?",
      [pitchId]
    );

    if (pitchRows.length === 0) {
      return res.status(404).json({ error: "Pitch not found" });
    }

    if (pitchRows[0].user_id !== parseInt(userId)) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await db.execute("DELETE FROM pitches WHERE id = ?", [pitchId]);

    res.json({ message: "Pitch deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete pitch" });
  }
};



module.exports = {
  getAllPitches,
  getPitchById,
  getUserPitches,
  createPitch,
  updatePitch,
  deletePitch,
};
