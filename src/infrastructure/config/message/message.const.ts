export const MessageConst = {
  ENTITY: {
    MESSAGE: 'MESSAGE',
  },
  EXCEPTION_MESSAGES: {
    MESSAGE_NOT_FOUND: 'Message not found',
    INVALID_QUERY_PARAMS: 'Invalid query parameters',
    MESSAGE_STATUS_ALREADY: 'Message status is already',
  },
  API_DOC: {
    UNAUTHORIZED_RESPONSE: 'Unauthorized access',
    UNAUTHORIZED: 'Unauthorized',

    BAD_REQUEST_RESPONSE: 'Bad request',
    NOT_FOUND_RESPONSE: 'Not Found',
    CONFLICT_RESPONSE: 'Conflict',
    INTERNAL_SERVER_ERROR_RESPONSE: 'Internal server error',

    CREATE_DESCRIPTION: 'Create a new message',
    CREATE_SUCCESS: 'The message has been successfully created',

    GET_BY_ID_DESCRIPTION: 'Get a message by its ID',
    GET_BY_ID_SUCCESS_RESPONSE: 'The message has been successfully retrieved',
    ID_PARAM: 'id',
    ID_PARAM_DESCRIPTION: 'The unique identifier of the message',

    UPDATE_STATUS_DESCRIPTION: 'Update the status of a message',
    UPDATE_SUCCESS_RESPONSE: 'The message status has been successfully updated',
    UPDATE_CONFLICT_RESPONSE:
      'Conflict occurred while updating the message status',
    UPDATE_STATUS_ALREADY_READ: "Message status is already 'READ'",

    QUERY_DESCRIPTION: 'Query messages by sender or date range',
    QUERY_SUCCESS_RESPONSE: 'The messages have been successfully retrieved',
  },
} as const;
