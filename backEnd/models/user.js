const db = require("../config/db");
const bcrypt = require("bcrypt");
const validator = require("validator");

class User {
  // Login
  static async login(email, password) {
    if (!email || !password) {
      throw new Error("need em both");
    }

    const [rows] = await db.execute("SELECT * FROM users WHERE email = ?", [email]);
    if (rows.length === 0) {
      throw new Error("incorrect email");
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      throw new Error("incorrect password");
    }

    delete user.password; 
    return user;
  }

  // Sign Up
  static async signUp(email, password) {
    if (!email && !password) {
      throw new Error("need em both");
    }
    if (!email) {
      throw new Error("enter email");
    }
    if (!password) {
      throw new Error("enter password");
    }
    if (!validator.isEmail(email)) {
      throw new Error("invalid email");
    }
    if (!validator.isStrongPassword(password)) {
      throw new Error("weak password");
    }

    const [exists] = await db.execute("SELECT id FROM users WHERE email = ?", [email]);
    if (exists.length > 0) {
      throw new Error("email already in use");
    }

    const salt = await bcrypt.genSalt(8);
    const hash = await bcrypt.hash(password, salt);

    const [result] = await db.execute(
      "INSERT INTO users (email, password) VALUES (?, ?)",
      [email, hash]
    );

    return { id: result.insertId, email };
  }
}

module.exports = User;
