export const up = async (knex) =>
  await knex.schema.createTable('applications', (table) => {
    table.increments('id').unique();
    table.string('name', 30).notNullable().unique();
    table.string('description', 255).notNullable();
    table.boolean('is_active').notNullable();
    table.string('created_by', 30).notNullable();
    table.string('updated_by', 30);
    table.timestamps(true, true);
  });

export const down = async (knex) => await knex.schema.dropTable('applications');
