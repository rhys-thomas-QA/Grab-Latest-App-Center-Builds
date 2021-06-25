# Grab latest build script
This script is to run before tests to get the latest app builds from Microsoft App Center so you are running your tests against the very latest app build. 
## Install
Install all packages with npm install.  
Setup a .env file with your app center API key with the syntax.  

`MS_APP_CENTER_KEY=`.  
If you are getting a 401 then you dont have the right access permissons to hit the app center api, and will need to contact devops to give you this access.  
Make sure to pass through the name of your app from app center in the function at the bottom of `tests/pullLatestBuilds.js`. This is the app name as seen on the app center web client that has spaces inbetween and not underscores or dashes.  
Run the script with `yarn test` or `node tests/pullLatestBuilds.js`. 
