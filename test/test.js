/*!
 * node-callbackmaybe
 * Copyright(c) 2012 Paul O'Fallon <paul@ofallonfamily.com>
 * MIT Licensed
 */

var CallbackMaybe = require('../index.js');
var should = require('should');

describe('CallbackMaybe', function() {

  beforeEach(function() {
  });

  afterEach(function() {
  });

  describe('with a callback', function() {

    it('should return an array of results', function(done) {
      var values = [1,2,3,4,5];
      var count = 0;

      var aCallback = function(err, list) {
        should.not.exist(err);
        should.exist(list);
        list.should.eql(values);
        done();
      }

      var cbm = new CallbackMaybe(aCallback);
      values.forEach(function(value) {
        cbm.write(value);
        if (++count === values.length) {
          cbm.end();
        }
      });
    });

    it('should handle errors', function(done) {
      var aCallback = function(err, list) {
        should.exist(err);
        should.not.exist(list);
        done();
      }

      var cbm = new CallbackMaybe(aCallback);
      cbm.error(new Error());
    });
    
  });

  describe('without a callback', function() {

    it('should return an EventEmitter', function(done) {
      var values = ["foo","foo","foo"];
      var count = 0;

      var cbm = new CallbackMaybe();
      cbm.on('data', function(chunk) {
        chunk.should.equal("foo");
      });
      cbm.on('end', function(count) {
        count.should.equal(values.length);
        done();
      });
      cbm.on('error', function(err) {
        should.not.exist(err);
        done();
      });

      values.forEach(function(value) {
        cbm.write(value);
        if (++count === values.length) {
          cbm.end();
        }
      });

    });

    it('should handle errors', function(done) {
      var cbm = new CallbackMaybe();
      cbm.on('error', function(err) {
        should.exist(err);
        done();
      });
      cbm.error(new Error());
    });

  });

});
