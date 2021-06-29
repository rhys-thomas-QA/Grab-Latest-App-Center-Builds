const request = require('axios')
const dotenv = require("dotenv");
const fs = require('fs');
const extract = require('ipa-extract-info');
const AppInfoParser = require('app-info-parser')
const ora = require('ora');

dotenv.config();

exports.getLatestBuilds = async (appName) => {
    let currentVersion;
    let appCenterResponse;
    let newVersion;
    let downloadLink;
    let app_name;
    let maxValue = 0;
    let getAppsFromAppCenter;
    let indexOfAppInArray;

    if (!fs.existsSync("apps")) {
        fs.mkdirSync("apps");
    };

    const authHeaders = {
        "X-API-Token": `${process.env.MS_APP_CENTER_KEY}`
    }
    const getAllApps = async (appName) => {
        getAppsFromAppCenter = await request.get("https://api.appcenter.ms/v0.1/apps", {
            headers: authHeaders
        })
        indexOfAppInArray = getAppsFromAppCenter.data.map((element) => {
            return element.display_name
        }).indexOf(appName)
        app_name = getAppsFromAppCenter.data[indexOfAppInArray].name;
    }

    const compareAppVersions = async () => {
        const listOfVersions = await request.get(`https://api.appcenter.ms/v0.1/apps/weareroam/${app_name}/releases/`, {
            headers: authHeaders
        });

        listOfVersions.data.forEach(element => {
            if (element.id > maxValue) {
                maxValue = element.id
            }
        })

        if (getAppsFromAppCenter.data[indexOfAppInArray].os == "iOS") {
            if (fs.existsSync(`apps/${appName}.ipa`)) {
                const fd = fs.openSync(`apps/${appName}.ipa`, 'r');
                extract(fd, (info, raw) => {
                    currentVersion = raw[0].CFBundleShortVersionString
                });
            }
        } else if (getAppsFromAppCenter.data[indexOfAppInArray].os == "Android") {
            if (fs.existsSync(`apps/${appName}.apk`)) {
                const parser = new AppInfoParser(`apps/${appName}.apk`)
                const parserResponse = await parser.parse();
                currentVersion = parserResponse.versionName
            }
        }
    }
    const getLatestAppDownloadLink = async () => {
        appCenterResponse = await request.get(`https://api.appcenter.ms/v0.1/apps/${process.env.ORG_NAME}/${app_name}/releases/${maxValue}`, {
            headers: authHeaders
        })
        newVersion = appCenterResponse.data.short_version
        downloadLink = appCenterResponse.data.download_url;
    }

    const downloadFile = async (fileExtension, url) => {
        const throbber = ora(`Downloading version ${newVersion}`).start();
        const file = fs.createWriteStream(`./apps/${appCenterResponse.data.app_display_name}.${fileExtension}`);
        const streamResponse = await request.get(url, {
            responseType: 'stream'
        });
        streamResponse.data.pipe(file);

        file.on('finish', () => throbber.stopAndPersist({
            text: `Finished downloading version ${newVersion}!`,
        }));
        file.on('error', () => console.error("Error while downloading"));

    }
    await getAllApps(appName);
    await compareAppVersions(appName);
    await getLatestAppDownloadLink()
    if (currentVersion != newVersion) {
        console.log(`Current version on your machine is ${currentVersion}, newer version ${newVersion} is available`)
        if (getAppsFromAppCenter.data[indexOfAppInArray].os == "iOS") {
            await downloadFile("ipa", downloadLink);
        } else if (getAppsFromAppCenter.data[indexOfAppInArray].os == "Android") {
            await downloadFile("apk", downloadLink);
        }
    } else {
        console.log("No newer versions of the app found, you're up to date!")
    }
}
