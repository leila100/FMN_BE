const db = require("../data/dbConfig.js");

module.exports = {
  add,
  getAll,
  remove,
  update,
  getById
};

async function add(contact) {
  const [id] = await db("contacts").insert(contact, "id");
  return id;
}

function getAll(user_id) {
  return db("contacts").where({ user_id: Number(user_id) });
}

function remove(id, user_id) {
  return db("contacts")
    .where({ id: Number(id), user_id: Number(user_id) })
    .del();
}

function update(id, user_id, contact) {
  return db("contacts")
    .where({ id: Number(id), user_id: Number(user_id) })
    .update(contact);
}

function getById(id, user_id) {
  return db("contacts")
    .where({ id: Number(id), user_id: Number(user_id) })
    .first();
}
