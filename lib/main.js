/*!
 * JSONUI
 * To convert predefined JSON to native mobile components
 */

/**
 * Module Dependencies
 */
 
var fs = require('fs.extra')
    , async = require('async')
    , http = require('http')
    , util = require('util')
    , ejs = require('ejs')
    , xib = require('./src/xib')
    , pbxproj = require('./src/pbxproj')
    , appdelegate = require('./src/appdelegate')
    , viewcontroller = require('./src/viewcontroller')
    , pch = require('./src/pch')
    , exec = require('child_process').exec;


var renameFiles = function(item, callback) {
  var renameCommand = 'mv ' + item.src + ' ' + item.dest;
  exec(renameCommand, function(error, stdout, stderr) {
    if (stderr) { callback(stderr); return; }
    callback(null, 'Done');
  });
};
 
var renderFiles = function(input, currentPath, callback) {
  async.series([function(cb) {
      appdelegate.render(input, currentPath, cb);
    },
    function(cb) {
      viewcontroller.render(input, currentPath, cb);
    },
    function(cb) {
      pbxproj.render(input, currentPath, cb);
    },
    function(cb) {
      pch.render(input, currentPath, cb);
    },
    function(cb) {
      xib.render(input, currentPath, cb);
    },
    function(cb) {
      createArchive(input, currentPath, cb);
    }
    ], function(err, result) {
      if (err) { console.log(err); callback(err); return; }
      callback(null, currentPath + ".zip");
  });
};

var createArchive = function(input, currentPath, callback) {
  var zipCommand = "pushd .; cd " + currentPath + "/..; zip -r " + input.appname + " " + input.appname + "; rm -rf " + currentPath + "; popd";
  exec(zipCommand, function(error, stdout, stderr) {
    if (stderr) { callback(stderr); return; }
    callback(null, 'Done');
  });
};

/**
 * For iOS
 */

//TODO: Added JSON structure checks to ensure proper conversion
exports.convertToApp = function(inputPath, callback) {
  
  // var renameFiles = ['AppName-Info.plist', 'AppName-Prefix.pch','AppName', 'AppName.xcodeproj', ]
  
  var process = function(input, currentPath) {
    //Continue with the work now on the files
      
    var _renameFiles = [
      { src: currentPath + '/AppName/AppName-Info.plist', dest: currentPath + '/AppName/' + input.appname + '-Info.plist'},
      { src: currentPath + '/AppName/AppName-Prefix.pch', dest: currentPath + '/AppName/' + input.appname + '-Prefix.pch'},
      { src: currentPath + '/AppName', dest: currentPath + '/' + input.appname},
      { src: currentPath + '/AppName.xcodeproj', dest: currentPath + '/' + input.appname + '.xcodeproj'}
    ];
      
    //Rename the files to the new appname
    async.forEach(_renameFiles, renameFiles, function(err){
      if (err) { callback(err); return; }
      renderFiles(input, currentPath, callback);
    });
  };
  
  /*
   * Main
   *
   * This is where it all starts - Read input file
   */
   
  fs.readFile(inputPath, 'ascii', function(err, data) {
    if (err) { callback(err, null); return; }
    var input  = JSON.parse(data);
    
    var currentPath = __dirname + '/output/';
    currentPath += Date.now() + '/' + input.appname;
    fs.mkdirpSync(currentPath);
    
    var extractCommand = 'unzip ' + __dirname + '/src/app/AppName.zip ' + '-d ' + currentPath;
    exec(extractCommand, function(error, stdout, stderr) {
      if (stderr) { return; }
      process(input, currentPath);
    });
  });
};
