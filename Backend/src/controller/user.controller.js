import { StatusCodes } from 'http-status-codes';
import {
  deleteFromDB,
  getAllFromDB,
  getSingleFromDB,
  getTotalCount,
  patchInDB,
  postInDB,
} from '../db/db.js';
import { hashPassword } from '../util/bcrypt.js';
import { getToken } from '../util/jwt.js';
import { getQueryParams } from '../util/query-params.js';

export const getAllUsers = async (req, res) => {
  const queryParams = getQueryParams(req.query);

  const total = await getTotalCount('users');
  const users = await getAllFromDB('users', queryParams);

  return res.status(StatusCodes.OK).json({
    success: true,
    message: `Users ${Boolean(users?.length) ? '' : 'not '}found!`,
    result: { users: Boolean(users?.length) ? users : {}, total },
  });
};

export const getUserById = async (req, res) => {
  if (!req.params.id)
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: 'Please specify the id of the user to get.',
      result: {},
    });

  const userFound = await getSingleFromDB('users', {
    id: req.params.id,
  });

  res.status(userFound ? StatusCodes.OK : StatusCodes.NOT_FOUND).json({
    success: true,
    message: `User ${userFound ? '' : 'not '}found!`,
    result: { user: userFound || {} },
  });
};

export const createUser = async (req, res) => {
  const { password, isAdmin } = req.body;
  const username = req.body.username.trim();

  let user = await getSingleFromDB('users', { username }, 'username');

  if (user)
    return res.status(StatusCodes.CONFLICT).json({
      success: false,
      message: `User with username '${username}' already exists.`,
      result: {},
    });

  user = await postInDB(
    'users',
    {
      username,
      password: await hashPassword(password),
      is_admin: isAdmin,
      created_by: req.userData.id || req.userData._id || req.userData._id,
    },
    ['id', 'username', 'is_admin']
  );

  res
    .status(StatusCodes.CREATED)
    .header('x-auth-token', getToken({ id: user.id, username, isAdmin }))
    .json({
      success: true,
      message: `User created!`,
      result: { user },
    });
};

export const editUser = async (req, res) => {
  if (!req.params.id)
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: 'Please specify the id of the user to edit.',
      result: {},
    });

  const { username, password, isAdmin } = req.body;
  const id = req.params.id;

  let existingUser = await getSingleFromDB('users', { id });

  if (!existingUser)
    return res.status(StatusCodes.NOT_FOUND).json({
      success: false,
      message: `User you are trying to edit is not found!`,
      result: {},
    });

  if (username) existingUser.username = username;
  if (password) existingUser.password = password;
  if (isAdmin !== null || isAdmin !== undefined)
    existingUser.is_admin = isAdmin;
  existingUser.updated_by = req.userData.id || req.userData._id;

  existingUser = await patchInDB('users', { id }, existingUser, [
    'id',
    'username',
    'is_admin',
    'updated_by',
    'updated_at',
    'created_at',
  ]);

  res.status(StatusCodes.ACCEPTED).json({
    success: true,
    message: `User updated!`,
    result: { user: existingUser },
  });
};

export const deleteUser = async (req, res) => {
  if (!req.params.id)
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: 'Please specify the id of the user to delete.',
      result: {},
    });

  const id = req.params.id;

  const existingUser = await deleteFromDB('users', { id });

  res
    .status(existingUser ? StatusCodes.ACCEPTED : StatusCodes.BAD_REQUEST)
    .json({
      success: Boolean(existingUser),
      message: existingUser ? 'User deleted!' : 'User not found!',
      result: {},
    });
};
