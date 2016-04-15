'use strict';

var sumologic = exports;

sumologic.version = require('../package.json').version;
sumologic.createClient = require('./sumologic/client').createClient;

