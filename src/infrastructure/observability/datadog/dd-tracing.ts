import tracer from 'dd-trace';

/**
 * Datadog APM Tracer Configuration
 *
 * @description
 * Initializes and configures the Datadog APM (Application Performance Monitoring)
 * tracer for distributed tracing and performance monitoring.
 *
 * This module should be imported at the application entry point before any
 * other imports to ensure proper instrumentation of all dependencies.
 *
 * @configuration
 * - logInjection: Automatically injects trace IDs into application logs
 * - runtimeMetrics: Collects and reports Node.js runtime metrics (CPU, memory, etc.)
 * - env: Environment name (production, staging, development, local)
 * - logger: Logger instance for tracer internal logs
 *
 * @environment
 * DD_ENV: Specifies the deployment environment (defaults to 'local')
 *
 * @see https://docs.datadoghq.com/tracing/
 */
tracer.init({
  logInjection: true,
  runtimeMetrics: true,
  env: process.env.DD_ENV || 'local',
  logger: console,
});

export default tracer;
