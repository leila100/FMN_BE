exports.up = function(knex, Promise) {
  return knex.schema.createTable("contacts", tbl => {
    tbl.increments();
    tbl
      .integer("user_id")
      .notNullable()
      .references("id")
      .inTable("users");
    tbl.string("contactName", 128).notNullable();
    tbl.string("contactEmail", 128).notNullable();
  });
};
exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists("contacts");
};
