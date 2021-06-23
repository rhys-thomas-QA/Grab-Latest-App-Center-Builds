const request = require('axios')
const dotenv = require("dotenv");
const configs = require("../configs")
const fs = require('fs');
const extract = require('ipa-extract-info');
const AppInfoParser = require('app-info-parser')

dotenv.config();

const getLatestBuilds = async () => {
    let currentVersion;
    let appCenterResponse;
    let newVersion;
    let downloadLink;

    const currentDevice = configs[`${process.env.CONFIG}`]
    const authHeaders = {
        "X-API-Token": `${process.env.MS_APP_CENTER_KEY}`
    }

    if (currentDevice.platform == "iOS") {
        if (fs.existsSync(currentDevice.app)) {
            const fd = fs.openSync(currentDevice.app, 'r');
            extract(fd, function (info, raw) {
                console.log(raw); // the unparsed plist
                currentVersion = raw[0].CFBundleShortVersionString
            });
        }
        appCenterResponse = await request.get(`https://api.appcenter.ms/v0.1/sdk/apps/${process.env.IOS_APP_SECRET}/releases/latest`, {
            headers: authHeaders
        })
        newVersion = appCenterResponse.data.short_version
        downloadLink = appCenterResponse.data.download_url;

    } else if (currentDevice.platform == "Android") {
        if (fs.existsSync(currentDevice.app)) {
            const parser = new AppInfoParser(currentDevice.app)
            const parserResponse = await parser.parse();
            currentVersion = parserResponse.versionName
        }
        appCenterResponse = await request.get(`https://api.appcenter.ms/v0.1/sdk/apps/${process.env.ANDROID_APP_SECRET}/releases/latest`, {
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
        if (currentDevice.platform == "iOS") {
            await downloadFile("ipa", downloadLink);
        } else if (currentDevice.platform == "Android") {
            await downloadFile("apk", downloadLink);
        }
    } else {
        console.log("No newer versions of the app found, you're up to date!")
    }
}

getLatestBuilds()