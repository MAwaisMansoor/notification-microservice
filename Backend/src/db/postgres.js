import { db } from '../../knex-connection.js';

export const getTotalCountPostgres = async (toGet) =>
  parseInt((await db(toGet).count().first())?.count);

export const getAllFromPostgres = async (toGet, query) => {
  const { page, pageSize, where, whereBetween } = query;
  const { startDate, endDate } = whereBetween
    ? whereBetween
    : { startDate: null, endDate: null };

  return page && pageSize
    ? where
      ? whereBetween
        ? await db(toGet)
            .where(where)
            .andWhereBetween('created_at', [startDate, endDate])
            .offset((page - 1) * pageSize)
            .limit(pageSize)
        : await db(toGet)
            .where(where)
            .offset((page - 1) * pageSize)
            .limit(pageSize)
      : whereBetween
      ? await db(toGet)
          .whereBetween('created_at', [startDate, endDate])
          .offset((page - 1) * pageSize)
          .limit(pageSize)
      : await db(toGet)
          .offset((page - 1) * pageSize)
          .limit(pageSize)
    : where
    ? whereBetween
      ? await db(toGet)
          .where(where)
          .andWhereBetween('created_at', [startDate, endDate])
      : await db(toGet).where(where)
    : db(toGet);
};

export const getSingleFromPostgres = async (toGet, where, select = '*') =>
  await db(toGet).select(select).where(where).first();

export const getMultipleFromPostgres = async (toGet, whereIn, select = '*') =>
  await db(toGet).select(select).whereIn(whereIn[0], whereIn[1]);

export const getMultipleItemsFromPostgres = async (
  toGet,
  where,
  select = '*'
) => await db(toGet).select(select).where(where);

export const postInPostgres = async (toPost, payload, returns) =>
  (await db(toPost).insert(payload).returning(returns))[0];

export const patchInPostgres = async (toPatch, where, payload, returns) =>
  (await db(toPatch).where(where).update(payload, returns))[0];

export const deleteFromPostgres = async (toDelete, where) =>
  await db(toDelete).del().where(where);

export const deleteAllFromPostgres = async (toDelete) =>
  await db(toDelete).del();
