var jsonui = require("../");

jsonui.convertToApp(__dirname + '/input.json', function(err, outputPath) {
  if (err) { console.log(err); return; }
  console.log(outputPath);
});
