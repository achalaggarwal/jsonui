/*
render FirstViewController.h and FirstViewController.m
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

var generateInterfaceContent = function(objects) {
  var content = '';
  for (var i = objects.length - 1; i >= 0; i--) {
    content += '\n' + '- (IBAction) ' + objects[i].name + 'Tapped:(id) sender;';
  }
  return content;
};

var generateImplementationContent = function(objects) {
  var content = '';
  for (var i = objects.length - 1; i >= 0; i--) {
    content += '\n' + '- (IBAction) ' + objects[i].name + 'Tapped:(id) sender {\n\
      UIAlertView *alert = [[UIAlertView alloc] initWithTitle:@"' + objects[i].name + '" message:@"' + objects[i].name + ' is tapped" delegate:nil cancelButtonTitle:@"Okay" otherButtonTitles:nil];\n\
      [alert show];\n\
    }\n';
  }
  return content;
};

exports.render = function(input, currentPath, callback) {
  
  var interfaceContent = '';
  var implementationContent = '';
  
  var objects = [];
  
  for (var i = input.objects.length - 1; i >= 0; i--) {
    if (input.objects[i].type === 'button') {
      objects.push(input.objects[i]);
    }
  }
  
  currentPath += '/' + input.appname + '/';
  
  renderThis(currentPath + 'FirstViewController.h', {
      AppName             : input.appname,
      interfaceContent    : generateInterfaceContent(objects)
    }, function(err, result) {
      if (err) { callback(err); return;}
      renderThis(currentPath + 'FirstViewController.m', {
        AppName                  : input.appname,
        implementationContent    : generateImplementationContent(objects)
      }, callback);
  });
};
