# Asset Files

## Icons

The application requires icon files in the following formats:

- `icon.png` - 512x512 PNG for Linux
- `icon.ico` - ICO format for Windows
- `icon.icns` - ICNS format for macOS

### Creating Icons

You can create icons from a source image using tools like:

1. **Online Tools:**
   - https://icoconvert.com/ (PNG to ICO/ICNS)
   - https://cloudconvert.com/png-to-ico

2. **Command Line:**
   ```bash
   # Install electron-icon-builder
   npm install -g electron-icon-builder
   
   # Generate icons from source PNG
   electron-icon-builder --input=./source-icon.png --output=./assets
   ```

3. **Manual Creation:**
   - Create a 512x512 PNG with your logo
   - Use conversion tools to create .ico and .icns versions
   - Place files in the `assets/` folder

### Icon Design Suggestions
- Use the shield emoji 🛡️ as inspiration
- BSC yellow/gold colors (#F3BA2F)
- Simple, recognizable design
- High contrast for visibility
- Works well at small sizes (16x16 to 512x512)

### Placeholder
Until you add custom icons, the application will use Electron's default icon.
