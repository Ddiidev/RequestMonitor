# Request Monitor

A Chrome extension that monitors HTTP requests in DevTools and provides audio notifications when long-running requests complete.

## Features

- **Real-time Request Monitoring**: Tracks HTTP requests using Chrome's debugger API
- **Audio Notifications**: Plays sound alerts when requests take longer than a specified duration
- **Visual Notifications**: Shows browser notifications with request details
- **Configurable Duration**: Set minimum request duration (1-30 seconds) to trigger notifications
- **Tab Management**: Monitor multiple tabs independently
- **Request Filtering**: Automatically ignores static resources (CSS, JS, images, etc.)
- **Clean Interface**: Simple popup interface for easy control

## Installation

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the extension folder
5. The Request Monitor icon will appear in your toolbar

## Usage

### Basic Operation

1. **Start Monitoring**: Click the extension icon or use the popup to start monitoring the current tab
2. **Configure Duration**: Use the slider in the popup to set the minimum request duration (default: 3 seconds)
3. **Test Audio**: Click "Test Sound" to verify audio notifications are working
4. **Pause/Resume**: Toggle notifications globally without stopping monitoring

### Interface Elements

- **Status Indicator**: Green dot = active monitoring, Red dot = notifications paused
- **Pending Requests**: Shows current number of ongoing requests
- **Monitored Tabs**: Displays how many tabs are being monitored
- **Duration Slider**: Adjust the minimum time threshold for notifications

### Icon States

- **Default Icon**: No monitoring active on current tab
- **Active Icon**: Monitoring enabled on current tab

## How It Works

1. **Debugger API**: Uses Chrome's debugger API to attach to tabs and monitor network events
2. **Request Tracking**: Captures `Network.requestWillBeSent` and `Network.responseReceived` events
3. **Duration Calculation**: Measures time between request start and completion
4. **Smart Filtering**: Ignores static resources to focus on API calls and dynamic content
5. **Audio Feedback**: Generates audio notifications using Web Audio API

## File Structure

```
RequestMonitor/
├── manifest.json          # Extension configuration
├── background.js          # Main monitoring logic (service worker)
├── content.js            # Audio playback functionality
├── popup.html            # Extension popup interface
├── popup.js              # Popup functionality and controls
├── debug.js              # Debug utilities and request interception
├── icon16.png            # Extension icon (16x16)
├── icon48.png            # Extension icon (48x48)
├── icon128.png           # Extension icon (128x128)
└── README.md             # This file
```

## Technical Details

### Permissions Required

- `activeTab`: Access to the currently active tab
- `debugger`: Attach debugger to monitor network requests
- `notifications`: Show browser notifications
- `storage`: Save user preferences
- `tabs`: Manage multiple tab monitoring
- `<all_urls>`: Monitor requests on any website

### Browser Compatibility

- Chrome (Manifest V3)
- Chromium-based browsers
- Requires Chrome 88+ for full functionality

### Audio Implementation

- Uses Web Audio API for cross-platform audio generation
- Fallback to HTML5 Audio API if Web Audio is unavailable
- No external audio files required

## Configuration

### Default Settings

- **Minimum Duration**: 3 seconds
- **Audio Enabled**: Yes
- **Notifications Enabled**: Yes
- **Static Resource Filtering**: Enabled

### Filtered File Types

The extension automatically ignores requests for:
- JavaScript files (`.js`)
- CSS files (`.css`)
- Images (`.png`, `.jpg`, `.jpeg`, `.gif`, `.ico`, `.svg`)
- Fonts (`.woff`, `.woff2`)

## Development

### Building from Source

1. Clone the repository
2. No build process required - load directly as unpacked extension
3. Make changes to source files
4. Reload extension in `chrome://extensions/`

### Debug Mode

The `debug.js` file provides additional debugging capabilities:
- Request interception logging
- Audio system testing
- Web Audio API compatibility checks

## Troubleshooting

### Audio Not Working

1. Check browser audio permissions
2. Ensure tab is not muted
3. Try the "Test Sound" button in the popup
4. Check if Web Audio API is supported

### Monitoring Not Starting

1. Refresh the target webpage
2. Check if debugger is already attached by another tool
3. Verify extension permissions are granted
4. Try reloading the extension

### High CPU Usage

1. Reduce the number of monitored tabs
2. Check if monitoring very high-traffic websites
3. Consider increasing the minimum duration threshold

## Privacy

- **No Data Collection**: The extension does not collect or transmit any user data
- **Local Processing**: All monitoring happens locally in your browser
- **No External Servers**: No communication with external services
- **Minimal Permissions**: Only requests necessary permissions for functionality

## Contributing

Contributions are welcome! Please feel free to submit issues, feature requests, or pull requests.

### Development Guidelines

1. Follow existing code style
2. Test thoroughly across different websites
3. Ensure compatibility with Manifest V3
4. Document any new features

## License

This project is open source. Feel free to use, modify, and distribute according to your needs.

## Changelog

### Version 1.0
- Initial release
- Basic request monitoring
- Audio notifications
- Configurable duration threshold
- Multi-tab support
- Static resource filtering

---

**Note**: This extension requires debugger permissions to monitor network requests. This is necessary for the core functionality and is used only for monitoring HTTP requests on tabs you explicitly enable monitoring for.