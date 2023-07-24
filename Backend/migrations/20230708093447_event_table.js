export const up = async (knex) =>
  await knex.schema.createTable('events', (table) => {
    table.increments('id');
    table.string('name', 30).notNullable().unique();
    table.string('description', 255).notNullable();
    table.integer('app_id').notNullable();
    table.string('created_by', 30).notNullable();
    table.string('updated_by', 30);
    table.timestamps(true, true);
    table.foreign('app_id').references('id').inTable('applications');
  });

export const down = async (knex) => await knex.schema.dropTable('events');
