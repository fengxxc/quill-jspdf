import QuillJsPdf from '../../src/index';

describe('testFunction', () => {
  it('should return expected result', () => {
    expect(QuillJsPdf.testFunction(1, 2)).toBe(3);
  });
});