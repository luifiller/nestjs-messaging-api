import { HttpException, HttpStatus, Logger } from '@nestjs/common';
import { HttpExceptionFilter } from './http-exception.filter';
import { ErrorResponse } from './interface/error-response.interface';

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;
  let mockResponse: any;
  let mockRequest: any;
  let mockHost: any;

  beforeEach(() => {
    jest.spyOn(Logger.prototype, 'error').mockImplementation();

    filter = new HttpExceptionFilter();

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockRequest = {
      url: '/api/v1/test',
      method: 'GET',
      headers: {},
    };

    mockHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
    } as any;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('catch', () => {
    it('should format and return error response for HttpException', () => {
      const exception = new HttpException('Not Found', HttpStatus.NOT_FOUND);

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Not Found',
          path: '/api/v1/test',
          method: 'GET',
          error: 'HttpException',
          timestamp: expect.any(String),
        }),
      );
    });

    it('should handle HttpException with object response', () => {
      const exceptionResponse = {
        message: ['field1 is required', 'field2 must be valid'],
        error: 'Bad Request',
      };
      const exception = new HttpException(
        exceptionResponse,
        HttpStatus.BAD_REQUEST,
      );

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.BAD_REQUEST,
          message: ['field1 is required', 'field2 must be valid'],
          path: '/api/v1/test',
          method: 'GET',
          error: 'HttpException',
          timestamp: expect.any(String),
        }),
      );
    });

    it('should use exception.message as fallback', () => {
      const exception = new HttpException({}, HttpStatus.INTERNAL_SERVER_ERROR);

      jest.spyOn(exception, 'getResponse').mockReturnValue({});

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: exception.message,
        }),
      );

      expect(Logger.prototype.error).toHaveBeenCalled();
    });

    it('should handle class-validator array messages', () => {
      const exceptionResponse = {
        message: [
          'email must be an email',
          'email should not be empty',
          'password must be longer than or equal to 8 characters',
        ],
        error: 'Bad Request',
        statusCode: 400,
      };
      const exception = new HttpException(
        exceptionResponse,
        HttpStatus.BAD_REQUEST,
      );

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.BAD_REQUEST,
          message: [
            'email must be an email',
            'email should not be empty',
            'password must be longer than or equal to 8 characters',
          ],
          error: 'HttpException',
        }),
      );
    });

    it('should handle exception with details', () => {
      const exceptionResponse = {
        message: 'Validation failed',
        details: {
          field: 'email',
          constraint: 'isEmail',
        },
      };
      const exception = new HttpException(
        exceptionResponse,
        HttpStatus.BAD_REQUEST,
      );

      filter.catch(exception, mockHost);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Validation failed',
          details: {
            field: 'email',
            constraint: 'isEmail',
          },
        }),
      );
    });

    it('should set appropriate timestamp format', () => {
      const exception = new HttpException('Error', HttpStatus.BAD_REQUEST);

      filter.catch(exception, mockHost);

      const responseData = mockResponse.json.mock.calls[0][0] as ErrorResponse;
      expect(responseData.timestamp).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
      );
    });
  });
});
