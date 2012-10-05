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
    , xib = require('./xib')
    , pbxproj = require('./pbxproj')
    , appdelegate = require('./appdelegate')
    , viewcontroller = require('./viewcontroller')
    , exec = require('child_process').exec;

 
/**
 * For iOS
 */

//TODO: Added JSON structure checks to ensure proper conversion
exports.convertToApp = function(inputPath, callback) {
  
  // var renameFiles = ['AppName-Info.plist', 'AppName-Prefix.pch','AppName', 'AppName.xcodeproj', ]
  
  var process = function(input, currentPath) {
    //Continue with the work now on the files
      
    //Rename the files
    
    //Start with AppDelegate
    
    async.series([function(cb) {
      appdelegate.render(input, currentPath, cb);
    },
    function(cb) {
      viewcontroller.render(input, currentPath, cb);
    },
    function(cb) {
      pbxproj.render(input, currentPath, cb);
    }], function(err, result) {
      if (err) { console.log(err); return; }

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
    
    var currentPath = __dirname + '/temp/';
    currentPath += Date.now() + '/' + input.appname;
    fs.mkdirpSync(currentPath);
    
    var appPath = 'iphone';
    
    if (input.device === 1) {
      appPath = 'ipad';
    }
    
    
    var extractCommand = 'unzip ' + __dirname + '/app/' + appPath + '/AppName.zip ' + '-d ' + currentPath;
    exec(extractCommand, function(error, stdout, stderr) {
      if (stderr) { return; }
      process(input, currentPath);
    });
    
    //var zip = new admzip(__dirname + '/app/' + appPath + '/AppName.zip');
    //zip.extractAllTo(currentPath, true);
    
    //Make new temp app
    //set as currentPath
    //-- each of the following have an output file
    //Call XIB Methods
    
    
    
    //Call PBXProj Methods
    //Call AppDelegate Methods
    //Call ViewController Methods
    //Each one of these will write files
    //Zip the temp folder and call the callback with the new url
    // processInput(input);
  });
};
