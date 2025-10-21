# BrewedAt Mobile App

React Native mobile application for iOS and Android.

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- Expo CLI
- iOS Simulator (Mac only) or Android Emulator

### Installation

```bash
cd mobile
npm install
```

### Running the App

```bash
# Start Expo development server
npx expo start

# Run on iOS simulator
npx expo start --ios

# Run on Android emulator
npx expo start --android
```

### Project Structure

- `App.js` - Main app component
- `components/` - Reusable React components
- `screens/` - App screens/pages
- `navigation/` - Navigation configuration
- `config/` - App configuration
- `constants/` - App constants
- `utils/` - Utility functions
- `assets/` - Images, fonts, and other static assets

### Firebase Configuration

Firebase configuration is located in `firebase.config.js`. The app connects to the same Firebase project as the web dashboard.

## Building for Production

```bash
# Build for iOS
npx expo build:ios

# Build for Android
npx expo build:android
```

## Learn More

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
