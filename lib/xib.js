/*
render pbxproj
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

/**
 * Empty vars when no objects are added
 */
 
var integratedClassDependencies = ""
  , landscape = 2
  , targetRuntimeIdentifier = ""
  , NSSubviewArray = ""
  , NSFrame_Device = ""
  , connectionRecords = ""
  , objectRecords = ""
  , baseObjectRecordArray = ""
  , flattenedProperties = ""
  , actions = ""
  , actionInfosByName = "";

/**
* Object Dependencies - Required to define what all classes are used for each individual object
*/

var objectDependencies = {
  "button"    : ["IBUIButton"],
  "view"      : ["IBUIView"],
  "label"     : ["IBUILabel"],
  "image"     : ["IBUIImageView"],
  "textfield" : ["IBUITextField"]
};

/**
 * object reference can start from 102 and increase incrementally, object id can start from 2
 */

var globalObjectReferenceCount = 291373211;
var globalObjectIDCount = 2;

/**
 * initial parent reference, if view, then change the parent reference of subviews
 */
var parent_reference = 191373211;

/**
 * Function
 *
 * Helper - Get NSColor
 * Process all Colors in the Objects
 * "keyname" : [1.0, 1.0, 1.0, 1.0]
 */

var getNSColorForRGBA = function(color) {
  var colorString = color[0] + " " + color[1] + " " + color[2];
  if (color[3] < 1) {
    colorString += " " + color[3];
  }

  var tempString = new Buffer(colorString).toString('base64');
  tempString = tempString.replace(/=/g, "");

  //string should end with AA no matter what
  var regex=/AA$/;
  while(!regex.test(tempString)) {
    tempString += "A";
  }
  return tempString;
};

var processObjectColors = function(objects) {
  var _object;
  for (var i = objects.length - 1; i >= 0; i--) {
    _object = objects[i];
    var _keys = Object.keys(_object);
    for (var j = _keys.length - 1; j >= 0; j--) {
      var regex=/color/g;
      if (regex.test(_keys[j])) {
        _object["NS" + _keys[j]] = getNSColorForRGBA(_object[_keys[j]]);
      }
    }
  }
};

/**
 * Function
 *
 * integratedClassDependencies - just set of all unique classes
 * Get all class dependencies based on the input objects
 */

var getIntegratedClassDependencies = function(objects) {
  var _object;
  var _integratedClassDependencies = "";
  for (var i = 0; i < objects.length; i++) {
    _object = objects[i];
    for (var j = 0; j < (objectDependencies[_object.type]).length; j++) {
      _integratedClassDependencies += "<string>"+ (objectDependencies[_object.type])[j] +"</string>";
      if (_object.objects !== undefined) {
        _integratedClassDependencies += getIntegratedClassDependencies(_object.objects);
      }
    }
  }
  return _integratedClassDependencies;
};

/*
 * Function
 *
 * Make the NSSubViewArray from Objects
 * NSSubviewArray - made up of objects
 * first create template for all objects and then render with data in them and store.
 */

var makeNSSubViewArray = function(objects, parent_reference) {

  if (objects.length === 0) { return ""; }

  var _object;
  var _NSSubviewArrayObjects = "";

  for (var i = 0; i < objects.length; i++) {
    _object = objects[i];

    for (var j = 0; j < (objectDependencies[_object.type]).length; j++) {
      _object["object_id"] = globalObjectIDCount;
      globalObjectIDCount += 3; //this is 3 as there was a conflict in the connectionID which uses this id as base reference
      _object["object_reference"] = globalObjectReferenceCount;
      globalObjectReferenceCount++;
      _object["parent_reference"] = parent_reference;

      _object["NSSubviewArray"] = "";
      if (_object.objects !== undefined) {
        _object["NSSubviewArray"] = makeNSSubViewArray(_object.objects, _object["object_reference"]);
      }

      _object["targetRuntimeIdentifier"] = targetRuntimeIdentifier;

      var _filePath = __dirname + "/views/components/" +(objectDependencies[_object.type])[j] + "/object.ejs";
      var _objectFile = fs.readFileSync(_filePath, 'ascii');

      _NSSubviewArrayObjects += ejs.render(_objectFile, _object);
    }
  }
  var _base = fs.readFileSync(__dirname + '/views/NSSubviewsArray.ejs', 'ascii');
  var output = ejs.render(_base, {
      NSSubviewArrayObjects              : _NSSubviewArrayObjects
    });
  return output;
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
        _buttons.concat(getButtonObjects(_object.objects));
      }
    }
  }
  return _buttons;
};

var makeConnectionRecords = function(objects) {
  var _object;
  var _connectionRecords = "";
  for (var i = 0; i < objects.length; i++) {
    _object = objects[i];
    var _base = fs.readFileSync(__dirname + '/views/connectionRecord.ejs', 'ascii');
    _connectionRecords += ejs.render(_base, _object);
  }
  return _connectionRecords;
};

var makeActions = function(objects) {
  if (objects.length === 0) { return ""; }
  
  var _object;
  var _actions = '<dictionary class="NSMutableDictionary" key="actions">';
  for (var i = 0; i < objects.length; i++) {
    _object = objects[i];
    var _base = fs.readFileSync(__dirname + '/views/action.ejs', 'ascii');
    _actions += ejs.render(_base, _object);
  }
  
  _actions += '</dictionary>';
  return _actions;
};

