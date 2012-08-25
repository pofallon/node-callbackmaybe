# node-callbackmaybe
A module that makes it easy to support both event emitters and callbacks in your node.js API methods.

[![Build Status](https://secure.travis-ci.org/pofallon/node-callbackmaybe.png?branch=master)](http://travis-ci.org/pofallon/node-callbackmaybe)

## Usage

```javascript

var CallbackMaybe = require('callbackmaybe');

YourModule.prototype.someMethod(param, callback) {

  var cbm = new CallbackMaybe(callback, options);

  anEmittingFunction().on('foo', function(foo) {
    cbm.write('Do something with ' + foo);
  }).on('end', function() {
    cbm.end();
  }).on('error', function(err) {
    cbm.error(err);
  });

  return(cbm);

};


```

In the above example, if `someMethod` is passed a callback, the callback will be invoked with an array of the items written via `cbm.write()`.  The callback will be invoked with an error if `cbm.error()` is called.

With or without a callback, an EventEmitter is returned which will emit a `data` event for each item written and an `end` event with a count of items emitted.  An `error` event is emitted if `cbm.error()` is called.

A method implemented as above will support the following access methods:

```javascript

yourModule.someMethod(function(err, results) {
  // an array of results or an error
});

yourModule.someMethod().on('data', function(data) {
  // each result, one at a time
});

yourModule.someMethod().on('end', function(count) {
  // An easy way to get a count of results
});

```

You can present the same interface options even if you only have access to an array internally:

```javascript

YourModule.prototype.anotherMethod(param, callback) {

  var cbm = new CallbackMaybe(callback, options);

  aListFunction(function(results) {
    cbm.write(results);
    cbm.end();
  });

  return(cbm);

};

```

`anotherMethod` will have the same access methods as `someMethod` above.

Currently only one `option` is supported:

* limit - the maximum number of items to emit or pass to the callback.  Calls to `write` after the limit is reached will return `false`.

## Install

<pre>
  npm install callbackmaybe
</pre>

## Dependencies

This library has no production dependencies, only the following test dependencies:

* [visionmedia/mocha](/visionmedia/mocha)
* [visionmedia/should.js](/visionmedia/should.js)
