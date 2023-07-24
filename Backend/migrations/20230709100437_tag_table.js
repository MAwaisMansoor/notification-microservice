export const up = async (knex) =>
  await knex.schema.createTable('tags', (table) => {
    table.increments('id');
    table.string('label', 255).notNullable();
    table.timestamps(true, true);
  });

export const down = async (knex) => await knex.schema.dropTable('tags');
