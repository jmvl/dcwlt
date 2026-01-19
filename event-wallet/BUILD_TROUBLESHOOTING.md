# Build Troubleshooting Guide

## Quick Diagnostics

Run these commands to diagnose build issues:

```bash
# 1. Check dependency versions
npm list --depth=0

# 2. Check Expo compatibility
npx expo install --check

# 3. Check for duplicate dependencies
npm ls @web3auth/base

# 4. Verify native module configuration
npx react-native config

# 5. Check Android Gradle setup
cd android && ./gradlew tasks --all
```

## Common Build Issues

### 1. Gradle Build Failures

**Symptom**: Android build fails with compilation errors

**Diagnosis**:
```bash
cd android
./gradlew assembleDebug --stacktrace --info
```

**Common Fixes**:

a) Clean build artifacts:
```bash
cd android
./gradlew clean
cd ..
npm run clean
npm install
```

b) Clear Gradle cache:
```bash
cd android
rm -rf .gradle
rm -rf build
rm -rf app/build
./gradlew clean
```

c) Verify NDK version in build.gradle matches gradle.properties:
```bash
# Should be: ndkVersion = "26.1.10909125"
grep ndkVersion android/build.gradle
```

### 2. Metro Bundler Issues

**Symptom**: App launches but shows red screen with module errors

**Diagnosis**:
```bash
# Start Metro with verbose output
npx expo start -- --verbose

# Check for module resolution errors
npx expo start -- --no-dev --minify
```

**Common Fixes**:

a) Clear Metro cache:
```bash
npx expo start -- --clear-cache
```

b) Clear watchman cache (if using watchman):
```bash
watchman watch-del-all
rm -rf /tmp/metro-*
rm -rf /tmp/haste-*
```

c) Reset node modules:
```bash
npm run install:clean
```

### 3. Native Module Linking Issues

**Symptom**: "Native module XYZ not found" or "undefined is not an object"

**Diagnosis**:
```bash
# Check autolinking
npx react-native config

# Verify native modules are linked
cd android && ./gradlew clean && cd ..
npx expo prebuild --clean
```

**Common Fixes**:

a) Re-run prebuild:
```bash
npx expo prebuild --clean
```

b) Manually verify AndroidManifest.xml has required permissions:
```bash
grep -E "CAMERA|INTERNET" android/app/src/main/AndroidManifest.xml
```

c) Check MainApplication.java for autolinking:
```bash
grep "getPackages" android/app/src/main/java/com/eventwallet/app/MainApplication.java
```

### 4. Web3Auth Initialization Failures

**Symptom**: App loads but Web3Auth fails to initialize

**Diagnosis**:
```bash
# Check console logs in app
# Look for: "Web3Auth init error" messages
```

**Common Fixes**:

a) Verify redirect URL scheme:
```bash
# In app.json, scheme should match
grep "scheme" app.json

# In AndroidManifest.xml, data scheme should match
grep "eventwallet" android/app/src/main/AndroidManifest.xml
```

b) Check Web3Auth client ID:
```bash
# Should match in both app.json and Web3AuthContext.tsx
grep "BF_3EwSny" app.json
grep "BF_3EwSny" src/contexts/Web3AuthContext.tsx
```

c) Verify storage adapter is configured:
```bash
# Check Web3AuthContext.tsx has storageAdapter defined
grep -A 5 "storageAdapter" src/contexts/Web3AuthContext.tsx
```

### 5. Dependency Version Conflicts

**Symptom**: "Cannot find module" or version mismatch warnings

**Diagnosis**:
```bash
# Check for peer dependency issues
npm ls @web3auth/base @web3auth/react-native-sdk

# Check for duplicate versions
npm ls react-native-gesture-handler
```

**Common Fixes**:

a) Fix Expo dependencies:
```bash
npx expo install --fix
```

b) Update to compatible versions:
```bash
npm install @web3auth/base@^8.12.0 --save-exact
npm install @react-native-async-storage/async-storage@1.23.1 --save-exact
```

c) Reset package-lock.json:
```bash
rm package-lock.json
npm install
```

## Platform-Specific Issues

### Android

**Issue**: "Failed to install app: INSTALL_FAILED_UPDATE_INCOMPATIBLE"
```bash
# Uninstall existing app
adb uninstall com.eventwallet.app

# Then rebuild
npm run android
```

**Issue**: "Could not find com.android.tools.build:gradle:X.X.X"
```bash
# Update build.gradle classpath version
# Check latest version at: https://developer.android.com/studio/releases/gradle-plugin
```

**Issue**: "Execution failed for task ':app:bundleDebugJsAndAssets'"
```bash
# This is usually a Metro bundler issue
npx expo start -- --clear-cache
npm run android
```

