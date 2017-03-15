'use strict';

var events = require('events'),
  util = require('util'),
  common = require('./common'),
  sumologic = require('../sumologic'),
  stringifySafe = require('json-stringify-safe');

function stringify(msg) {
  var payload;

  try {
    payload = JSON.stringify(msg)
  }
  catch (ex) {
    payload = stringifySafe(msg, null, null, noop)
  }

  return payload;
}

exports.createClient = function (options) {
  return new Sumologic(options);
};

var Sumologic = exports.Sumologic = function (options) {

  if (!options || !options.url) {
    throw new Error('options.url is required.');
  }

  events.EventEmitter.call(this);

  this.url = options.url;
  this.json = options.json || null;
  this.auth = options.auth || null;
  this.sumoName = options.name || null;
  this.sumoHost = options.host || null;
  this.sumoCategory = options.category || null;
  this.proxy = options.proxy || null;
  this.userAgent = 'logs-to-sumologic ' + sumologic.version;

};

util.inherits(Sumologic, events.EventEmitter);

Sumologic.prototype.log = function (msg, callback) {

  var self = this,
    logOptions;

  var isBulk = Array.isArray(msg);

  function serialize(msg) {
    if (msg instanceof Object) {
      return self.json ? stringify(msg) : common.serialize(msg);
    }
    else {
      return self.json ? stringify({message: msg}) : msg;
    }
  }

  msg = isBulk ? msg.map(serialize).join('\n') : serialize(msg);
  msg = serialize(msg);

  logOptions = {
    uri: this.url,
    method: 'POST',
    body: msg,
    proxy: this.proxy,
    headers: {
      host: this.host,
      accept: '*/*',
      'user-agent': this.userAgent,
      'content-type': this.json ? 'application/json' : 'text/plain',
      'content-length': Buffer.byteLength(msg)
    }
  };

  if (this.sumoName) {
    logOptions.headers['X-Sumo-Name'] = this.sumoName;
  }
  if (this.sumoHost) {
    logOptions.headers['X-Sumo-Host'] = this.sumoHost;
  }
  if (this.sumoCategory) {
    logOptions.headers['X-Sumo-Category'] = this.sumoCategory;
  }

  common.sumologic(logOptions, callback, function (res, body) {
    try {
      var result = '';
      try {
        result = JSON.parse(body);
      } catch (e) {
        // do nothing
      }
      self.emit('log', result);
      if (callback) {
        callback(null, result);
      }
    } catch (ex) {
      if (callback) {
        callback(new Error('Unspecified error from Sumologic: ' + ex));
      }
    }
  });

  return this;
};


