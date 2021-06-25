const request = require('axios')
const dotenv = require("dotenv");
const fs = require('fs');
const extract = require('ipa-extract-info');
const AppInfoParser = require('app-info-parser')

dotenv.config();

const getLatestBuilds = async (appName) => {
    let currentVersion;
    let appCenterResponse;
    let newVersion;
    let downloadLink;

    if (!fs.existsSync("apps")) {
        fs.mkdirSync("apps");
    };

    const authHeaders = {
        "X-API-Token": `${process.env.MS_APP_CENTER_KEY}`
    }
    const getAppsFromAppCenter = await request.get("https://api.appcenter.ms/v0.1/apps", {
        headers: authHeaders
    })
    if (getAppsFromAppCenter.status == 401) {
        throw "You dont have the right access permissions with app center API key - contact your admin to give you more permissions"
    }
    //Leave this console log in so user can see exactly what the app display name is called
    // console.log(getAppsFromAppCenter.data);

    const indexOfAppInArray = getAppsFromAppCenter.data.map((element) => {
        return element.display_name
    }).indexOf(appName)
    const appSecret = getAppsFromAppCenter.data[indexOfAppInArray].app_secret;

    if (getAppsFromAppCenter.data[indexOfAppInArray].os == "iOS") {
        if (fs.existsSync(`apps/${appName}.ipa`)) {
            const fd = fs.openSync(`apps/${appName}.ipa`, 'r');
            extract(fd, function (info, raw) {
                currentVersion = raw[0].CFBundleShortVersionString
            });
        }
        appCenterResponse = await request.get(`https://api.appcenter.ms/v0.1/sdk/apps/${appSecret}/releases/latest`, {
            headers: authHeaders
        })
        newVersion = appCenterResponse.data.short_version
        downloadLink = appCenterResponse.data.download_url;

    } else if (getAppsFromAppCenter.data[indexOfAppInArray].os == "Android") {
        if (fs.existsSync(`apps/${appName}.apk`)) {
            const parser = new AppInfoParser(`apps/${appName}.apk`)
            const parserResponse = await parser.parse();
            currentVersion = parserResponse.versionName
        }
        appCenterResponse = await request.get(`https://api.appcenter.ms/v0.1/sdk/apps/${appSecret}/releases/latest`, {
            headers: authHeaders
        });
        newVersion = appCenterResponse.data.short_version
        downloadLink = appCenterResponse.data.download_url;
    }

    const downloadFile = async (fileExtension, url) => {

        const file = fs.createWriteStream(`./apps/${appCenterResponse.data.app_display_name}.${fileExtension}`);

        const streamResponse = await request({
            url,
            method: 'GET',
            responseType: 'stream'
        });

        // Write data
        streamResponse.data.pipe(file);

        file.on('finish', () => console.log("Finished"));
        file.on('error', () => console.error("Error while downloading"));
    }

    if (currentVersion != newVersion) {
        console.log(`Current version on your machine is ${currentVersion}, newer version ${newVersion} is available - downloading latest version`)
        if (getAppsFromAppCenter.data[indexOfAppInArray].os == "iOS") {
            await downloadFile("ipa", downloadLink);
        } else if (getAppsFromAppCenter.data[indexOfAppInArray].os == "Android") {
            await downloadFile("apk", downloadLink);
        }
    } else {
        console.log("No newer versions of the app found, you're up to date!")
    }
}

getLatestBuilds("YOUR APP NAME")
