async function rollbackQuietly(connection) {
  if (!connection) return;
  try {
    await connection.rollback();
  } catch (error) {
    // A dropped database connection cannot roll back; preserve the original
    // handler's error response instead of rejecting its Express 4 promise.
    console.error('Transaction rollback failed:', error.code || error.message);
  }
}

module.exports = { rollbackQuietly };
