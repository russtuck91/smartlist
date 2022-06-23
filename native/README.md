# Smartlist Native

## Local environment setup

https://reactnative.dev/docs/environment-setup

Follow steps for **React Native CLI Quickstart** (not **Expo CLI Quickstart**)

Stop before the steps for **Creating a new application**

## Running locally

### `npm start`

Run React Native's Metro server. Need to keep this running while running the React Native app on an emulator.

### `npm run android`

Run the app on an emulated Android device.

### `npm run ios`

Run the app on an emulated iOS device.

## Build for a release to the app store

### `npm run build:android`

Build the Android app and produce the `.aab` (Android App Bundle) file for distribution in the Play Store.

The generated AAB file can be found under `android/app/build/outputs/bundle/release/app-release.aab`

