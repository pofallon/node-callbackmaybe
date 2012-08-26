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

    it('should handle arrays', function(done) {
      var values = ['a','b','c','d','e','f'];

      var aCallback = function(err, list) {
        should.not.exist(err);
        should.exist(list);
        list.should.eql(list);
        done();
      }

      var cbm = new CallbackMaybe(aCallback);
      cbm.write(values.slice(0,5));
      cbm.write(values[5]);
      cbm.end();
    });

    it('should handle arrays above limit', function(done) {
      var values = [1,2,3,4,5];
      var limit = 4;

      var aCallback = function(err, list) {
        should.not.exist(err);
        should.exist(list);
        list.should.eql(values.slice(0,limit));
        done();
      }

      var cbm = new CallbackMaybe(aCallback, {limit:limit});
      cbm.write(values);
      cbm.end();

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

    it('should handle arrays', function(done) {

      var cbm = new CallbackMaybe(null);
      var values = [1,2,3,4,5];
      var results = [];

      cbm.on('data', function(value) {
        results.push(value);
      });

      cbm.on('end', function(count) {
        count.should.equal(values.length);
        results.should.eql(values);
        done();
      });

      var success = cbm.write(values);
      cbm.end();

      success.should.equal(true);

    });

    it('should handle arrays above limit', function(done) {

      var values = ['a','b','c','d','e','f'];
      var results = [];
      var limit = 4;

      var cbm = new CallbackMaybe(null,{limit:limit});

      cbm.on('data', function(value) {
        results.push(value);
      });

      cbm.on('end', function(count) {
        var test = values.slice(0, limit);
        count.should.equal(test.length);
        results.should.eql(test);
        done();
      });

      var success = cbm.write(values);
      cbm.end();

      success.should.equal(false);

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
