import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import tracer from '../dd-tracing';
import { DdTraceSpanTags } from '../dd-trace-span-tags.const';

/**
 * Datadog User Tracking Interceptor
 *
 * @description
 * Interceptor that associates the authenticated user with requests traced by Datadog APM.
 * Allows identifying which users are making which requests in Datadog traces,
 * making debugging and user-based performance analysis easier.
 *
 * @responsibilities
 * - Extract authenticated user information from the request
 * - Associate the user with the active Datadog span
 * - Register additional metadata such as custom tags
 *
 * @see https://docs.datadoghq.com/tracing/trace_collection/custom_instrumentation/nodejs/
 */
@Injectable()
export class DatadogUserInterceptor implements NestInterceptor {
  /**
   * Intercepts the request to associate the authenticated user with the Datadog trace
   *
   * @param {ExecutionContext} context - Execution context containing request information
   * @param {CallHandler} next - Handler to continue the request flow
   * @returns {Observable<any>} Observable of the request result
   *
   * @description
   * Checks whether there is an authenticated user in the request (populated by Guards).
   * If present, associates the user information with the active Datadog span using
   * tracer.setUser(), enabling filtering and analysis of traces by user.
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (user) {
      const activeSpan = tracer.scope().active();

      if (activeSpan) {
        tracer.setUser({
          id: user.sub,
          username: user.username,
        });

        activeSpan.setTag(DdTraceSpanTags.USER_ID, user.sub);
        activeSpan.setTag(DdTraceSpanTags.USERNAME, user.username);
      }
    }

    return next.handle();
  }
}
