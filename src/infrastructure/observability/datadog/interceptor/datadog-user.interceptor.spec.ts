import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';

import { DatadogUserInterceptor } from './../../../observability/datadog/interceptor/datadog-user.interceptor';
import { default as tracer } from '../dd-tracing';

jest.mock('../dd-tracing', () => ({
  __esModule: true,
  default: {
    setUser: jest.fn(),
    scope: jest.fn(),
  },
}));

describe('DatadogUserInterceptor', () => {
  let interceptor: DatadogUserInterceptor;
  let mockExecutionContext: ExecutionContext;
  let mockCallHandler: CallHandler;
  let mockActiveSpan: any;

  beforeEach(() => {
    interceptor = new DatadogUserInterceptor();

    mockActiveSpan = {
      setTag: jest.fn(),
    };

    (tracer.scope as jest.Mock).mockReturnValue({
      active: jest.fn().mockReturnValue(mockActiveSpan),
    });

    mockCallHandler = {
      handle: jest.fn().mockReturnValue(of({ result: 'success' })),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('intercept', () => {
    it('should be defined', () => {
      expect(interceptor).toBeDefined();
    });

    it('should set user information in Datadog tracer when user is authenticated', () => {
      // Arrange
      const mockUser = {
        sub: 'user-id-123',
        username: 'john.doe',
        email: 'john@example.com',
        roles: ['USER'],
      };

      mockExecutionContext = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({ user: mockUser }),
        }),
      } as any;

      // Act
      interceptor.intercept(mockExecutionContext, mockCallHandler);

      // Assert
      expect(tracer.setUser).toHaveBeenCalledWith({
        id: mockUser.sub,
        username: mockUser.username,
      });
      expect(mockActiveSpan.setTag).toHaveBeenCalledWith(
        'user.id',
        'user-id-123',
      );
      expect(mockActiveSpan.setTag).toHaveBeenCalledWith(
        'user.username',
        'john.doe',
      );
    });

    it('should not call tracer.setUser when user is not authenticated', () => {
      // Arrange
      mockExecutionContext = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({ user: null }),
        }),
      } as any;

      // Act
      interceptor.intercept(mockExecutionContext, mockCallHandler);

      // Assert
      expect(tracer.setUser).not.toHaveBeenCalled();
      expect(mockActiveSpan.setTag).not.toHaveBeenCalled();
    });

    it('should handle requests when there is no active span', () => {
      // Arrange
      (tracer.scope as jest.Mock).mockReturnValue({
        active: jest.fn().mockReturnValue(null),
      });

      const mockUser = {
        sub: 'user-id-123',
        username: 'john.doe',
        email: 'john@example.com',
      };

      mockExecutionContext = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({ user: mockUser }),
        }),
      } as any;

      // Act
      const result = interceptor.intercept(
        mockExecutionContext,
        mockCallHandler,
      );

      // Assert
      expect(result).toBeDefined();
      expect(mockCallHandler.handle).toHaveBeenCalled();
    });
  });
});
