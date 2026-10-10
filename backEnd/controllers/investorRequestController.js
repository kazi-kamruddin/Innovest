const db = require("../config/database");
const { parseAmountRange } = require("../utils/amounts");
const { createNotification, notifyBestEffort } = require("../utils/notifications");

async function notifyResponders(req, requestId, status) {
  const [responders] = await db.execute('SELECT DISTINCT user_id FROM pitches WHERE forRequestId = ?', [requestId]);
  await Promise.all(responders.map(({ user_id: userId }) => notifyBestEffort({
    userId,
    actorId: req.user.id,
    kind: 'request_status',
    text: `An investor request you answered is now ${status}.`,
    targetPath: '/fundraise-dashboard',
    io: req.app?.get('io'),
  })));
}

// POST /investor-requests/create-new-request 
const createInvestorRequest = async (req, res) => {
  try {
    const { investorId, title, description, category, minInvestment, maxInvestment } = req.body || {};

    if (!investorId || ![title, description, category].every((value) => typeof value === "string" && value.trim())) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (req.user.id !== investorId) {
      return res.status(403).json({ error: "Unauthorized: user ID mismatch" });
    }

    const amounts = parseAmountRange(minInvestment, maxInvestment);
    if (!amounts) {
      return res.status(400).json({ error: "Investment amounts must be non-negative numbers, with minimum no greater than maximum" });
    }

    const [investorRows] = await db.execute("SELECT user_id FROM investor_info WHERE user_id = ?", [req.user.id]);
    if (investorRows.length === 0) {
      return res.status(403).json({ error: "Create an investor profile before posting a request" });
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
        amounts.min,
        amounts.max
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
    const { title, description, category, minInvestment, maxInvestment } = req.body || {};

    const [rows] = await db.execute("SELECT investorId FROM investor_requests WHERE id = ?", [id]);
    if (rows.length === 0) return res.status(404).json({ error: "Request not found" });

    if (rows[0].investorId !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized: You can only edit your own requests" });
    }

    if (![title, description, category].every((value) => typeof value === "string" && value.trim())) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const amounts = parseAmountRange(minInvestment, maxInvestment);
    if (!amounts) {
      return res.status(400).json({ error: "Investment amounts must be non-negative numbers, with minimum no greater than maximum" });
    }

    await db.execute(
      `UPDATE investor_requests
       SET title = ?, description = ?, category = ?, minInvestment = ?, maxInvestment = ?, updatedAt = NOW()
       WHERE id = ?`,
      [title, description, category, amounts.min, amounts.max, id]
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
    if (request[0].status === 'closed') {
      return res.json({ message: 'Request is already closed' });
    }

    await db.query(
      "UPDATE investor_requests SET status = 'closed', updatedAt = NOW() WHERE id = ?",
      [id]
    );

    try { await notifyResponders(req, id, 'closed'); } catch (error) { console.error('Request status notification failed:', error); }

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
       WHERE id = ? AND investorId = ? AND status = 'closed'`,
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

    try { await notifyResponders(req, id, 'open'); } catch (error) { console.error('Request status notification failed:', error); }

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
    const [requests] = await db.execute('SELECT investorId FROM investor_requests WHERE id = ?', [id]);
    if (!requests.length) return res.status(404).json({ error: 'Request not found' });
    if (Number(requests[0].investorId) !== Number(req.user.id)) {
      return res.status(403).json({ error: 'Only the request owner can view responses' });
    }
    const [rows] = await db.execute(
      `SELECT p.*, u.name, u.email, COALESCE(prs.status, 'submitted') AS response_status
       FROM pitches AS p
       LEFT JOIN users AS u ON p.user_id = u.id
       LEFT JOIN pitch_response_states AS prs ON prs.pitch_id = p.id
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

const updateResponseStatus = async (req, res) => {
  const status = req.body?.status;
  if (!['submitted', 'under_review', 'interested', 'declined'].includes(status)) {
    return res.status(400).json({ error: 'Invalid response status' });
  }

  const requestId = Number(req.params.id);
  const pitchId = Number(req.params.pitchId);
  if (![requestId, pitchId].every((id) => Number.isSafeInteger(id) && id > 0)) {
    return res.status(400).json({ error: 'Invalid request or pitch' });
  }

  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();
    const [rows] = await connection.execute(
      `SELECT p.user_id, ir.investorId
       FROM pitches p
       JOIN investor_requests ir ON ir.id = p.forRequestId
       WHERE p.id = ? AND ir.id = ? FOR UPDATE`,
      [pitchId, requestId]
    );
    if (!rows.length) {
      await connection.rollback();
      return res.status(404).json({ error: 'Response not found for this request' });
    }
    if (Number(rows[0].investorId) !== Number(req.user.id)) {
      await connection.rollback();
      return res.status(403).json({ error: 'Only the request owner can update responses' });
    }
    const [stateRows] = await connection.execute(
      'SELECT status FROM pitch_response_states WHERE pitch_id = ?',
      [pitchId]
    );
    const currentStatus = stateRows[0]?.status || 'submitted';
    if (currentStatus === status) {
      await connection.commit();
      return res.json({ status, changed: false });
    }
    await connection.execute(
      `INSERT INTO pitch_response_states (pitch_id, status) VALUES (?, ?)
       ON DUPLICATE KEY UPDATE status = VALUES(status)`,
      [pitchId, status]
    );
    const labels = { submitted: 'Submitted', under_review: 'Under review', interested: 'Interested', declined: 'Declined' };
    const notification = await createNotification({
      userId: rows[0].user_id,
      actorId: req.user.id,
      kind: 'response_status',
      text: `Your pitch response is now ${labels[status].toLowerCase()}.`,
      targetPath: `/fundraise-dashboard`,
      executor: connection,
    });
    await connection.commit();
    if (notification) req.app?.get('io')?.to(`user:${rows[0].user_id}`).emit('notification', notification);
    res.json({ status, changed: true });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Failed to update response status:', error);
    res.status(500).json({ error: 'Failed to update response status' });
  } finally {
    connection?.release();
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
  updateResponseStatus,
  getAllInvestorRequests
};
