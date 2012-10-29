/*
render FirstViewController.h and FirstViewController.m
*/

var fs = require('fs.extra')
  , path = require('path')
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
    var _object = objects[i];
    _object.name = (_object.name && _object.name.length > 0)? _object.name:'Button'+i;
    content += '\n' + '- (IBAction) ' + _object.name + 'Tapped:(id) sender;';
  }
  return content;
};

var generateImplementationContent = function(objects) {
  var content = '';
  for (var i = objects.length - 1; i >= 0; i--) {
    var _object = objects[i];
    _object.name = (_object.name && _object.name.length > 0)? _object.name:'Button'+i;
    
    content += '\n' + '- (IBAction) ' + _object.name + 'Tapped:(id) sender {\n\
      UIAlertView *alert = [[UIAlertView alloc] initWithTitle:@"' + _object.name + '" message:@"' + _object.name + ' is tapped" delegate:nil cancelButtonTitle:@"Okay" otherButtonTitles:nil];\n\
      [alert show];\n\
    }\n';
  }
  return content;
};

var getButtonObjects = function(objects) {
  var _buttons = [];
  for (var i = 0; i < objects.length; i++) {
    _object = objects[i];
    if (_object.type === 'button') {
      _buttons.push(_object);
    }
    else {
      if (_object.objects !== undefined) {
        _buttons = _buttons.concat(getButtonObjects(_object.objects));
      }
    }
  }
  return _buttons;
};

exports.render = function(input, currentPath, callback) {
  
  var interfaceContent = '';
  var implementationContent = '';
  
  var _buttons = getButtonObjects(input.objects);
  
  currentPath = path.join(currentPath, input.appname);
  
  renderThis(path.join(currentPath, 'FirstViewController.h'), {
      AppName             : input.appname,
      interfaceContent    : generateInterfaceContent(_buttons)
    }, function(err, result) {
      if (err) { callback(err); return;}
      renderThis(path.join(currentPath, 'FirstViewController.m'), {
        AppName                  : input.appname,
        implementationContent    : generateImplementationContent(_buttons)
      }, callback);
  });
};
