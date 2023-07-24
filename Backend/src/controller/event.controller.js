import { StatusCodes } from 'http-status-codes';
import {
  deleteFromDB,
  getAllFromDB,
  getMultipleItemsFromDB,
  getSingleFromDB,
  getTotalCount,
  patchInDB,
  postInDB,
} from '../db/db.js';
import { getQueryParams } from '../util/query-params.js';

export const getAllEvents = async (req, res) => {
  const queryParams = getQueryParams(req.query);

  const total = await getTotalCount('events');
  const events = await getAllFromDB('events', queryParams);

  res.status(StatusCodes.OK).json({
    success: true,
    message: `Events ${Boolean(events?.length) ? '' : 'not '}found!`,
    result: { events: Boolean(events?.length) ? events : {}, total },
  });
};

export const getEventById = async (req, res) => {
  if (!req.params.id)
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: 'Please specify the id of the event to get.',
      result: {},
    });

  const id = req.params.id;

  const eventFound = await getSingleFromDB('events', { id });

  res.status(eventFound ? StatusCodes.ACCEPTED : StatusCodes.BAD_REQUEST).json({
    success: Boolean(eventFound),
    message: `Event ${eventFound ? '' : 'not '}found!`,
    result: { event: eventFound || {} },
  });
};

export const getNotificationTypesOfEvent = async (req, res) => {
  const id = req.params.id;

  const event = await getSingleFromDB('events', { id });

  if (!event)
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: 'Event not found!',
      result: {},
    });

  const notificationTypes = await getMultipleItemsFromDB('notification_types', {
    event_id: id,
  });

  res
    .status(notificationTypes ? StatusCodes.OK : StatusCodes.BAD_REQUEST)
    .json({
      success: Boolean(notificationTypes),
      message: `Notification types ${notificationTypes ? '' : 'not '}found!`,
      result: { notificationTypes: notificationTypes || [] },
    });
};

export const createEvent = async (req, res) => {
  const { app_id, name, description } = req.body;

  const appFound = await getSingleFromDB('applications', { id: app_id }, 'id');

  if (!appFound)
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: `Application with id '${app_id}' does not exists.`,
      result: {},
    });

  let event = await getSingleFromDB('events', { name }, 'name');

  if (event)
    return res.status(StatusCodes.CONFLICT).json({
      success: false,
      message: `Event with name '${name}' already exists.`,
      result: {},
    });

  event = await postInDB(
    'events',
    {
      name,
      description,
      app_id: appFound.id,
      created_by: req.userData.id || req.userData._id,
    },
    ['id', 'name', 'description', 'app_id']
  );

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: 'Event created!',
    result: { event },
  });
};

export const editEvent = async (req, res) => {
  if (!req.params.id)
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: 'Please specify the id of the event to edit.',
      result: {},
    });

  const { name, description } = req.body;

  const id = req.params.id;

  let existingEvent;
  if (name) {
    existingEvent = await getSingleFromDB('events', { name }, 'name');
    if (existingEvent)
      return res.status(StatusCodes.CONFLICT).json({
        success: false,
        message: `Event with name '${name}' already exists.`,
        result: {},
      });
  }
  existingEvent = await getSingleFromDB('events', { id }, 'id');

  if (!existingEvent)
    return res.status(StatusCodes.NOT_FOUND).json({
      success: false,
      message: `Event you are trying to edit is not found!`,
      result: {},
    });

  if (name) existingEvent.name = name;
  if (description) existingEvent.description = description;
  existingEvent.updated_by = req.userData.id || req.userData._id;

  existingEvent = await patchInDB('events', { id }, existingEvent, [
    'id',
    'name',
    'description',
    'app_id',
    'updated_by',
    'created_by',
    'updated_at',
    'created_at',
  ]);

  res.status(StatusCodes.ACCEPTED).json({
    success: true,
    message: 'Event updated!',
    result: { event: existingEvent },
  });
};

export const deleteEvent = async (req, res) => {
  if (!req.params.id)
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: 'Please specify the id of the Event to delete.',
      result: {},
    });

  const id = req.params.id;

  const existingEvent = await getSingleFromDB('events', { id });

  if (!existingEvent)
    return res.status(StatusCodes.NOT_FOUND).json({
      success: false,
      message: `Event you are trying to delete is not found!`,
      result: {},
    });

  await deleteFromDB('events', { id });

  res.status(StatusCodes.ACCEPTED).json({
    success: true,
    message: 'Event deleted!',
    result: {},
  });
};
