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

    it('should obey the limit option', function(done) {
      var values = [1,2,3,4,5];
      var count = 0;
      var limit = 4;

      var aCallback = function(err, list) {
        should.not.exist(err);
        should.exist(list);
        list.length.should.equal(limit);
      }

      var cbm = new CallbackMaybe(aCallback, {limit: limit});
      values.forEach(function(value) {
        cbm.write(value);
        if (++count === values.length) {
          cbm.end();
          done();
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

    it('should emit data and end events', function(done) {
      var values = ["foo","foo","foo"];
      var count = 0;

      var cbm = new CallbackMaybe(null);
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

    it('should obey the limit option', function(done) {

      var limit = 2;

      var cbm = new CallbackMaybe(null,{limit: limit});

      cbm.on('end', function(count) {
        should.exist(count);
        count.should.equal(limit);
        done();
      });

      cbm.write("one");
      cbm.write("two");
      cbm.write("three");
      cbm.end();

    });

    it('should stop emitting after an end', function(done) {

      var cbm = new CallbackMaybe(null);

      cbm.on('data', function(chunk) {
        chunk.should.not.equal('three');
      });
      cbm.on('end', function(count) {
        count.should.equal(2);
      });

      cbm.write("one");
      var success = cbm.write("two");
      success.should.be.true;

      cbm.end();

      success = cbm.write("three");
      success.should.be.false;

      done();

    });

    it('should handle errors', function(done) {
      var cbm = new CallbackMaybe(null);
      cbm.on('error', function(err) {
        should.exist(err);
        done();
      });
      cbm.error(new Error());
    });

    it('should stop emitting after an error', function(done) {
      var cbm = new CallbackMaybe();

      cbm.on('data', function(chunk) {
        chunk.should.not.equal('three');
      });
      cbm.on('end', function(count) {
        should.not.exist(count);
      });
      cbm.on('error', function(err) {
        should.exist(err);
      });

      cbm.write("one");
      var success = cbm.write("two");
      success.should.be.true;

      cbm.error(new Error());

      success = cbm.write("three");
      success.should.be.false;

      done();

    });

  });

});
