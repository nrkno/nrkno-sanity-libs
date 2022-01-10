import { typesafeObjectSchema } from './basic-use';

describe('basic-use', () => {
  it('should compile with jest', () => {
    expect(typesafeObjectSchema).toBeDefined();
  });
});
