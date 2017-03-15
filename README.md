# logs-to-sumologic

A client implementation for Sumologic in node.js.

## Usage

Very simple to use. First of all, set up an account with [Sumologic](https://service.us2.sumologic.com)

Create an HTTP Collector endpoint

eg.

![alt tag](img/Sumo_Logic1.jpg)


Now write a few lines of code to call logs-to-sumologic:

```js

const Sumologic = require('logs-to-sumologic');

var collectorCode = 'YOUR_COLLECTOR CODE'

var endpoint = 'YOUR_ENDPOINT'
// 'https://endpoint1.collection.us2.sumologic.com/receiver/v1/http/'

var url = endpoint + collectorCode;

const sumologic = Sumologic.createClient({
  url: url,
  name: "SumoHttpCollector",   // Custom Source Name -  optional
  host: "webapp.com",      // Custom Source Host - optional
  category: "env/host/service" // Custom Source Category - optional
});

/**
 * More info about name,host and category options are in section 
 *  "Other Supported HTTP Headers"
 *  at https://help.sumologic.com/Send_Data/Sources/02Sources_for_Hosted_Collectors/HTTP_Source/Upload_Data_to_an_HTTP_Source
*/

var cb = function (err, res) {
  if (err) {
    // handle error
  }
  // handle success
};


// contrived examples:

// single log message
var log = {test: "test only"};
sumologic.log(JSON.stringify(log), cb);
// or
sumologic.log(log, cb);

// bulk
var logs = [{test1: "test only"}, {test2: "test only"}];
sumologic.log(JSON.stringify(logs), cb);
// or
sumologic.log(logs, cb);

```

Optionally, setup a live tail to your HTTP Collector endpoint

You should see your logs appearing, eg.

![alt tag](img/Sumo_Logic2.jpg)


Done.


## Further information

Please see [here](https://help.sumologic.com/Send_Data/Sources/02Sources_for_Hosted_Collectors/HTTP_Source/Upload_Data_to_an_HTTP_Source) for further information on uploading data to an HTTP Source using Sumologic.