var makeActionInfosByName = function(objects) {
  if (objects.length === 0) { return ""; }
  
  var _object;
  var _actionInfos = '<dictionary class="NSMutableDictionary" key="actionInfosByName">';
  for (var i = 0; i < objects.length; i++) {
    _object = objects[i];
    var _base = fs.readFileSync(__dirname + '/views/actioninfo.ejs', 'ascii');
    _actionInfos += ejs.render(_base, _object);
  }
  _actionInfos += '</dictionary>';
  return _actionInfos;
};

/*
 * Function
 *
 * objectRecords - made up of object references - with object, parent, name
 *
 * object_id
 * object_reference
 * parent_reference
 * name
 * children
 */
 
var makeObjectRecords = function(objects) {
  var _object;
  var _objectRecords = "";
  for (var i = 0; i < objects.length; i++) {
    _object = objects[i];
    var _base = fs.readFileSync(__dirname + '/views/objectRecord.ejs', 'ascii');

    var _objectRecordSubArray = "";
    if (_object.objects !== undefined) {
      for (var k = _object.objects.length - 1; k >= 0; k--) {
        _objectRecordSubArray += "<reference ref=\"" + _object.objects[k].object_reference + "\"/>";
      }
      _objectRecords += makeObjectRecords(_object.objects);
    }
    _object["objectRecordSubArray"] = _objectRecordSubArray;
    _objectRecords += ejs.render(_base, _object);
  }
  return _objectRecords;
};

var makeBaseObjectRecords = function(objects) {
  var _object;
  var _baseObjectRecordArray = "";
  for (var i = 0; i < objects.length; i++) {
    _object = objects[i];
    _baseObjectRecordArray += "<reference ref=\"" + _object.object_reference + "\"/>";
  }
  return _baseObjectRecordArray;
};

/*
 * Function
 *
 * flattenedProperties - simple single line with object id
 *
 * object_id
 */

var makeFlattenedProperties = function(objects) {
  var _object;
  var _flattenedProperties = "";
  for (var i = 0; i < objects.length; i++) {
    _object = objects[i];
    for (var j = 0; j < (objectDependencies[_object.type]).length; j++) {

      var _base = fs.readFileSync(__dirname + '/views/flattenedProperties.ejs', 'ascii');
      _flattenedProperties += ejs.render(_base, _object);

      if (_object.objects !== undefined) {
        _flattenedProperties += makeFlattenedProperties(_object.objects);
      }
    }
  }
  return _flattenedProperties;
};


exports.render = function(input, currentPath, callback) {
  
  var is_iPad = input.device%2;
  var is_landscape = false; //landscape = 3, portrait = 2
  
  var is_Navbar = false;
  var top_height = 20;
  
  if (input.navbar) {
    is_Navbar = true;
    top_height += 44;
  }

  if (input.width > input.height) {
    is_landscape = true;
  }
  
  //Check if iPhone or iPad
  if (is_iPad) {
    targetRuntimeIdentifier = "IBIPadFramework";
    
    NSFrame_Device = "{{0, " + top_height + "}, {768, 1004}}";
    if (is_landscape) {
      NSFrame_Device = "{{0, " + top_height + "}, {1024, 748}}";
      landscape = 3;
    }
  }
  else {
    targetRuntimeIdentifier = "IBCocoaTouchFramework";
    NSFrame_Device = "{{0, " + top_height + "}, {320, 460}}";
    if (is_landscape) {
      NSFrame_Device = "{{0, " + top_height + "}, {480, 300}}";
      landscape = 3;
    }
  }
  
  processObjectColors(input.objects);
  integratedClassDependencies = getIntegratedClassDependencies(input.objects);
  NSSubviewArray = makeNSSubViewArray(input.objects, parent_reference);
  
  var _buttons = getButtonObjects(input.objects);
  connectionRecords = makeConnectionRecords(_buttons);
  actions = makeActions(_buttons);
  actionInfosByName = makeActionInfosByName(_buttons);
  
  objectRecords = makeObjectRecords(input.objects);
  baseObjectRecordArray = makeBaseObjectRecords(input.objects);
  flattenedProperties = makeFlattenedProperties(input.objects);
   
  currentPath += '/' + input.appname + '/';
  
  renderThis(currentPath + 'FirstViewController.xib', {
      is_iPad                     : is_iPad,
      landscape                   : landscape,
      is_Navbar                   : is_Navbar,
      integratedClassDependencies : integratedClassDependencies,
      targetRuntimeIdentifier     : targetRuntimeIdentifier,
      NSSubviewArray              : NSSubviewArray,
      NSFrame_Device              : NSFrame_Device,
      connectionRecords           : connectionRecords,
      objectRecords               : objectRecords,
      baseObjectRecordArray       : baseObjectRecordArray,
      flattenedProperties         : flattenedProperties,
      globalObjectIDCount         : globalObjectIDCount,
      actions                     : actions,
      actionInfosByName           : actionInfosByName
    }, callback);
};
