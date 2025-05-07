# AI Chat Icon Setup

The application currently uses a default chat bubble icon. Here's how to create and set up the icons:

## Current Icon Creation Steps

1. Create the Base SVG:
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" fill="#0969da" rx="20"/>
  <circle cx="30" cy="50" r="6" fill="white"/>
  <circle cx="50" cy="50" r="6" fill="white"/>
  <circle cx="70" cy="50" r="6" fill="white"/>
</svg>
```

2. Save this as `chat-icon.svg`

3. Convert to Required Formats:
   - Using Inkscape:
     a. Open chat-icon.svg
     b. Export as PNG:
        - Export at 512x512 as logo512.png
        - Export at 192x192 as logo192.png
     c. Export at 32x32 and 16x16, combine into favicon.ico

   - Using ImageMagick:
   ```bash
   convert chat-icon.svg -resize 512x512 public/logo512.png
   convert chat-icon.svg -resize 192x192 public/logo192.png
   convert chat-icon.svg -resize 32x32 favicon-32.png
   convert chat-icon.svg -resize 16x16 favicon-16.png
   convert favicon-16.png favicon-32.png public/favicon.ico
   ```

4. Place files in the public directory:
   - public/favicon.ico
   - public/logo192.png
   - public/logo512.png

## Customizing the Icon

To use your own icon:

1. Create a square image at least 512x512 pixels
2. Follow the conversion steps above with your image
3. Replace the existing icon files in the public directory
4. Clear your browser cache and restart the application

## Icon File Requirements

- favicon.ico: Multi-size icon file (16x16 and 32x32)
- logo192.png: 192x192 pixels, PNG format
- logo512.png: 512x512 pixels, PNG format

All icons should maintain a 1:1 aspect ratio.

