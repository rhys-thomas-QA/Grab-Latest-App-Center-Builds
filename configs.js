require("dotenv").config()
module.exports = {
    android_real_device: {
        host: "0.0.0.0",
        port: 4723,
        platform: "Android",
        newCommandTimeout: 10000,
        app: "app.apk",
        deviceName: "210b8d6b1a047ece",
        platformVersion: "10.0",
        automationName: "Appium",
        platformName: "Android",
        desiredCapabilities: {
            'autoGrantPermissions': 'true'
        }
    },
    android_sim_device: {
        host: "0.0.0.0",
        port: 4723,
        platform: "Android",
        newCommandTimeout: 10000,
        app: "app.apk",
        deviceName: "emulator-5554",
        platformVersion: "11.0",
        automationName: "Appium",
        platformName: "Android",
        desiredCapabilities: {
            'autoGrantPermissions': 'true'
        }
    },
    ios_real_device: {
        host: "0.0.0.0",
        port: 4723,
        platform: "iOS",
        app: "app.ipa",
        desiredCapabilities: {
            automationName: "XCUITest",
            deviceName: "Test iPhone X",
            udid: "a448d596cc91d2d611e40ea01df559e817efd070",
            xcodeOrgId: "M5ZD86AHBS",
            xcodeSigningId: "iPhone Developer",
            platformVersion: "14.4"
        },
    },
    ios_sim_device: {
        app: "app.ipa",
        platform: "iOS",
        desiredCapabilities: {
            deviceName: "iPhone 11 Pro Max",
            automationName: "XCUITest",
            fullContextList: true,
            ensureWebviewsHavePages: true
        },
    },
}