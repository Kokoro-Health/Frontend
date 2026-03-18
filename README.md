# Kokoro Frontend

Frontend for the Kokoro app – Your Energy Balance Sheet.

## Tech Stack

- **Framework**: Svelte 5 (Runes mode)
- **Language**: TypeScript / JavaScript
- **Styling**: TailwindCSS + DaisyUI
- **Icons**: Lucide-svelte
- **Mobile**: Capacitor (iOS/Android)
- **API Client**: Hey-API
- **Package Manager**: Bun

## Prerequisites

- [Bun](https://bun.sh) (v1.0+)
- Xcode (for iOS development)
- Android Studio (for Android development)

## Setup

1. Clone Repository

```bash
    git clone https://github.com/Kokoro-Health/Frontend.git
    cd Frontend
```

2. Install Dependencies

```bash
    bun install
```

3. Environment Configuration

```bash
    cp example.env .env
```

Edit .env to configure API endpoints and secrets.

4. Sync Capacitor

```bash
    bunx cap sync ios
    bunx cap sync android
```

5. Run Application

```bash
    # iOS Simulator
    bun run ios-dev

    # Android Emulator
    bun run android-dev

    # Android Device (Unix socket)
    bun run android-dev-unix
```
