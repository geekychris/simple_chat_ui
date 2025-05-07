# Application Icons

The application uses the following icons:
- `favicon.ico` - Browser tab icon (contains both 16x16 and 32x32 sizes)
- `logo192.png` - Small app icon (192x192 pixels)
- `logo512.png` - Large app icon (512x512 pixels)

## Current Icon Design
The current icon is a simple chat bubble design with three dots, using the following colors:
- Background: #0969da (Primary blue)
- Dots: White

## Customizing Icons

### Method 1: Using the Built-in Generator

1. Modify the `public/chat-icon.svg` file with your design
2. Run the icon generator:
   ```bash
   npm run generate-icons
   ```
   This will automatically create all required icon sizes.

### Method 2: Manual Replacement

If you have your own icons already prepared:

1. Replace the following files in the `public` directory:
   - `favicon.ico` (must contain both 16x16 and 32x32 sizes)
   - `logo192.png` (192x192 pixels)
   - `logo512.png` (512x512 pixels)

2. Icons must follow these specifications:
   - All icons should be square (1:1 aspect ratio)
   - PNG files should have transparency where needed
   - Favicon should contain both 16x16 and 32x32 sizes

### Testing Icons

After updating the icons:
1. Clear your browser cache
2. Restart the development server (`npm start`)
3. Check the icons in:
   - Browser tab (favicon)
   - PWA installation (if applicable)
   - App manifest
   - Various device sizes

## Source Files

The source SVG file (`public/chat-icon.svg`) is preserved for future modifications. This is a simple SVG file that can be edited with any vector graphics editor like Inkscape, Adobe Illustrator, or directly in a text editor.

## Icon Generation Script

The icons are generated using a Node.js script located at `scripts/generate-icons.js`. This script uses:
- `sharp` for image processing
- `png-to-ico` for favicon generation

To modify the generation process, edit the script and adjust the following:
- Image sizes
- Output formats
- Image processing options
- File locations

