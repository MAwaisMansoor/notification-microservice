import { User } from '../model/user.js';
import { Application } from '../model/application.js';
import { Event } from '../model/event.js';
import { NotificationType } from '../model/notification-type.js';
import { Message } from '../model/message.js';

export const getTotalCountMongo = async (toGet) =>
  await getModel(toGet).countDocuments();

export const getAllFromMongoDB = async (toGet, query) => {
  const { page, pageSize, where, whereBetween } = query;
  const { startDate, endDate } = whereBetween
    ? whereBetween
    : { startDate: null, endDate: null };

  const _where = where
    ? whereBetween
      ? { ...where, created_at: { $gte: startDate, $lte: endDate } }
      : where
    : whereBetween
    ? { created_at: { $gte: startDate, $lte: endDate } }
    : {};

  page && pageSize
    ? await getModel(toGet)
        .find(_where)
        .skip((page - 1) * pageSize)
        .limit(pageSize)
    : await db(toGet).find(_where);
};

export const getSingleFromMongoDB = async (toGet, where, select) =>
  select
    ? await getModel(toGet)
        .findOne(where.id ? { _id: where.id } : where)
        .select(select)
    : await getModel(toGet).findOne(where.id ? { _id: where.id } : where);

export const getMultipleFromMongoDB = async (toGet, whereIn, select) =>
  select
    ? await getModel(toGet).where(whereIn[0]).in(whereIn[1]).select(select)
    : await getModel(toGet).where(whereIn[0]).in(whereIn[1]);

export const getMultipleItemsFromMongoDB = async (toGet, where, select) =>
  select
    ? await getModel(toGet).where(where).select(select)
    : await getModel(toGet).where(where);

export const postInMongoDB = async (toPost, payload, returns) => {
  const Model = getModel(toPost);
  return await new Model(payload).save();
};

export const patchInMongoDB = async (toPatch, where, payload, returns) =>
  await payload.save();

export const deleteFromMongoDB = async (toDelete, where) =>
  await getModel(toDelete).findOneAndRemove(
    where.id ? { _id: where.id } : where
  );

export const deleteAllFromMongoDB = async (toDelete) =>
  await getModel(toDelete).remove({});

const getModel = (name) =>
  name === 'users'
    ? User
    : name === 'applications'
    ? Application
    : name === 'events'
    ? Event
    : name === 'notification_types'
    ? NotificationType
    : Message;
