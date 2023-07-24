import { StatusCodes } from 'http-status-codes';
import { checkAdmin } from '../../middleware/check-admin.js';

describe('checkAdmin middleware', () => {
  it('should pass the request to the next middleware if user is an admin', () => {
    const req = {
      userData: {
        isAdmin: true,
      },
    };
    const res = {};
    const next = jest.fn();

    checkAdmin(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('should return an error response if user is not an admin', () => {
    const req = {
      userData: {
        isAdmin: false,
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    checkAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.FORBIDDEN);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Access denied!',
      result: {},
    });
    expect(next).not.toHaveBeenCalled();
  });
});
