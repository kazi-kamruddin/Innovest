const db = require("../config/database");
const { parseAmountRange } = require("../utils/amounts");
const { notifyBestEffort } = require('../utils/notifications');

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
    if (Number(req.params.id) !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const [userRows] = await db.execute("SELECT id FROM users WHERE id = ?", [
      req.params.id,
    ]);

    if (userRows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const [pitches] = await db.execute(
      `SELECT p.*, COALESCE(prs.status, 'submitted') AS response_status
       FROM pitches p LEFT JOIN pitch_response_states prs ON prs.pitch_id = p.id
       WHERE p.user_id = ?`,
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
    } = req.body || {};

    if (typeof title !== "string" || !title.trim() || typeof industry !== "string" || !industry.trim()) {
      return res
        .status(400)
        .json({ error: "title and industry are required" });
    }

    if (user_id != null && Number(user_id) !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const amounts = parseAmountRange(minimum_investment, total_raising_amount);
    if (!amounts) {
      return res.status(400).json({ error: "Funding amounts must be non-negative numbers, with minimum no greater than total" });
    }

    const [result] = await db.execute(
      `INSERT INTO pitches
        (user_id, title, company_location, country, cell_number, industry, stage, ideal_investor_role,
        total_raising_amount, minimum_investment, the_business, the_market, progress, objective) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        title,
        company_location || null,
        country || null,
        cell_number || null,
        industry,
        stage || null,
        ideal_investor_role || null,
        amounts.max,
        amounts.min,
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


const createPitchInResponse = async (req, res) => {
  try {
    const { requestId } = req.params;
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
    } = req.body || {};

    if (typeof title !== "string" || !title.trim() || typeof industry !== "string" || !industry.trim()) {
      return res
        .status(400)
        .json({ error: "title and industry are required" });
    }

    if (user_id != null && Number(user_id) !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const amounts = parseAmountRange(minimum_investment, total_raising_amount);
    if (!amounts) {
      return res.status(400).json({ error: "Funding amounts must be non-negative numbers, with minimum no greater than total" });
    }

    const [requests] = await db.execute(
      "SELECT investorId, status FROM investor_requests WHERE id = ?",
      [requestId]
    );
    if (requests.length === 0) {
      return res.status(404).json({ error: "Investor request not found" });
    }
    if (requests[0].status !== "open") {
      return res.status(400).json({ error: "Investor request is closed" });
    }
    if (Number(requests[0].investorId) === Number(req.user.id)) {
      return res.status(403).json({ error: "Cannot respond to your own request" });
    }

    const [result] = await db.execute(
      `INSERT INTO pitches 
        (user_id, title, company_location, country, cell_number, industry, stage, ideal_investor_role,
         total_raising_amount, minimum_investment, the_business, the_market, progress, objective, forRequestId) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        title,
        company_location || null,
        country || null,
        cell_number || null,
        industry,
        stage || null,
        ideal_investor_role || null,
        amounts.max,
        amounts.min,
        the_business || null,
        the_market || null,
        progress || null,
        objective || null,
        requestId, 
      ]
    );

    const [pitchRows] = await db.execute(
      "SELECT * FROM pitches WHERE id = ?",
      [result.insertId]
    );

    await notifyBestEffort({
      userId: requests[0].investorId,
      actorId: req.user.id,
      kind: 'pitch_response',
      text: 'A new pitch was submitted to your investor request.',
      targetPath: `/investor-request/${requestId}/response-pitches`,
      io: req.app?.get('io'),
    });
    res.status(201).json(pitchRows[0]);
  } catch (err) {
    console.error("Pitch-in-response creation failed:", err);
    res.status(500).json({ error: "Pitch creation failed" });
  }
};



const updatePitch = async (req, res) => {
  try {
    const { userId, pitchId } = req.params;

    if (Number(userId) !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

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
    } = req.body || {};

    if (typeof title !== "string" || !title.trim() || typeof industry !== "string" || !industry.trim()) {
      return res.status(400).json({ error: "title and industry are required" });
    }
    const amounts = parseAmountRange(minimum_investment, total_raising_amount);
    if (!amounts) {
      return res.status(400).json({ error: "Funding amounts must be non-negative numbers, with minimum no greater than total" });
    }

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
        amounts.max,
        amounts.min,
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

    if (Number(userId) !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

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
  createPitchInResponse,
  updatePitch,
  deletePitch,
};
