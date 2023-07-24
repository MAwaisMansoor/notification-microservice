import { Router } from 'express';
import Joi from 'joi';
import { authenticate } from '../controller/auth.controller.js';
import { StatusCodes } from 'http-status-codes';

const router = Router();

const validate = (req, res, next) => {
  const { username, password } = req.body;

  const { error } = Joi.object({
    username: Joi.string().min(3).max(30).required(),
    password: Joi.string().min(8).max(255).required(),
  }).validate({ username, password });

  error
    ? res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: error.details[0].message,
        result: {},
      })
    : next();
};

router.post('/', validate, authenticate);

export const auth = router;
