/*!
 * node-callbackmaybe
 * Copyright(c) 2012 Paul O'Fallon <paul@ofallonfamily.com>
 * MIT Licensed
 */

var EventEmitter = require('events').EventEmitter;
var util = require('util');

util.inherits(CallbackMaybe, EventEmitter);

function CallbackMaybe(func, options) {

  var that = this;

  EventEmitter.call(this);

  if (!options) {
    options = {};
  }

  if (options.limit) {
    this.limit = options.limit;
  }

  if ((this.limit === null) || (this.limit > 0)) {
    this.limitReached = false;
  }

  this.writable = true;
  this.count = 0;

  if (typeof func === 'function') {
    var list = [];
    
    this.on('data', function(chunk) {
      list.push(chunk);
    });

    this.on('end', function() {
      func(null,list);
    });

    this.on('error', function(err) {
      func(err);
    });

  }

};

CallbackMaybe.prototype.write = function(chunk) {

  var that = this;

  if (Array.isArray(chunk)) {

    chunk.forEach(function(item) {
      that.write(item);
    });

  } else {
    if (this.writable && (!this.limitReached)) {
      this.count++;
      this.emit('data', chunk);
      if (this.count >= this.limit) {
        this.limitReached = true;
      }
      return true;
    } else {
      return false;
    }
  }
};

CallbackMaybe.prototype.end = function() {
  if (this.writable) {
    this.writable = false;
    this.emit('end', this.count);
  }
};

CallbackMaybe.prototype.error = function(err) {
  if (this.writable) {
    this.writable = false;
    this.emit('error', err);
  }
};

module.exports = CallbackMaybe;