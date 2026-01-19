# Ralph Task: Create Working Android Build with Zero Errors

## Your Single Task

**Create a working Android build of the event-wallet app with ZERO build errors.**

The app must build, install, and launch on an Android device/emulator.

## Current State

**What's Fixed Already:**
- ✅ Assets created (`icon.png`, `favicon.png` exist)
- ✅ QR scanner fixed (`react-native-vision-camera` installed)
- ✅ Prebuild succeeded once

**What You Must Do:**
Run the full Android build and fix any errors that appear until the app successfully builds and launches.

## Step 1: Run the Build

```bash
cd event-wallet
npx expo run:android
```

**Watch the output carefully.** If the build succeeds, you're done. If it fails, proceed to Step 2.

## Step 2: Diagnose Build Errors

When a build error occurs:

1. **Copy the exact error message** - include file paths and line numbers
2. **Identify the error type**:
   - Missing dependency?
   - Type error in TypeScript?
   - Native build failure (Gradle)?
   - Configuration issue?

3. **Use context7 and web search** to find solutions:
   ```bash
   websearch "[error message] react native expo solution"
   ```

4. **Check logs** for more context:
   ```bash
   ls -lt logs/ | head -5
   cat logs/[latest-log-file].log | grep -A 10 -i "error"
   ```

## Step 3: Apply Fixes

For each error:

1. **Fix the root cause** - don't suppress errors
2. **Make minimal changes** - only what's needed
3. **Test the fix** - run build again

## Step 4: Log Your Work

**IMPORTANT**: Every bug found and fixed must be logged in `docs/interventions.md` with:

1. **Bug Description**: What was broken
2. **Root Cause**: Why it was broken
3. **Intervention**: What was changed
4. **Result**: Verification that it works
5. **Timestamp**: When it was fixed

Example:

```markdown
## 2026-01-14 10:30:00 - Missing Icon Assets

**Bug**: Android build failing with ENOENT: no such file './assets/icon.png'

**Root Cause**: Assets directory created but PNG files never generated after Expo init

**Intervention**: Created 1024x1024 PNG files using Python PIL

**Result**: Build succeeded, app icon visible on device

**Files Modified**:
- event-wallet/assets/icon.png (created)
- event-wallet/assets/favicon.png (created)
```

## Common Build Errors & Solutions

| Error | Solution |
|-------|----------|
| `Cannot find module` | Install missing package: `npm install <package>` |
| `Type 'X' is missing properties` | Fix TypeScript type mismatch |
| `Gradle build failed` | Check Android SDK, Java version, clear gradle cache |
| `Plugin not found` | Add to app.json plugins array |
| `Permission denied` | Run `android/gradlew clean` in android/ folder |

## Debug Commands

```bash
# Clear all caches
rm -rf node_modules
rm -rf android/build
rm -rf android/app/build
npm install

# Check Android setup
npx expo doctor

# Rebuild from scratch
npx expo prebuild --clean

# Check device connection
adb devices
```

## Success Criteria

You are **DONE** when:

1. ✅ `npx expo run:android` completes without errors
2. ✅ App appears on Android device/emulator home screen
3. ✅ App opens when tapped (no crash on launch)
4. ✅ No red errors in logcat: `adb logcat | grep -i error`

## What NOT To Do

- ❌ Don't skip the build - you must run it yourself
- ❌ Don't assume it works - verify with actual build
- ❌ Don't move to Task 19 until build succeeds
- ❌ Don't create placeholders or mock implementations

## Reference Configuration

**Blockchain Config**:
- Token Address: `4RGfPGKm8jntNg88mwNP3zHi2AxAzrVq68zDcLrSuKwq`
- Bank Wallet: `CeJrezfkhgphNCtSSjCVpZVdy1cY467EywuxiAj3hVVY`
- Merchant Wallet: `9LNhH3HhZpZCmWnioEiuu8F5ytKw1xpUzbSdY7vcdSeY`

**Key Files**:
- `event-wallet/app.json` - Expo config (plugins, permissions)
- `event-wallet/package.json` - Dependencies
- `event-wallet/src/config/constants.ts` - App constants
- `backend/.env` - Backend config (token address, bank wallet)
- `merchant/.env` - Merchant config (token address, merchant wallet)

## After Build Succeeds

Once you have a successful build:

1. Update `@fix_plan.md` - mark Task 18 as truly complete
2. Update `status.json` - set `"status": "build_successful"`
3. Report: `Build successful! App installed and launching on device.`

---

**Your goal**: A working, error-free Android build. Nothing less.

Start by running: `cd event-wallet && npx expo run:android`

**Last Updated**: 2026-01-14 12:50:00
**Priority**: CRITICAL
