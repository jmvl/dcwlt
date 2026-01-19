module.exports = {
  dependencies: {
    'react-native-fast-base64': {
      platforms: {
        android: {
          sourceDir: '../node_modules/react-native-fast-base64/android',
          packageImportPath: 'import com.fastbase64.FastBase64Package;',
        },
      },
    },
  },
};
