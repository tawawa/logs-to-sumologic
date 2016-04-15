var https = require('https'),
  util = require('util'),
  request = require('request'),
  sumologic = require('../sumologic');

var common = exports;

var failCodes = common.failCodes = {
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  409: 'Conflict / Duplicate',
  410: 'Gone',
  500: 'Internal Server Error',
  501: 'Not Implemented',
  503: 'Throttled'
};

common.sumologic = function () {
  var args = Array.prototype.slice.call(arguments),
    success = args.pop(),
    callback = args.pop(),
    responded,
    requestBody,
    headers,
    method,
    auth,
    proxy,
    uri;

  if (args.length === 1) {
    if (typeof args[0] === 'string') {
      //
      // If we got a string assume that it's the URI
      //
      method = 'GET';
      uri = args[0];
    }
    else {
      method = args[0].method || 'GET';
      uri = args[0].uri;
      requestBody = args[0].body;
      auth = args[0].auth;
      headers = args[0].headers;
      proxy = args[0].proxy;
    }
  }
  else if (args.length === 2) {
    method = 'GET';
    uri = args[0];
    auth = args[1];
  }
  else {
    method = args[0];
    uri = args[1];
    auth = args[2];
  }

  function onError(err) {
    if (!responded) {
      responded = true;
      if (callback) {
        callback(err)
      }
    }
  }

  var requestOptions = {
    uri: uri,
    method: method,
    headers: headers || {},
    proxy: proxy
  };

  if (auth) {
    requestOptions.headers.authorization = 'Basic ' + new Buffer(auth.username + ':' + auth.password).toString('base64');
  }

  if (requestBody) {
    requestOptions.body = requestBody;
  }

  try {
    request(requestOptions, function (err, res, body) {
      if (err) {
        return onError(err);
      }
      var statusCode = res.statusCode.toString();
      if (Object.keys(failCodes).indexOf(statusCode) !== -1) {
        return onError((new Error('Sumologic Error (' + statusCode + ')')));
      }
      success(res, body);
    });
  }
  catch (ex) {
    onError(ex);
  }
};

common.serialize = function (obj, key) {
  if (obj === null) {
    obj = 'null';
  }
  else if (obj === undefined) {
    obj = 'undefined';
  }
  else if (obj === false) {
    obj = 'false';
  }

  if (typeof obj !== 'object') {
    return key ? key + '=' + obj : obj;
  }

  var msg = '',
    keys = Object.keys(obj),
    length = keys.length;

  for (var i = 0; i < length; i++) {
    if (Array.isArray(obj[keys[i]])) {
      msg += keys[i] + '=[';

      for (var j = 0, l = obj[keys[i]].length; j < l; j++) {
        msg += common.serialize(obj[keys[i]][j]);
        if (j < l - 1) {
          msg += ', ';
        }
      }

      msg += ']';
    }
    else {
      msg += common.serialize(obj[keys[i]], keys[i]);
    }

    if (i < length - 1) {
      msg += ', ';
    }
  }
  return msg;
};

common.clone = function (obj) {
  var clone = {};
  for (var i in obj) {
    clone[i] = obj[i] instanceof Object ? common.clone(obj[i]) : obj[i];
  }
  return clone;
};
