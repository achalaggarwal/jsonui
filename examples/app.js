var jsonui = require("../");
var fs = require('fs');

fs.readFile(__dirname + '/input.json', 'ascii' , function(err, data) {
  if (err) { console.log(err); return; }
  
  jsonui.convertToApp(JSON.parse(data), null, function(err, outputPath) {
    if (err) { console.log(err); return; }
      console.log(outputPath);
  });
});
