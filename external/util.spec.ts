import { expect } from 'chai';
import 'mocha';
import * as util from './util';

describe('util', () => {
  describe('flatten', () => {
    it('should flatten single nested object', () => {
      const obj = { test: { nested: 0 } };

      const result = util.flatten(obj);

      expect(result).to.have.property('test.nested');
    });

    it('should flatten multiple nested objects', () => {
      const obj = { test: { nested: { nested2: 0 } } };

      const result = util.flatten(obj);

      expect(result).to.have.property('test.nested.nested2');
    });

    it('should flatten array', () => {
      const obj = { arr: [1, 2, 3] };

      const result = util.flatten(obj);

      expect(result).to.have.property('arr[0]');
      expect(result).to.have.property('arr[1]');
      expect(result).to.have.property('arr[2]');
    });

    it('should serialize to bool', () => {
      const obj = { test: true };

      const result = util.flatten(obj);

      expect(result.test).to.equal('true');
    });
  });
});
