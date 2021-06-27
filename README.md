# Grab latest build script
This script is to run before tests to get the latest app builds from Microsoft App Center so you are running your tests against the very latest app build. 
## Install
Install all packages with npm install.
Setup a .env file with your app center API key with the syntax.  
`MS_APP_CENTER_KEY=.`  
To call the function to get the apps you can do the following:  
`var appCenter = require("@rhysiet/grab-latest-app-center-build")`  
`appCenter.getLatestBuilds("My App as named in App Center")`  

If you are getting a 401 then you dont have the right access permissons to hit the app center api, and will need to contact devops to give you this access.
