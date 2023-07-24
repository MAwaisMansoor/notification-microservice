import { patchSchema as user } from '../model/user.js';
import { patchSchema as app } from '../model/application.js';
import { patchSchema as event } from '../model/event.js';
import { patchSchema as notiType } from '../model/notification-type.js';
import { removeNonWhereParams } from '../util/query-params.js';
import { StatusCodes } from 'http-status-codes';

export const validateQueryParams = (req, res, next) => {
  const query = removeNonWhereParams({ ...req.query });

  const calledEntity = req.baseUrl.split('/')[2];

  const queryResult =
    calledEntity === 'users'
      ? user.validate(query)
      : calledEntity === 'applications'
      ? app.validate(query)
      : calledEntity === 'events'
      ? event.validate(query)
      : notiType.validate(query);

  if (queryResult.error)
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: queryResult.error.details[0].message,
      result: {},
    });

  next();
};
