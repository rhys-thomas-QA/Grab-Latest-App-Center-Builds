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
    const authHeaders = {
        "X-API-Token": `${process.env.MS_APP_CENTER_KEY}`
    }

    if (!fs.existsSync("apps")) {
        fs.mkdirSync("apps");
    };

    const getAllApps = async (appName) => {
        try {
            getAppsFromAppCenter = await request.get("https://api.appcenter.ms/v0.1/apps", {
                headers: authHeaders
            })
        } catch (err) {
            console.log("Response code was 401 - Your app center key was not in your env file or does not have the right permissions")
        }

        indexOfAppInArray = getAppsFromAppCenter.data.map((element) => {
            return element.display_name
        }).indexOf(appName)
        app_name = getAppsFromAppCenter.data[indexOfAppInArray].name;
    }

    const compareAppVersions = async (appName) => {
        try {
            const listOfVersions = await request.get(`https://api.appcenter.ms/v0.1/apps/weareroam/${app_name}/releases/`, {
                headers: authHeaders
            });
            listOfVersions.data.forEach(element => {
                if (element.id > maxValue) {
                    maxValue = element.id
                }
            });
        } catch (err) {
            console.log("Response code was 401 - Your App Center key was not in your .env file or does not have the right permissions");
        }

        if (getAppsFromAppCenter.data[indexOfAppInArray].os == "iOS") {
            if (fs.existsSync(`apps/${appName}.ipa`)) {
                const fd = fs.openSync(`apps/${appName}.ipa`, 'r');
                extract(fd, (info, raw) => {
                    if (!raw){
                        throw new Error ("You may have stopped the download part-way last time and I cant read the meta data. Delete the app in your apps folder and try again.")
                    }
                    currentVersion = raw[0].CFBundleShortVersionString
                });
            }
        } else if (getAppsFromAppCenter.data[indexOfAppInArray].os == "Android") {
            if (fs.existsSync(`apps/${appName}.apk`)) {
                const parser = new AppInfoParser(`apps/${appName}.apk`)
                try {
                    const parserResponse = await parser.parse();
                    currentVersion = parserResponse.versionName
                } catch (err) {
                    throw new Error ("You may have stopped the download part-way last time and I cant read the meta data. Delete the app in your apps folder and try again.")
                }
            }
        }
    }
    const getLatestAppDownloadLink = async () => {
        try {
            appCenterResponse = await request.get(`https://api.appcenter.ms/v0.1/apps/${process.env.ORG_NAME}/${app_name}/releases/${maxValue}`, {
                headers: authHeaders
            })
        } catch (err) {
            console.log("Response code was 404 - Your org name was likely not in your .env file or was invalid");
        }
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
