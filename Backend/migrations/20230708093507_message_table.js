export const up = async (knex) =>
  await knex.schema.createTable('messages', (table) => {
    table.increments('id');
    table.string('text', 255).notNullable();
    table.integer('noti_type_id').notNullable();
    table.timestamps(true, true);
    table
      .foreign('noti_type_id')
      .references('id')
      .inTable('notification_types');
  });

export const down = async (knex) => await knex.schema.dropTable('messages');
