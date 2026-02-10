import { encodeCursor, decodeCursor } from './dynamodb-cursor-transformer';

describe('Cursor Utils', () => {
  describe('encodeCursor', () => {
    it('should encode an object into a base64 string', () => {
      const key = {
        pk: 'USER#123',
        sk: 'MESSAGE#456',
      };

      const result = encodeCursor(key);

      expect(typeof result).toBe('string');
      expect(result).not.toEqual(JSON.stringify(key));
    });
  });

  describe('decodeCursor', () => {
    it('should decode a base64 string back into an object', () => {
      const key = {
        pk: 'USER#123',
        sk: 'MESSAGE#456',
      };

      const encoded = encodeCursor(key);
      const decoded = decodeCursor(encoded);

      expect(decoded).toEqual(key);
    });
  });

  describe('encode + decode (round trip)', () => {
    it('should return the original object after encode and decode', () => {
      const key = {
        sender: 'john.doe',
        createdAt: 1700000000000,
        status: 'SENT',
      };

      const result = decodeCursor(encodeCursor(key));

      expect(result).toEqual(key);
    });
  });

  describe('edge cases', () => {
    it('should encode and decode an empty object', () => {
      const key = {};

      const result = decodeCursor(encodeCursor(key));

      expect(result).toEqual({});
    });

    it('should throw an error when decoding an invalid base64 string', () => {
      const invalidCursor = 'not-a-valid-base64';

      expect(() => decodeCursor(invalidCursor)).toThrow();
    });

    it('should throw an error when decoding a valid base64 but invalid JSON', () => {
      const invalidJsonBase64 = Buffer.from('not-json').toString('base64');

      expect(() => decodeCursor(invalidJsonBase64)).toThrow(SyntaxError);
    });
  });
});
