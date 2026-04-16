# My Digital Card — Mobile App

**Status: Phase 2 — Not yet started**

This will be the React Native + Expo hybrid mobile app for iOS and Android.

## Planned Stack
- React Native + Expo (SDK 52+)
- Expo Router (file-based navigation)
- NativeWind (Tailwind CSS for React Native)
- expo-camera (QR code scanner)
- expo-sharing (native share sheet)
- expo-nfc-manager (NFC tap-to-share)

## Planned Features
- All features from the web user portal
- QR code scanner to receive cards
- NFC tap-to-share
- Native share sheet

## Setup (Phase 2)
```bash
npx create-expo-app . --template tabs
pnpm add nativewind expo-router expo-camera expo-sharing
```

See Phase 2 in docs/PRD.md for full feature scope.
