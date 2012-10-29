/*!
 * JSONUI
 * To convert predefined JSON to native mobile components
 */

/**
 * Module Dependencies
 */
 
var fs = require('fs.extra')
    , path = require('path')
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
  fs.move(item.src, item.dest, function(err) {
    if (err) { callback(err); return; }
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
  var zipCommand = "";
  if (process.platform == 'darwin') {
    zipCommand = "pushd .; cd " + path.join(currentPath,  "..") + "; zip -r " + input.appname + " " + input.appname + "; rm -rf " + currentPath + "; popd";
  }
  else {
    zipCommand = "pushd .; cd " + path.join(currentPath,  "..") + "; 7za a -tzip " + input.appname + ".zip " + input.appname + "; rm -rf " + currentPath + "; popd";
  }
  
  exec(zipCommand, function(error, stdout, stderr) {
    if (stderr) { callback(stderr); return; }
    callback(null, 'Done');
  });
};

/**
 * For iOS
 */

//TODO: Added JSON structure checks to ensure proper conversion
exports.convertToApp = function(inputData, assetPath, callback) {
  var process = function(input, currentPath) {
    //Continue with the work now on the files
    var _renameFiles = [
      { src: path.join(currentPath, 'AppName', 'AppName-Info.plist'), dest: path.join(currentPath, 'AppName', input.appname + '-Info.plist')},
      { src: path.join(currentPath, 'AppName', 'AppName-Prefix.pch'), dest: path.join(currentPath, 'AppName', input.appname + '-Prefix.pch')},
      { src: path.join(currentPath, 'AppName'), dest: path.join(currentPath, input.appname)},
      { src: path.join(currentPath, 'AppName.xcodeproj'), dest: path.join(currentPath, input.appname + '-Prefix.pch')}
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
   * This is where it all starts - Read input data
   */
   
  var input  = inputData;
  var currentPath = path.join(__dirname, 'output');
  currentPath = path.join(currentPath, Date.now(), input.appname);
  fs.mkdirpSync(currentPath);
  
  var extractCommand = 'unzip ' + path.join(__dirname, 'src', 'app', 'AppName.zip') + ' -d ' + currentPath;
  exec(extractCommand, function(error, stdout, stderr) {
    if (stderr) { return; }
    //copy all assets to correct location
    if (assetPath)
      fs.move(assetPath, path.join(currentPath, 'AppName', 'Resources'), function (err) {
        if (err) { callback(err); }
        console.log("Moved");
        process(input, currentPath);
      });
  });
};
