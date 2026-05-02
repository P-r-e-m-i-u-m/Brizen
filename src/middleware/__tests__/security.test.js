const { securityHeaders } = require("../security");

describe("securityHeaders", () => {
  const makeRes = () => { const h = {}; return { setHeader: (k, v) => { h[k] = v; }, removeHeader: jest.fn(), _headers: h }; };

  test("sets all required security headers", () => {
    const res = makeRes();
    securityHeaders({}, res, jest.fn());
    expect(res._headers["X-Content-Type-Options"]).toBe("nosniff");
    expect(res._headers["X-Frame-Options"]).toBe("DENY");
    expect(res._headers["Strict-Transport-Security"]).toContain("max-age=31536000");
    expect(res._headers["X-XSS-Protection"]).toBe("1; mode=block");
  });

  test("sets X-Request-ID header", () => {
    const res = makeRes();
    const req = { headers: { "x-request-id": "test-123" } };
    securityHeaders(req, res, jest.fn());
    expect(res._headers["X-Request-ID"]).toBe("test-123");
  });

  test("calls next()", () => {
    const next = jest.fn();
    securityHeaders({}, makeRes(), next);
    expect(next).toHaveBeenCalled();
  });
});
