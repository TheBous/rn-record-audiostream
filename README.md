# SuperHumans

## Description

SuperHumans is a mobile application built using Expo. Follow the instructions below to set up the development environment and run the app.

## Prerequisites

Make sure you have Node.js installed on your machine. You can download it from [here](https://nodejs.org/).

### Install Expo and EAS CLI

Before getting started, install Expo CLI and EAS CLI globally on your machine. Run the following commands:

```bash
npm install -g expo-cli eas-cli
```

### Login to Expo

Once installed, log in to Expo using the EAS CLI:

```bash
eas login
```

Follow the instructions on the command line to complete the login process.

### Installing Ruby and Bundler

1. **Install rbenv** (if you don’t already have it):

   ```bash
   brew install rbenv
   ```

2. **Configure rbenv**:

   Open the appropriate configuration file with an editor, such as:

   ```bash
   nano ~/.zshrc
   ```

   Add the following line at the end of the file:

   ```bash
   eval "$(rbenv init -)"
   ```

   Save and close the file, then run:

   ```bash
   source ~/.zshrc
   ```

3. **Install Ruby 3.2**:

   ```bash
   rbenv install 3.2.0
   rbenv global 3.2.0
   ```

4. **Verify the Ruby version**:

   ```bash
   ruby -v
   ```

   You should see something like:

   ```bash
   ruby 3.2.0
   ```

5. **Install Bundler**:

   If you don’t have Bundler installed, use the following command to manage project dependencies:

   ```bash
   gem install bundler
   ```

6. **Install the project's gems**:

   Once Ruby 3.2 is configured and Bundler is installed, run this command to install the required gems (including Fastlane):

   ```bash
   bundle install
   ```

   This command will analyze the Gemfile and install the required gems, including Fastlane, in the specified versions.

### Using Fastlane with Bundler

Now that Fastlane is installed through Bundler, you can run Fastlane using the `bundle exec` prefix to ensure you're using the correct version installed in your project:

```bash
bundle exec fastlane --version
```

### Downloading iOS Components via Xcode

Before building for iOS, make sure you have downloaded the necessary iOS components via Xcode:

1. Open Xcode.
2. Go to **Xcode > Preferences > Components**.
3. In the **Components** section, you will see a list of available simulators and SDKs. 
4. If the iOS 18.0 SDK is available, download it from here.

### Running the SuperHumans App

To launch the SuperHumans app, use the following command:

```bash
npx expo -c
```

### Building a Local Android APK

To build the SuperHumans app for Android locally and generate an APK, use the following command:

```bash
npm run build:local:android
```

### Building a Local iOS App

To build the SuperHumans app for iOS locally, use the following command:

```bash
npm run build:local:ios
```

Make sure you have all the necessary tools installed for iOS development, such as Xcode.
