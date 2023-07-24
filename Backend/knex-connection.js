import knex from 'knex';
import { configurations } from './knexfile.js';

export const db = knex(configurations);
