import { StatusCodes } from 'http-status-codes';
import { checkAuth } from '../../middleware/check-auth.js';
import { verifyToken } from '../../util/jwt.js';

jest.mock('../../util/jwt.js');

describe('checkAuth middleware', () => {
  it('should pass the request to the next middleware if method is OPTIONS', () => {
    const req = { method: 'OPTIONS' };
    const res = {};
    const next = jest.fn();

    checkAuth(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('should return an error response if token is missing', () => {
    const req = {
      method: 'POST',
      get: jest.fn().mockReturnValue(undefined),
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    checkAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Authentication failed! Token missing.',
      result: {},
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should set userData in the request if token is present', () => {
    const token = 'dummyToken';
    const decodedToken = { id: 123, name: 'John Doe' };
    const req = {
      method: 'POST',
      get: jest.fn().mockReturnValue(token),
    };
    const res = {};
    const next = jest.fn();
    verifyToken.mockReturnValue(decodedToken);

    checkAuth(req, res, next);

    expect(req.userData).toBe(decodedToken);
    expect(next).toHaveBeenCalled();
  });
});
