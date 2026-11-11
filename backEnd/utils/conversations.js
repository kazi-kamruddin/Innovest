async function findOrCreateConversation(executor, senderId, targetId) {
  const userOne = Math.min(senderId, targetId);
  const userTwo = Math.max(senderId, targetId);
  const lookupSql = `SELECT * FROM conversations
     WHERE (user_one_id = ? AND user_two_id = ?)
        OR (user_one_id = ? AND user_two_id = ?)`;
  const lookupParams = [userOne, userTwo, userTwo, userOne];

  const [existing] = await executor.execute(lookupSql, lookupParams);
  if (existing.length > 0) {
    return { conversation: existing[0], created: false };
  }

  try {
    const [result] = await executor.execute(
      "INSERT INTO conversations (user_one_id, user_two_id, created_at) VALUES (?, ?, NOW())",
      [userOne, userTwo]
    );
    return {
      conversation: {
        id: result.insertId,
        user_one_id: userOne,
        user_two_id: userTwo,
      },
      created: true,
    };
  } catch (error) {
    if (error?.code === 'ER_DUP_ENTRY') {
      const [raced] = await executor.execute(lookupSql, lookupParams);
      if (raced.length > 0) {
        return { conversation: raced[0], created: false };
      }
    }
    throw error;
  }
}

module.exports = { findOrCreateConversation };
