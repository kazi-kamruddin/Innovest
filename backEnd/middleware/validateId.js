module.exports = function validateId(req, res, next, value, name) {
  if (!/^[1-9]\d*$/.test(value) || !Number.isSafeInteger(Number(value))) {
    return res.status(400).json({ error: `Invalid ${name}` });
  }
  next();
};
