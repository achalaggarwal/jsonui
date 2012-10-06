/*
render pch
*/

var fs = require('fs.extra')
  , ejs = require('ejs');

var renderThis = function(filePath, options, callback) {
  fs.readFile(filePath, 'ascii' , function(err, data) {
    if (err) { callback(err); return; }
    var file = ejs.render(data, options);
    //Write output
    fs.writeFile(filePath, file, 'ascii' , function(err) {
      if(err) {
        callback(err);
      } else {
        callback(null, "Done");
      }
    });
  });
};

exports.render = function(input, currentPath, callback) {
    
  currentPath += '/' + input.appname + '/';
  
  renderThis(currentPath + input.appname + '-Prefix.pch', {
      AppName   : input.appname
    }, callback);
};
