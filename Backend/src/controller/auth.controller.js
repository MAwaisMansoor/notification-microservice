import { StatusCodes } from 'http-status-codes';
import { getSingleFromDB } from '../db/db.js';
import { comparePassword } from '../util/bcrypt.js';
import { getToken } from '../util/jwt.js';

export const authenticate = async (req, res) => {
  const password = req.body.password;
  const username = req.body.username.trim();

  let userFound;

  userFound = await getSingleFromDB('users', { username });

  if (!userFound)
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ success: false, message: `Invalid credentials.`, result: {} });

  const validPassword = await comparePassword(password, userFound.password);
  if (!validPassword)
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ success: false, message: `Invalid credentials.`, result: {} });

  const token = getToken({
    id: userFound.id || userFound._id,
    username: userFound.username,
    isAdmin: userFound.is_admin,
  });

  res
    .status(StatusCodes.ACCEPTED)
    .json({ success: true, message: 'Authenticated!', result: { token } });
};
