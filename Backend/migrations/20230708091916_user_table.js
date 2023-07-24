export const up = async (knex) =>
  await knex.schema.createTable('users', (table) => {
    table.increments('id');
    table.string('username', 30).notNullable().unique();
    table.string('password', 255).notNullable();
    table.boolean('is_admin').notNullable();
    table.string('created_by', 30).notNullable();
    table.string('updated_by', 30);
    table.timestamps(true, true);
  });

export const down = async (knex) => await knex.schema.dropTable('users');
