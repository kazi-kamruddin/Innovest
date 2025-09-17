const db = require("../config/database");

// POST /investor-requests/create-new-request 
const createInvestorRequest = async (req, res) => {
  try {
    const { investorId, title, description, category, minInvestment, maxInvestment } = req.body;

    if (!investorId || !title || !description || !category) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (req.user.id !== investorId) {
      return res.status(403).json({ error: "Unauthorized: user ID mismatch" });
    }

    const [userRows] = await db.execute("SELECT id FROM users WHERE id = ?", [investorId]);
    if (userRows.length === 0) {
      return res.status(400).json({ error: "User does not exist" });
    }

    const [result] = await db.execute(
      `INSERT INTO investor_requests
      (investorId, title, description, category, minInvestment, maxInvestment)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [
        investorId,
        title,
        description,
        category,
        minInvestment || null,
        maxInvestment || null
      ]
    );

    const [newRequest] = await db.execute(
      "SELECT * FROM investor_requests WHERE id = ?",
      [result.insertId]
    );

    res.status(201).json(newRequest[0]);
  } catch (err) {
    console.error("Investor request creation failed:", err);
    res.status(500).json({ error: "Investor request creation failed" });
  }
};


const editRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, minInvestment, maxInvestment } = req.body;

    const [rows] = await db.execute("SELECT investorId FROM investor_requests WHERE id = ?", [id]);
    if (rows.length === 0) return res.status(404).json({ error: "Request not found" });

    if (rows[0].investorId !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized: You can only edit your own requests" });
    }

    await db.execute(
      `UPDATE investor_requests
       SET title = ?, description = ?, category = ?, minInvestment = ?, maxInvestment = ?, updatedAt = NOW()
       WHERE id = ?`,
      [title, description, category, minInvestment || null, maxInvestment || null, id]
    );

    const [updated] = await db.execute("SELECT * FROM investor_requests WHERE id = ?", [id]);
    res.json(updated[0]);
  } catch (err) {
    console.error("Error editing investor request:", err);
    res.status(500).json({ error: "Failed to update request" });
  }
};


const markRequestAsClosed = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id; 

  try {
    const [request] = await db.query(
      "SELECT * FROM investor_requests WHERE id = ? AND investorId = ?",
      [id, userId]
    );

    if (!request || request.length === 0) {
      return res.status(404).json({ error: "Request not found or not authorized" });
    }

    await db.query(
      "UPDATE investor_requests SET status = 'closed', updatedAt = NOW() WHERE id = ?",
      [id]
    );

    res.json({ message: "Request marked as closed successfully" });
  } catch (error) {
    console.error("Error closing request:", error);
    res.status(500).json({ error: "Failed to mark request as closed" });
  }
};


// GET /investor-request/my-closed
const getMyClosedRequests = async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await db.execute(
      `SELECT * FROM investor_requests 
       WHERE investorId = ? AND status = 'closed'
       ORDER BY updatedAt DESC`,
      [userId]
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching closed requests:", err);
    res.status(500).json({ error: "Failed to fetch closed requests" });
  }
};


const reopenRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const [check] = await db.execute(
      `SELECT * FROM investor_requests 
       WHERE id = ? AND investorId = (SELECT id FROM investor_info WHERE user_id = ?)`,
      [id, userId]
    );

    if (check.length === 0) {
      return res.status(403).json({ error: "Not authorized to reopen this request" });
    }

    await db.execute(
      `UPDATE investor_requests 
       SET status = 'open', updatedAt = NOW() 
       WHERE id = ?`,
      [id]
    );

    res.json({ message: "Request reopened successfully" });
  } catch (err) {
    console.error("Error reopening request:", err);
    res.status(500).json({ error: "Failed to reopen request" });
  }
};



// GET /investor-requests/:id
const getSingleRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.execute(
      `SELECT * FROM investor_requests WHERE id = ?`,
      [id]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Request not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error("Error fetching request:", err);
    res.status(500).json({ error: "Failed to fetch request" });
  }
};


const getPitchesForRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.execute(
      `SELECT p.*, u.name, u.email
       FROM pitches AS p
       LEFT JOIN users AS u ON p.user_id = u.id
       WHERE p.forRequestId = ?
       ORDER BY p.created_at DESC`,
      [id]
    );

    res.json(rows);
  } catch (err) {
    console.error("Error fetching pitches for request:", err);
    res.status(500).json({ error: "Failed to fetch pitches for this request" });
  }
};


// GET /investor-requests (list all requests)
const getAllInvestorRequests = async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT ir.id, ir.investorId, ir.title, ir.description, ir.category, 
              ir.minInvestment, ir.maxInvestment, ir.status, ir.createdAt, ir.updatedAt, 
              u.name, u.email
       FROM investor_requests AS ir
       LEFT JOIN users AS u ON ir.investorId = u.id
       WHERE ir.status = 'open'
       ORDER BY ir.createdAt DESC`
    );

    res.json(rows);
  } catch (err) {
    console.error("Error retrieving investor requests:", err);
    res.status(500).json({ error: "Error retrieving investor requests" });
  }
};



module.exports = {
  createInvestorRequest,
  editRequest,
  markRequestAsClosed,
  getMyClosedRequests,
  reopenRequest,
  getSingleRequest,
  getPitchesForRequest,
  getAllInvestorRequests
};
