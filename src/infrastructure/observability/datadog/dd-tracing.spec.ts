import tracer from 'dd-trace';

// Mock dd-trace before importing the module
jest.mock('dd-trace', () => ({
  __esModule: true,
  default: {
    init: jest.fn().mockReturnThis(),
  },
}));

describe('Datadog Tracing Configuration', () => {
  let ddTracingModule: any;
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should be initialized with default environment', () => {
    ddTracingModule = require('./dd-tracing').default;
    expect(ddTracingModule.init).toHaveBeenCalledWith({
      logInjection: true,
      runtimeMetrics: true,
      env: 'local',
      logger: console,
    });
  });
});
