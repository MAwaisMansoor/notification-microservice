import { StatusCodes } from 'http-status-codes';
import {
  deleteFromDB,
  getAllFromDB,
  getMultipleFromDB,
  getMultipleItemsFromDB,
  getSingleFromDB,
  getTotalCount,
  patchInDB,
  postInDB,
} from '../db/db.js';
import { getQueryParams } from '../util/query-params.js';

export const getAllNotificationTypes = async (req, res) => {
  const queryParams = getQueryParams(req.query);

  const total = await getTotalCount('notification_types');
  const notiTypes = await getAllFromDB('notification_types', queryParams);

  res.status(StatusCodes.OK).json({
    success: true,
    message: `Notification types ${
      Boolean(notiTypes?.length) ? '' : 'not '
    }found!`,
    result: {
      notificationTypes: Boolean(notiTypes?.length) ? notiTypes : {},
      total,
    },
  });
};

export const getNotificationTypeById = async (req, res) => {
  if (!req.params.id)
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: 'Please specify the id of the notification type to get.',
      result: {},
    });

  const id = req.params.id;

  const notiTypeFound = await getSingleFromDB('notification_types', { id });

  res
    .status(notiTypeFound ? StatusCodes.ACCEPTED : StatusCodes.BAD_REQUEST)
    .json({
      success: Boolean(notiTypeFound),
      message: `Notification type ${notiTypeFound ? '' : 'not '}found!`,
      result: { notificationType: notiTypeFound || {} },
    });
};

export const getMessagesOfNotificationType = async (req, res) => {
  const id = req.params.id;

  const notiType = await getSingleFromDB('notification_types', { id });

  if (!notiType)
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: 'Notification type not found!',
      result: {},
    });

  const messages = await getMultipleItemsFromDB('messages', {
    noti_type_id: id,
  });

  res.status(messages ? StatusCodes.OK : StatusCodes.BAD_REQUEST).json({
    success: Boolean(messages),
    message: `Messages ${messages ? '' : 'not '}found!`,
    result: { messages: messages || [] },
  });
};

export const createNotificationType = async (req, res) => {
  const { event_id, name, description, template_subject, template_body } =
    req.body;

  const eventFound = await getSingleFromDB('events', { id: event_id }, 'id');

  if (!eventFound)
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: `Event with id '${event_id}' does not exists.`,
      result: {},
    });

  let notiTypeFound = await getSingleFromDB(
    'notification_types',
    { name },
    'id'
  );

  if (notiTypeFound)
    return res.status(StatusCodes.CONFLICT).json({
      success: false,
      message: `Notification type with name '${name}' already exists.`,
      result: {},
    });

  const tags = [
    ...new Set([...getTags(template_subject), ...getTags(template_body)]),
  ];

  if (tags.length > 0) await insertTags(tags);

  notiTypeFound = await postInDB(
    'notification_types',
    {
      name,
      description,
      event_id,
      template_subject,
      template_body,
      ...(Boolean(tags.length) ? { tags } : {}),
      created_by: req.userData.id || req.userData._id,
    },
    [
      'id',
      'name',
      'description',
      'event_id',
      'template_subject',
      'template_body',
      'tags',
    ]
  );

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: 'Notification type created!',
    result: { notificationType: notiTypeFound },
  });
};

export const editNotificationType = async (req, res) => {
  if (!req.params.id)
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: 'Please specify the id of the notification type to get.',
      result: {},
    });

  const { name, description, template_subject, template_body } = req.body;
  const id = req.params.id;

  let existingNotiType;
  if (name) {
    existingNotiType = await getSingleFromDB(
      'notification_types',
      { name },
      'id'
    );
    if (existingNotiType)
      return res.status(StatusCodes.CONFLICT).json({
        success: false,
        message: `Notification type with name '${name}' already exists.`,
        result: {},
      });
  }
  existingNotiType = await getSingleFromDB('notification_types', { id });

  if (!existingNotiType)
    return res.status(StatusCodes.NOT_FOUND).json({
      success: false,
      message: `Notification type you are trying to edit is not found!`,
      result: {},
    });

  if (name) existingNotiType.name = name;
  if (description) existingNotiType.description = description;
  if (template_subject) {
    existingNotiType.template_subject = template_subject;
    existingNotiType.tags = [...getTags(template_subject)];
  }
  if (template_body) {
    existingNotiType.template_body = template_body;
    existingNotiType.tags = [
      ...existingNotiType.tags,
      ...getTags(template_body),
    ];
  }
  if (template_subject || template_body) {
    existingNotiType.tags = [...new Set(existingNotiType.tags)];
    await insertTags(existingNotiType.tags);
  }

  existingNotiType.updated_by = req.userData.id || req.userData._id;

  existingNotiType = await patchInDB(
    'notification_types',
    { id },
    existingNotiType,
    [
      'id',
      'name',
      'description',
      'template_subject',
      'template_body',
      'event_id',
      'updated_by',
      'created_by',
      'updated_at',
      'created_at',
      'tags',
    ]
  );

  res.status(StatusCodes.ACCEPTED).json({
    success: true,
    message: 'Notification type updated!',
    result: { notificationType: existingNotiType },
  });
};

export const deleteNotificationType = async (req, res) => {
  if (!req.params.id)
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: 'Please specify the id of the notification type to get.',
      result: {},
    });

  const id = req.params.id;

  const existingNotiType = await getSingleFromDB(
    'notification_types',
    { id },
    'id'
  );

  if (!existingNotiType)
    return res.status(StatusCodes.NOT_FOUND).json({
      success: false,
      message: `Notification type you are trying to delete is not found!`,
      result: {},
    });

  await deleteFromDB('notification_types', { id });

  res.status(StatusCodes.ACCEPTED).json({
    success: true,
    message: 'Notification type deleted!',
    result: {},
  });
};

export const getTags = (from) => {
  const matches = [...from.matchAll(/\{([^{}]*)\}/g)];
  return Array.from(matches, (m) => m[1]);
};

const insertTags = async (tags) => {
  const dbTags = (
    await getMultipleFromDB('tags', ['label', tags], 'label')
  ).map((tag) => tag.label);

  const tagsToInsert = tags.filter((tag) => !dbTags.includes(tag));

  if (Boolean(tagsToInsert.length))
    await postInDB(
      'tags',
      tagsToInsert.map((tag) => ({ label: tag }))
    );
};
