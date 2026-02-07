import tracer from 'dd-trace';

tracer.init({
  logInjection: true,
  runtimeMetrics: true,
  env: process.env.DD_ENV || 'local',
  logger: console,
});

export default tracer;
