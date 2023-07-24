import { StatusCodes } from 'http-status-codes';
import {
  getAllFromDB,
  getMultipleFromDB,
  getMultipleItemsFromDB,
  getSingleFromDB,
  getTotalCount,
  patchInDB,
  postInDB,
} from '../db/db.js';
import { getQueryParams } from '../util/query-params.js';

export const getAllApplications = async (req, res) => {
  const queryParams = getQueryParams(req.query);

  const total = await getTotalCount('applications');
  const apps = await getAllFromDB('applications', queryParams);

  res.status(StatusCodes.OK).json({
    success: true,
    message: `Applications ${Boolean(apps?.length) ? '' : 'not '}found!`,
    result: { applications: Boolean(apps?.length) ? apps : {}, total },
  });
};

export const getApplicationById = async (req, res) => {
  if (!req.params.id)
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: 'Please specify the id of the application to get.',
      result: {},
    });

  const id = req.params.id;

  const appFound = await getSingleFromDB('applications', { id });

  res.status(appFound ? StatusCodes.OK : StatusCodes.BAD_REQUEST).json({
    success: Boolean(appFound),
    message: `Application ${appFound ? '' : 'not '}found!`,
    result: { application: appFound || {} },
  });
};

export const getEventsOfApp = async (req, res) => {
  const id = req.params.id;

  const appFound = await getSingleFromDB('applications', { id });

  if (!appFound)
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: 'Application not found!',
      result: {},
    });

  const events = await getMultipleItemsFromDB('events', { app_id: id });

  res.status(events ? StatusCodes.OK : StatusCodes.BAD_REQUEST).json({
    success: Boolean(events),
    message: `Events ${events ? '' : 'not '}found!`,
    result: { events: events || [] },
  });
};

export const createApplication = async (req, res) => {
  const { name, description, isActive } = req.body;

  let app = await getSingleFromDB('applications', { name }, 'name');

  if (app)
    return res.status(StatusCodes.CONFLICT).json({
      success: false,
      message: `Application with name '${name}' already exists.`,
      result: {},
    });

  app = await postInDB(
    'applications',
    {
      name,
      description,
      is_active: isActive,
      created_by: req.userData.id || req.userData._id,
    },
    ['id', 'name', 'description', 'is_active']
  );

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: 'Application created!',
    result: { application: app },
  });
};

export const editApplication = async (req, res) => {
  if (!req.params.id)
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: 'Please specify the id of the application to edit.',
      result: {},
    });

  const { name, description, isActive } = req.body;
  const id = req.params.id;

  let existingApp = await getSingleFromDB('applications', { id });

  if (!existingApp)
    return res.status(StatusCodes.NOT_FOUND).json({
      success: false,
      message: `Application you are trying to edit is not found!`,
      result: {},
    });

  if (name) existingApp.name = name;
  if (description) existingApp.description = description;
  if (isActive !== undefined) existingApp.is_active = isActive;
  existingApp.updated_by = req.userData.id || req.userData._id;

  existingApp = await patchInDB('applications', { id }, existingApp, [
    'id',
    'name',
    'description',
    'is_active',
    'updated_by',
    'created_by',
    'updated_at',
    'created_at',
  ]);

  res.status(StatusCodes.ACCEPTED).json({
    success: true,
    message: 'Application updated!',
    result: { application: existingApp },
  });
};

export const deactivateApplication = async (req, res) => {
  if (!req.params.id)
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: 'Please specify the id of the application to delete.',
      result: {},
    });

  const id = req.params.id;

  let existingApp = await getSingleFromDB('applications', { id }, 'is_active');

  if (!existingApp)
    return res.status(StatusCodes.NOT_FOUND).json({
      success: false,
      message: `Application you are trying to delete is not found!`,
      result: {},
    });

  existingApp.is_active = false;

  existingApp = await patchInDB('applications', { id }, existingApp, [
    'id',
    'name',
    'description',
    'is_active',
    'updated_by',
    'created_by',
    'updated_at',
    'created_at',
  ]);

  res.status(StatusCodes.ACCEPTED).json({
    success: true,
    message: 'Application deactivated!',
    result: { application: existingApp },
  });
};