**Issue**: Camera permission denied
```bash
# Verify camera permission in app.json
grep "cameraPermissionText" app.json

# Verify AndroidManifest.xml
grep "CAMERA" android/app/src/main/AndroidManifest.xml

# Reinstall app to reset permissions
adb uninstall com.eventwallet.app
npm run android
```

### iOS (not implemented in this POC)

**Issue**: "No such module 'ExpoModulesCore'"
```bash
cd ios
pod install
cd ..
npm run ios
```

## Performance Issues

### Slow Build Times

**Symptom**: Gradle build takes >10 minutes

**Solutions**:

1. Increase Gradle memory:
```bash
# In android/gradle.properties
org.gradle.jvmargs=-Xmx4096m -XX:MaxMetaspaceSize=1024m
```

2. Enable Gradle caching:
```bash
# In android/gradle.properties
org.gradle.caching=true
```

3. Use Gradle parallel builds:
```bash
# In android/gradle.properties
org.gradle.parallel=true
```

### Slow Metro Bundling

**Symptom**: App takes >30 seconds to load

**Solutions**:

1. Reduce Metro workers in metro.config.js:
```javascript
config.maxWorkers = 1;
```

2. Disable source maps in development:
```bash
npx expo start -- --no-source-maps
```

## Log Analysis

### Android Logs

View real-time logs:
```bash
adb logcat | grep -E "ReactNativeJS|Web3Auth|EventWallet"
```

Filter specific errors:
```bash
adb logcat | grep -E "Error|Exception|Failed"
```

Save logs to file:
```bash
adb logcat > logs.txt
```

### Metro Bundler Logs

Start with verbose logging:
```bash
npx expo start -- --verbose
```

Check bundle size:
```bash
# Metro outputs bundle size when building
# Look for: "bundle size"
```

## Verification Steps

After fixing any issue, verify with these steps:

1. **Clean Build Test**:
```bash
npm run clean
npm install
npx expo start -- --clear-cache
```

2. **Dependency Check**:
```bash
npm run deps:check
```

3. **Native Module Verification**:
```bash
npx react-native config
```

4. **Build Test**:
```bash
npm run android
```

5. **Runtime Verification**:
   - App launches without errors
   - Dashboard screen displays
   - Gmail login button works
   - Console shows no errors

## Prevention

### Best Practices

1. **Always use exact versions for Expo dependencies**:
```json
{
  "expo": "~51.0.0",
  "react-native": "0.74.5"
}
```

2. **Run prebuild after dependency changes**:
```bash
npm install <package>
npx expo prebuild --clean
```

3. **Clean builds after major changes**:
```bash
npm run clean
npm install
```

4. **Check dependencies regularly**:
```bash
npm outdated
npm audit
```

5. **Keep dependencies updated**:
```bash
npm update
npx expo install --fix
```

## Getting Help

When reporting issues, include:

1. **Environment info**:
```bash
npx expo env-info
```

2. **Package versions**:
```bash
npm list --depth=0
```

3. **Error messages**:
   - Full stack trace
   - Console logs
   - Build output

4. **Steps to reproduce**:
   - What you did
   - What you expected
   - What actually happened

## Emergency Reset

If nothing works, perform a complete reset:

```bash
# 1. Stop all processes
pkill -f "node|metro|gradle"

# 2. Clean everything
npm run clean
cd android && ./gradlew clean && cd ..

# 3. Remove cache directories
rm -rf node_modules
rm -rf android/.gradle
rm -rf android/build
rm -rf android/app/build
rm -rf .expo

# 4. Clear Metro cache
npx expo start -- --clear-cache

# 5. Reinstall
npm install

# 6. Rebuild
npx expo prebuild --clean

# 7. Start fresh
npm start
```

## Build Configuration Files

Key files to check when troubleshooting:

- `/Users/jm/Codebase/dcwlt/event-wallet/package.json` - Dependencies
- `/Users/jm/Codebase/dcwlt/event-wallet/app.json` - Expo config
- `/Users/jm/Codebase/dcwlt/event-wallet/metro.config.js` - Metro bundler config
- `/Users/jm/Codebase/dcwlt/event-wallet/babel.config.js` - Babel config
- `/Users/jm/Codebase/dcwlt/event-wallet/android/build.gradle` - Android project config
- `/Users/jm/Codebase/dcwlt/event-wallet/android/app/build.gradle` - Android app config
- `/Users/jm/Codebase/dcwlt/event-wallet/android/gradle.properties` - Gradle properties
- `/Users/jm/Codebase/dcwlt/event-wallet/android/settings.gradle` - Gradle settings
- `/Users/jm/Codebase/dcwlt/event-wallet/android/app/src/main/AndroidManifest.xml` - Android manifest
