import { StatusCodes } from 'http-status-codes';
import {
  deleteFromDB,
  getAllFromDB,
  getMultipleFromDB,
  getSingleFromDB,
  getTotalCount,
  postInDB,
} from '../db/db.js';
import { getQueryParams } from '../util/query-params.js';
import { schema } from '../model/message.js';

export const getAllMessages = async (req, res) => {
  const queryParams = getQueryParams(req.query);

  const total = await getTotalCount('messages');
  const messages = await getAllFromDB('messages', queryParams);

  res.status(StatusCodes.OK).json({
    success: true,
    message: `Messages ${Boolean(messages?.length) ? '' : 'not '}found!`,
    result: { messages: Boolean(messages?.length) ? messages : {}, total },
  });
};

export const getMessageById = async (req, res) => {
  if (!req.params.id)
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: 'Please specify the id of the message to get.',
      result: {},
    });

  const id = req.params.id;

  const messageFound = await getSingleFromDB('messages', { id });

  res
    .status(messageFound ? StatusCodes.ACCEPTED : StatusCodes.BAD_REQUEST)
    .json({
      success: Boolean(messageFound),
      message: `Message ${messageFound ? '' : 'not '}found!`,
      result: { message: messageFound || {} },
    });
};

export const createMessage = async (req, res) => {
  const { notifications } = req.body;
  const notiPassed = Boolean(notifications?.length);

  const result = notiPassed
    ? { messages: await processNotifications(res, notifications) }
    : {};

  res.status(notiPassed ? StatusCodes.CREATED : StatusCodes.BAD_REQUEST).json({
    success: notiPassed,
    message: `Notifications ${notiPassed ? 'added!' : 'are required!'}`,
    result,
  });
};

export const deleteMessage = async (req, res) => {
  if (!req.params.id)
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: 'Please specify the id of the message to get.',
      result: {},
    });

  const id = req.params.id;

  const existingMessage = await getSingleFromDB('messages', { id });

  if (!existingMessage)
    return res.status(StatusCodes.NOT_FOUND).json({
      success: false,
      message: `Message you are trying to delete is not found!`,
      result: {},
    });

  await deleteFromDB('messages', { id });

  res.status(StatusCodes.ACCEPTED).json({
    success: true,
    message: 'Message deleted!',
    result: {},
  });
};

const processNotifications = (res, notifications) =>
  new Promise(async (resolve, reject) => {
    try {
      const addedMsgs = [];

      for (const notification of notifications) {
        const { notificationType } = await validateNotification(
          res,
          notification
        );
        const { tags } = notification;
        let { id, template_subject, template_body } = notificationType;

        Object.keys(tags).forEach((key) => {
          template_subject = template_subject.replaceAll(`{${key}}`, tags[key]);
          template_body = template_body.replaceAll(`{${key}}`, tags[key]);
        });

        const text = `${template_subject}\n${template_body}`;

        const addedMsg = await postInDB(
          'messages',
          { text, noti_type_id: id },
          ['id', 'text', 'noti_type_id']
        );

        addedMsgs.push(addedMsg);
      }

      resolve(addedMsgs);
    } catch (error) {
      reject(error);
    }
  });

const validateNotification = async (res, notification) => {
  const { application, event, notificationType, tags } = notification;

  const { error } = schema.validate(notification);
  if (error)
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: error.details[0].message,
      result: {},
    });

  const appFound = await getSingleFromDB('applications', {
    name: application,
  });
  const eventFound = await getSingleFromDB('events', {
    name: event,
  });
  const notiTypeFound = await getSingleFromDB('notification_types', {
    name: notificationType,
  });

  if (!appFound || !eventFound || !notiTypeFound) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: `${
        !appFound ? `Application (${application}) don't exist.` : ''
      } ${!eventFound ? `Event (${event}) don't exist.` : ''} ${
        !notiTypeFound
          ? `Notification type (${notificationType}) don't exist.`
          : ''
      }`,
      result: {},
    });
  }

  const tagsFound = (
    await getMultipleFromDB('tags', ['label', Object.keys(tags)], 'label')
  ).map((tag) => tag.label);

  const missingTags = notiTypeFound.tags
    ? notiTypeFound.tags.filter((tag) => !tagsFound.includes(tag))
    : [];

  if (missingTags?.length) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: `Tag(s) ${JSON.stringify(missingTags)} is/are missing.`,
      result: {},
    });
  }

  return { notificationType: notiTypeFound };
};
