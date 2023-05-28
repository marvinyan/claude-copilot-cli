import { streamResponse } from '../src';

describe('index', () => {
  describe('myPackage', () => {
    it('should print streaming response', () => {
      const humanInput = 'Hello';

      const result = streamResponse();

      expect(result).toContain('hello');
    });
  });
});
