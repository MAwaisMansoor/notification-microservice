export const up = async (knex) =>
  await knex.schema.createTable('notification_types', (table) => {
    table.increments('id');
    table.string('name', 30).notNullable().unique();
    table.string('description', 255).notNullable();
    table.string('template_subject', 255).notNullable();
    table.string('template_body', 255).notNullable();
    table.specificType('tags', 'text ARRAY');
    table.integer('event_id').notNullable();
    table.string('created_by', 30).notNullable();
    table.string('updated_by', 30);
    table.timestamps(true, true);
    table.foreign('event_id').references('id').inTable('events');
  });

export const down = async (knex) =>
  await knex.schema.dropTable('notification_types');
