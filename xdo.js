
var Promise = require('bluebird');

var parseArguments = function(args) {
  var result = null;
  var context = null;
  var callback = null;
  var callbackArguments = null;
  
  if (typeof args[0] === 'number') {
    result = args.shift();
  }
  if (typeof args[0] === 'object' && !(args[0] instanceof Array)) {
    context = args.shift();
  }
  if (typeof args[0] === 'function') {
    callback = args.shift();
  }
  if (args[0] instanceof Array && callback !== null) {
    callbackArguments = args.shift();
  }
  
  if (callback === null) {
    throw Error('Expected function in arguments');
  }
  return [{
    result: result,
    context: context === null ? {} : context,
    callback: callback,
    arguments: callbackArguments === null ? [] : callbackArguments,
  }].concat(args.length ? parseArguments(args) : []);
};

var argumentsToArray = function(args) {
  var output = [];
  for (var i = 0; i < args.length; ++i) {
    output.push(args[String(i)]);
  }
  return output;
};

var xdo = function() {
  var args = argumentsToArray(arguments);
  var actions = parseArguments(args);
  var storage = {};
  return Promise.resolve(actions).map(function(action) {
    for (var i = 0; i < action.arguments.length; ++i) {
      var x = action.arguments[i];
      if (typeof x === 'number') {
        action.arguments[i] = storage[String(x)];
      }
    }
    var result = action.callback.apply(action.context, action.arguments);
    return Promise.resolve(result).then(function(result) {
      if (action.result !== null) {
        storage[String(action.result)] = result;
      }
      return result;
    });
  }, {concurrency: 1}).then(function(results) {
    return results.pop();
  });
};

module.exports = xdo;
