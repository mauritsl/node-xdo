
var chai = require('chai');
chai.config.includeStack = true;
var expect = chai.expect;
var Promise = require('bluebird');

var $do = require('../xdo.js');

describe('Execute', function() {
  it('can execute two promises', function() {
    var state = 0;
    var a = function() {
      Promise.delay(20).then(function() { state = 1; });
    };
    var b = function() {
      return Promise.resolve().then(function() {
        if (state !== 0) {
          throw Error('State should be 1');
        }
        state = 2;
      });
    };
    return $do(a, b).then(function() {
      expect(state).to.equal(2);
    });
  });
  
  it('can mix promises and simple functions', function() {
    var state = 0;
    var a = function() {
      ++state;
    };
    var b = function() {
      return Promise.resolve().then(function() {
        ++state;
      });
    };
    return $do(a, b).then(function() {
      expect(state).to.equal(2);
    });
  });
  
  it('can pass arguments to function', function() {
    var value = 0;
    var fn = function(_value) {
      value = _value;
    };
    return $do(fn, ['test']).then(function() {
      expect(value).to.equal('test');
    });
  });
  
  it('will return result of last function', function() {
    var a = function() {
      return 1;
    };
    var b = function() {
      return 2;
    };
    return $do(a, b).then(function(result) {
      expect(result).to.equal(2);
    });
  });
  
  it('can pass result to next function', function() {
    var a = function() {
      return 1;
    };
    var b = function(x) {
      return x + 2;
    };
    return $do(
      1, a,
      b, [1]
    ).then(function(result) {
      expect(result).to.equal(3);
    });
  });
  
  
});
