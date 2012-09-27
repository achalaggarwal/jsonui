------------------------------
To add assets to .pbxproj

Generate all assets and place them inside the resources folder inside the app.

Generate 2 numbers for every asset in the following format

ECADCB0016146D590046583E (look at it ECADCB<% current %>16146D590046583E)

for the first number
current starts from 0..49

for the second number (0+count of assets)..(49+count of assets)

call the numbers for each asset identifierA and identifierB
------------------------------

Add in the following sections

/* Begin PBXBuildFile section */
  identifierB /* filename_without_qoutes in Resources */ = {isa = PBXBuildFile; fileRef = identifierA /* filename_without_qoutes */; };
  
  
/* Begin PBXFileReference section */

  identifierA /* filename_without_qoutes */ = {isa = PBXFileReference; lastKnownFileType = image.png; path = "filename_without_qoutes"; sourceTree = "<group>"; };
  


/* Begin PBXGroup section */
    ECD1A2EB161478480002415F /* Resources */ = {
      isa = PBXGroup;
      children = (
        identifierA /* filename_without_qoutes */,
      );
      name = Resources;
      path = AppName/Resources;
      sourceTree = "<group>";
    };

//Appname/Resources is the just the path where this folder items really are
//trailing comma is fine, no parsing error is caused

/* Begin PBXResourcesBuildPhase section */
    ECDA694716143E6600BC9499 /* Resources */ = {
      isa = PBXResourcesBuildPhase;
      buildActionMask = 2147483647;
      files = (
        identifierB /* filename_without_quotes in Resources */,

Also, don't forget to place the file in the app folder itself.
