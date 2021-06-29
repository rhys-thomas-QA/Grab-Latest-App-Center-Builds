# Grab latest build script
This script is to run before tests to get the latest app builds from Microsoft App Center so you are running your tests against the very latest app build. 
## Install
Install all packages with npm install.
Setup a .env file with your app center API key and organisation name with the syntax:
```
MS_APP_CENTER_KEY=
ORG_NAME=
```
If you are unsure of what your org name is, use this guide from Microsoft:
| Owner         | URL                                                             | Owner Name     | App Name          |
| ------------- | --------------------------------------------------------------- | -------------- | ----------------- |
| User          | https://appcenter.ms/users/AlexLerxst/apps/Caravan-01           | AlexLerxst     | Caravan-01        |
| Org           | https://appcenter.ms/orgs/BallardFlowers/apps/BouquetOrders-app | BallardFlowers | BouquetOrders-app |

To call the function to get the apps you can do the following:
```
const appCenter = require("@rhysiet/grab-latest-app-center-build");
appCenter.getLatestBuilds("My App as named in App Center");
```  
Make sure that this is the app name with spaces and capitalised, exactly how you see it in the app center web client. This is also known as the `display_name` if you hit the api manually, do not use `name`. 

If you are getting a 401 then you dont have the right access permissons to hit the app center api, and will need to contact devops to give you this access.
