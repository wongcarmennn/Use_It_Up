# 🥦 UseItUp

A family pantry manager that helps households waste less food. Log what's in your fridge, get alerted before things expire, and find recipes based on what you already have.

Built for Malaysian families, iOS-first.

---

## Features

- **Pantry tracking** — Add items by barcode scan or manually, with category, storage location, quantity, and expiry date
- **Expiry alerts** — Push notifications before food goes bad, with a "Use First" section for items expiring soon
- **Family sharing** — One shared household pantry with invite codes, visible to all family members in real time
- **Recipe suggestions** — Find recipes based on your pantry ingredients, with expiring items prioritised
- **Barcode scanning** — Looks up product names automatically via Open Food Facts

---

## Tech Stack

- **React Native** (Expo SDK 51, iOS-first)
- **Firebase** — Firestore (real-time database) + Google Sign In auth
- **Zustand** — global state management
- **React Navigation** — bottom tabs + native stacks
- **Expo Notifications** — local expiry alerts
- **Spoonacular API** — recipe suggestions
- **Open Food Facts API** — barcode product lookup

---

## Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- Xcode (for iOS simulator)
- CocoaPods: `sudo gem install cocoapods`

### Installation

```bash
git clone https://github.com/your-username/UseItUp.git
cd UseItUp
npm install
```

### Environment Variables

Create a `.env` file in the root of the project:

```
EXPO_PUBLIC_SPOONACULAR_API_KEY=your_spoonacular_key
EXPO_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
```

- Get a free Spoonacular key at [spoonacular.com/food-api](https://spoonacular.com/food-api)
- Get Firebase credentials from [console.firebase.google.com](https://console.firebase.google.com)

### Run on iOS

```bash
npx expo prebuild --platform ios
cd ios && pod install && cd ..
npx expo run:ios
```

---

## Project Structure

```
src/
├── navigation/       # React Navigation setup
├── screens/          # App screens (Pantry, Recipes, Settings, Auth, etc.)
├── services/         # Firebase, Spoonacular, notifications, barcode lookup
├── store/            # Zustand auth store
├── theme/            # Colours, typography, spacing
└── types/            # Shared TypeScript types
```

---

## Firebase Setup

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Firestore** and **Authentication** (Google Sign In)
3. Download `GoogleService-Info.plist` and place it in `ios/UseItUp/`
4. Create a Firestore composite index: `isConsumed ASC` + `expiryDate ASC`

---

## Notes

- `.env` and `GoogleService-Info.plist` are excluded from version control — never commit them
- Android support is planned for a future release
