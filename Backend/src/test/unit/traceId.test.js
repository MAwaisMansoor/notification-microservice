import { traceId } from '../../middleware/traceid.js';

describe('traceId middleware', () => {
  it('should generate a traceId if not present in request headers', () => {
    const req = { headers: {} };
    const next = jest.fn();

    traceId(req, {}, next);

    expect(req.headers.traceId).toBeDefined();
    expect(next).toHaveBeenCalled();
  });
});
