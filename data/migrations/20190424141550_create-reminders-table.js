exports.up = function(knex, Promise) {
  return knex.schema.createTable("reminders", tbl => {
    tbl.increments();
    tbl
      .integer("user_id")
      .notNullable()
      .references("id")
      .inTable("users");
    tbl.string("recipientName", 128).notNullable();
    tbl.string("recipientEmail", 128).notNullable();
    tbl.string("messageText").notNullable();
    tbl.boolean("sent").notNullable();
    tbl.string("type").notNullable();
    tbl.date("date").notNullable();
    tbl.date("time").notNullable();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists("reminders");
};
