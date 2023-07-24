import config from 'config';
import {
  deleteAllFromPostgres,
  deleteFromPostgres,
  getAllFromPostgres,
  getMultipleFromPostgres,
  getMultipleItemsFromPostgres,
  getSingleFromPostgres,
  getTotalCountPostgres,
  patchInPostgres,
  postInPostgres,
} from './postgres.js';
import {
  deleteAllFromMongoDB,
  deleteFromMongoDB,
  getAllFromMongoDB,
  getMultipleFromMongoDB,
  getMultipleItemsFromMongoDB,
  getSingleFromMongoDB,
  getTotalCountMongo,
  patchInMongoDB,
  postInMongoDB,
} from './mongodb.js';

const dbType = config.get('DB.TYPE') || 'postgres';

export const getTotalCount = async (toGet) =>
  dbType === 'mongodb'
    ? await getTotalCountMongo(toGet)
    : await getTotalCountPostgres(toGet);

export const getAllFromDB = async (toGet, query) =>
  dbType === 'mongodb'
    ? await getAllFromMongoDB(toGet, query)
    : await getAllFromPostgres(toGet, query);

export const getSingleFromDB = async (toGet, where, select) =>
  dbType === 'mongodb'
    ? await getSingleFromMongoDB(toGet, where, select)
    : await getSingleFromPostgres(toGet, where, select);

export const getMultipleFromDB = async (toGet, whereIn, select) =>
  dbType === 'mongodb'
    ? await getMultipleFromMongoDB(toGet, whereIn, select)
    : await getMultipleFromPostgres(toGet, whereIn, select);

export const getMultipleItemsFromDB = async (toGet, where, select) =>
  dbType === 'mongodb'
    ? await getMultipleItemsFromMongoDB(toGet, where, select)
    : await getMultipleItemsFromPostgres(toGet, where, select);

export const postInDB = async (toPost, payload, returns) =>
  dbType === 'mongodb'
    ? await postInMongoDB(toPost, payload, returns)
    : await postInPostgres(toPost, payload, returns);

export const patchInDB = async (toPatch, where, payload, returns) =>
  dbType === 'mongodb'
    ? await patchInMongoDB(toPatch, where, payload, returns)
    : await patchInPostgres(toPatch, where, payload, returns);

export const deleteFromDB = async (toDelete, where) =>
  dbType === 'mongodb'
    ? await deleteFromMongoDB(toDelete, where)
    : await deleteFromPostgres(toDelete, where);

export const deleteAllFromDB = async (toDelete) =>
  dbType === 'mongodb'
    ? await deleteAllFromMongoDB(toDelete)
    : await deleteAllFromPostgres(toDelete);
