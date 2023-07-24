import { StatusCodes } from 'http-status-codes';
import { errorHandler } from '../../middleware/error-handler.js';
import { logger } from '../../start/logging.js';

// Mock logger.error function
jest.mock('../../start/logging', () => ({ logger: { error: jest.fn() } }));

describe('errorHandler', () => {
  it('should log error and send internal server error response', () => {
    const error = new Error('Test error');
    const req = { headers: { traceId: '12345' } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    errorHandler(error, req, res);

    // Verify logger.error is called with the correct arguments
    expect(logger.error).toHaveBeenCalledWith(error.message, {
      traceId: req.headers.traceId,
    });

    // Verify response status code and JSON response
    expect(res.status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Some unknown error occurred.',
      result: {},
    });
  });
});
