import Joi from 'joi';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import config from 'config';
import { StatusCodes } from 'http-status-codes';
import { removeNonWhereParams } from '../util/query-params.js';

const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 6 },
  isAdmin: { type: Boolean, default: false },
});

userSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    { _id: this._id, username: this.username, isAdmin: this.isAdmin },
    config.get('JWT_PRIVATE_KEY')
    // { expiresIn: '24h' }
  );
};

export const User = mongoose.model('User', userSchema);

export const postSchema = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  password: Joi.string().min(8).max(255).required(),
  isAdmin: Joi.boolean().required(),
});

export const patchSchema = Joi.object({
  username: Joi.string().min(3).max(30),
  password: Joi.string().min(8).max(255),
  isAdmin: Joi.boolean(),
});

export const validate = (req, res, next) => {
  const { username, password, isAdmin } = req.body;

  const result =
    req.method === 'POST'
      ? postSchema.validate({ username, password, isAdmin })
      : patchSchema.validate({ username, password, isAdmin });

  result.error
    ? res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: result.error.details[0].message,
        result: {},
      })
    : next();
};
