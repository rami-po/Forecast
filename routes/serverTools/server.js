/**
 * Created by Rami Khadder on 7/21/2017.
 */
var http = require("http");
var https = require("https");

exports.makeHTTPCall = function(options, body, callback)
{
  var prot = options.port == 443 ? https : http;
  var req = prot.request(options, function(res)
  {
    var output = '';
    console.log(options.host + ':' + res.statusCode);
    res.setEncoding('utf8');

    res.on('data', function (chunk) {
      output += chunk;
    });

    res.on('end', function() {
      try {
        var obj = JSON.parse(output);
        callback(res.statusCode, obj);
      } catch(err) {
        console.log("ERROR??: " + err + ", OUTPUT??: " + output);
        callback(500, {"error": "Error occurred when making server call"})
      }
    });
  });

  req.on('error', function(err) {
    console.log("ERROR WHEN MAKING SERVER CALL! " + err);
    return err;
  });

  if (body !== null){
    req.write(body);
  }

  req.end();
};
