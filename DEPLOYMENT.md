# Deployment Guide

## Building the Application

### Prerequisites
- Completed installation (run `install.sh` or `install.bat`)
- Node.js v16 or higher
- All dependencies installed

### Build Commands

#### Build for All Platforms
```bash
npm run build
```

#### Build for Specific Platform

**Windows:**
```bash
npm run build:win
```
Generates: `dist/BSC Defensive Bot Setup.exe`

**macOS:**
```bash
npm run build:mac
```
Generates: `dist/BSC Defensive Bot.dmg`

**Linux:**
```bash
npm run build:linux
```
Generates: `dist/BSC Defensive Bot.AppImage`

## Distribution

### Windows
1. Build the Windows installer: `npm run build:win`
2. Find the installer in `dist/` folder
3. Distribute the `.exe` installer
4. Users can install and run the application

### macOS
1. Build the DMG: `npm run build:mac`
2. Find the DMG in `dist/` folder
3. Distribute the `.dmg` file
4. Users drag the app to Applications folder

### Linux
1. Build the AppImage: `npm run build:linux`
2. Find the AppImage in `dist/` folder
3. Distribute the `.AppImage` file
4. Users make it executable and run

## Configuration for End Users

### Initial Setup
1. Launch the application
2. Navigate to Settings tab
3. Enter wallet address
4. Enter private key (stored securely)
5. Configure trading parameters
6. Save settings

### Network Selection
- **Testnet**: For testing without risking real funds
- **Mainnet**: For production use with real tokens

## Security Considerations

### For Developers
- Never commit `.env` files
- Don't include private keys in builds
- Use code signing for distributables
- Test thoroughly on testnet

### For Users
- Store private keys securely
- Use dedicated wallet for bot
- Start with small amounts
- Test on testnet first
- Keep software updated

## Updating the Application

### Development Updates
1. Pull latest changes: `git pull`
2. Install new dependencies: `npm install`
3. Rebuild: `npm run build`

### User Updates
1. Download new version
2. Install/replace old version
3. Configuration is preserved (stored separately)

## Troubleshooting Deployment

### Build Fails
- Ensure all dependencies installed
- Check Node.js version
- Clear `node_modules` and reinstall
- Check disk space

### Application Won't Start
- Check if Node.js is installed (for development)
- Verify all files copied correctly
- Check system compatibility
- Review error logs in `logs/` folder

### Code Signing (Optional)

#### Windows
```bash
# Requires code signing certificate
electron-builder --win --publish never
```

#### macOS
```bash
# Requires Apple Developer account
electron-builder --mac --publish never
```

## Continuous Integration (CI)

### GitHub Actions Example
```yaml
name: Build

on:
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
    
    steps:
    - uses: actions/checkout@v2
    - uses: actions/setup-node@v2
      with:
        node-version: '16'
    - run: npm install
    - run: npm run build
```

## Auto-Updates (Advanced)

To implement auto-updates:
1. Set up update server
2. Configure `electron-updater`
3. Sign builds
4. Publish releases

See: https://www.electron.build/auto-update

## Support

For issues:
1. Check logs in `logs/` folder
2. Verify configuration
3. Test on testnet
4. Review documentation
5. Check GitHub issues
