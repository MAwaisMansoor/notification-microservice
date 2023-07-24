import { StatusCodes } from 'http-status-codes';
import Joi from 'joi';
import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const applicationSchema = new Schema({
  isActive: { type: Boolean, default: true },
  name: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  events: [{ type: mongoose.Types.ObjectId, ref: 'Event' }],
  created_by: { type: mongoose.Types.ObjectId, required: true, ref: 'User' },
});

export const Application = mongoose.model('Application', applicationSchema);

export const postSchema = Joi.object({
  name: Joi.string().min(3).max(30).required(),
  description: Joi.string().min(10).max(255).required(),
  isActive: Joi.boolean().required(),
});

export const patchSchema = Joi.object({
  name: Joi.string().min(3).max(30),
  description: Joi.string().min(10).max(255),
  isActive: Joi.boolean(),
});

export const validate = (req, res, next) => {
  const { name, description, isActive } = req.body;

  const result =
    req.method === 'POST'
      ? postSchema.validate({ name, description, isActive })
      : patchSchema.validate({ name, description, isActive });

  result.error
    ? res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: result.error.details[0].message,
        result: {},
      })
    : next();
};
