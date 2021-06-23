# Grab latest build script
This script is to run before tests to get the latest app builds from Microsoft App Center so you are rubning your tests against the very latest app build. 
## Install
Install all packages with npm install. 
Make sure you have your environment variables set up with your Microsoft app center api key, and your app secrets.
Run the script with `yarn pretest` or `node tests/pullLatestBuilds.js`. 
