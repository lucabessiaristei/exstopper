# ExStopper

A Chrome extension to quickly disable and re-enable multiple extensions at once, with automatic page reload and optional DevTools opening.

## Features

- **Batch Disable/Enable**: Select multiple extensions and disable them all at once
- **Auto Reload**: Automatically reloads the current tab after disabling extensions
- **Hard Reload**: Clear cache and reload current page with a single click
- **Smart Selection**: Remembers your selection between uses
- **Clean UI**: Modern, rounded interface with smooth animations

## Installation

### From Source

1. Clone this repository:
```bash
git clone https://github.com/yourusername/exstopper.git
```

2. Open Chrome and navigate to `chrome://extensions/`

3. Enable "Developer mode" (toggle in top-right corner)

4. Click "Load unpacked" and select the extension directory

## Usage

1. Click the ExStopper icon in your Chrome toolbar

2. Select the extensions you want to disable (or use "Select All")

3. Click "Disable and Reload" to disable selected extensions and reload the page

4. To re-enable extensions, click "Re-enable" (the button changes when extensions are disabled)

5. Use "Hard Reload" to clear cache and reload without affecting extensions

## Permissions

ExStopper requires the following permissions:

- **storage**: To remember your extension selections and settings
- **management**: To disable and enable extensions
- **tabs**: To reload the current tab
- **browsingData**: To clear cache for hard reload feature
- **host_permissions**: To access all URLs for cache clearing

## Technical Details

- Uses Chrome Management API for extension control
- Implements async/await pattern for reliable sequential operations
- Stores preferences in Chrome sync storage

## Development

The extension consists of:

- `manifest.json`: Extension configuration
- `popup.html`: UI structure
- `popup.js`: UI logic and user interactions
- `background.js`: Core functionality (disable/enable/reload)

## Privacy Policy

### Data Collection

ExStopper does **not** collect, store, or transmit any personal data outside your browser. All data stays local on your device.

### Data Storage

The extension stores locally (via Chrome sync storage):
- List of extensions you selected for disabling
- List of extensions disabled by ExStopper (to re-enable them later)

This data is only used for the extension's functionality and is synchronized across your Chrome browsers if sync is enabled.

### Permissions Usage

- **storage**: Only to save your preferences locally
- **management**: Only to disable/enable extensions when you explicitly request it
- **tabs**: Only to reload the current tab after disabling extensions
- **browsingData**: Only to clear cache when you use "Hard Reload"
- **host_permissions**: Required by Chrome for cache clearing functionality

### Third-Party Services

ExStopper does not use any third-party services, analytics, or tracking. No data is sent to any external servers.

### Updates

This privacy policy may be updated to reflect changes in the extension. Any significant changes will be communicated through the Chrome Web Store update notes.

### Contact

For privacy concerns or questions, please open an issue on the GitHub repository.

## License

MIT License - See LICENSE file for details

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Support

If you encounter any issues or have suggestions, please open an issue on GitHub.