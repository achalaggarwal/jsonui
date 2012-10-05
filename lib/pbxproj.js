var assets = function(objects, array) {
  for (var i = objects.length - 1; i >= 0; i--) {
    if (objects[i].type === 'view') {
      //console.log(objects[i]);
      assets(objects[i].objects, array);
    } else {
      if (objects[i].background) {
        if (objects[i].background.length > 0) {
          array.push({ file: objects[i].background });
        }
      }
      if (objects[i].image) {
        if(objects[i].image.length > 0) {
          array.push({ file: objects[i].image});
        }
      }
    }
  }
};

var generatePBXBuildFile = function(assets) {
  var content = '';
  for (var i = 0; i < assets.length; i++) {
    content += assets[i].base + ' /* ' + assets[i].file + ' */ = {isa = PBXBuildFile; fileRef = ' + assets[i].ref + ' /* ' + assets[i].file + ' */; }; \n';
  }
  return content;
};

var generatePBXFileReference = function(assets) {
  var content = '';
  for (var i = 0; i < assets.length; i++) {
    content += assets[i].ref + ' /* ' + assets[i].file + ' */ = {isa = PBXFileReference; lastKnownFileType = image.png; path = "' + assets[i].file + '"; sourceTree = "<group>"; };\n';
  }
  return content;
};

var generatePBXGroupChildren = function(assets) {
  var content = '';
  for (var i = 0; i < assets.length; i++) {
    content += assets[i].ref + ' /* ' + assets[i].file +' */,\n';
  }
  return content;
};

var generatePBXResourcesBuildPhaseFiles = function(assets) {
  var content = '';
  for (var i = 0; i < assets.length; i++) {
    content += assets[i].base + ' /* ' + assets[i].file + ' in Resources */,\n';
  }
  return content;
};

exports.render = function(input, currentPath, callback) {
  
  var _assets = [];
  assets(input.objects, _assets);
  
  var baseCount = 0;
  
  //TODO: Generate Base Reference IDs for all assets - limited to 49 assets for now
  for (var i = _assets.length - 1; i >= 0; i--) {
    _assets[i].ref = baseCount < 10 ? 'ECADCB0' + baseCount + '16146D590046583E':'ECADCB' + baseCount + '16146D590046583E';
    _assets[i].base = baseCount + _assets.length < 10 ? 'ECADCB0' + (baseCount + _assets.length)  + '16146D590046583E':'ECADCB' + (baseCount + _assets.length) + '16146D590046583E';
    baseCount++;
  }
  
  var PBXBuildFile = generatePBXBuildFile(_assets);
  var PBXFileReference = generatePBXFileReference(_assets);
  var PBXGroupChildren = generatePBXGroupChildren(_assets);
  var PBXResourcesBuildPhaseFiles = generatePBXResourcesBuildPhaseFiles(_assets);
  
  console.log(PBXResourcesBuildPhaseFiles);
  
  callback(null, 'Done');
};
