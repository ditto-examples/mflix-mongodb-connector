// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname, {
  // Add custom configuration here
  resolver: {
    assetExts: ['png', 'jpg', 'jpeg', 'gif'],
  },
});

module.exports = config;
