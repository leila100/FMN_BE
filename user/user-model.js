const db = require("../data/dbConfig.js");

module.exports = {
  add,
  findBy,
  update
};

async function add(user) {
  const [id] = await db("users").insert(user, "id");
  return id;
}

function findBy(condition) {
  return db("users").where(condition);
}

function update(id, user) {
  return db("users")
    .where("id", id)
    .update(user);
}
