import db from "../utils/db.js";

export default {
  async findByUsername(username) {
    const list = await db("users").where("username", username);
    if (list.length != 0) return list[0];
    return null;
  },

  async addUser(entity) {
    return await db("users").insert(entity);
  },

  async login(username) {
    const list = await db("users")
      .select(
        "userid",
        "username",
        "pass",
        "typeaccount as permission",
        "lockaccount"
      )
      .where("username", username);
    if (list.length !== 0) return list[0];
    return null;
  },
};
