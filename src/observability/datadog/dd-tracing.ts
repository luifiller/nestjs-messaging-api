import tracer from 'dd-trace';

tracer.init({
  logInjection: true,
  runtimeMetrics: true,
  env: process.env.NODE_ENV || 'local',
  logger: console,
});

export default tracer;
