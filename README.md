# Tech Learning Hub

A modern, interactive web application showcasing technology evolution with detailed features and code examples.

🌐 **Live Demo**: [https://notes.thilina01.com/](https://notes.thilina01.com/)

## Features

- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- 🌙 **Dark/Light Theme** - Automatically adapts to system preferences
- 📋 **Copy Code** - One-click code copying with visual feedback
- ♿ **Accessible** - Full keyboard navigation and screen reader support
- ⚡ **Fast Loading** - Optimized performance with dynamic content loading
- 🔄 **Easy Maintenance** - Update content by editing JSON files
- 📁 **Multi-Content Support** - Support for multiple technologies
- 📂 **Collapsible Sidebar** - Space-efficient navigation
- ⚙️ **Enable/Disable Content** - Control which content is available

## Quick Start

### Option 1: Live Demo (Easiest)
🌐 **Visit the live application**: [https://notes.thilina01.com/](https://notes.thilina01.com/)

### Option 2: Direct File Opening
1. Double-click `index.html` to open in your browser
2. The application will work immediately with fallback data

### Option 3: With Web Server (Recommended for Development)
1. Open **Command Prompt (cmd)** - not PowerShell
2. Navigate to the project directory:
   ```cmd
   cd "<dir_name>"
   ```
3. Start a local web server:
   ```cmd
   # Using Python
   python -m http.server 8000
   
   # Using Node.js (if you have it installed)
   npx http-server -p 8000
   ```
4. Open `http://localhost:8000` in your browser
5. The application will load data from content files

## Deployment

This application is automatically deployed to GitHub Pages using GitHub Actions.

### Automatic Deployment
- **Push to main branch** triggers automatic deployment
- **GitHub Actions** builds and deploys the application
- **Live URL**: [https://notes.thilina01.com/](https://notes.thilina01.com/)
- **Custom Domain**: Configured for `notes.thilina01.com`

### Manual Deployment Setup
1. Fork or clone this repository
2. Enable GitHub Pages in repository settings
3. Set source to "GitHub Actions"
4. Push changes to trigger deployment

### Custom Domain Setup
This application is configured to use the custom domain `notes.thilina01.com`:

1. **CNAME File**: The `CNAME` file contains `notes.thilina01.com`
2. **DNS Configuration**: Point your domain's CNAME record to `thilina01.github.io`
3. **GitHub Pages**: Enable "Enforce HTTPS" in repository settings
4. **SSL Certificate**: GitHub automatically provides SSL certificates for custom domains

### Local Development
1. Clone the repository:
   ```bash
   git clone https://github.com/thilina01/notes.git
   cd notes
   ```
2. Start a local server:
   ```bash
   npx http-server -p 8000
   ```
3. Open `http://localhost:8000` in your browser

## File Structure

```
├── index.html              # Main HTML file
├── style.css               # Main styling and theming
├── sidebar.css             # Sidebar-specific styles
├── app.js                  # JavaScript application logic
├── package.json            # Node.js dependencies and scripts
├── update-manifest.js      # Script to update content manifest
├── CONTENT_ORDERING_GUIDE.md # Guide for content file ordering
├── content/                # Content files directory
│   ├── manifest.json        # Auto-generated list of content files
│   ├── java-versions.json  # Java version information
│   ├── java-advanced.json  # Advanced Java concepts
│   ├── spring-versions.json # Spring framework information
│   ├── docker-versions.json # Docker information (disabled)
│   ├── kubernetes.json     # Kubernetes commands and concepts
│   ├── notes.json          # General notes and tips
│   └── *.json              # Other content files
└── README.md               # This file
```

## Content Management

### Adding New Technologies

1. Create a new JSON file in the `content/` folder
2. Follow this structure:
   ```json
   {
     "config": {
       "id": "your-tech",
       "name": "🚀 Your Tech",
       "description": "Description of your technology",
       "icon": "🚀",
       "enabled": true
     },
     "versions": [
       {
         "version": "all",
         "year": "All",
         "title": "🚀 All Your Tech Features — Complete Overview",
         "features": []
       },
       {
         "version": "1.0",
         "year": "2024",
         "title": "🚀 Your Tech 1.0 (2024) — First Release",
         "features": [
           {
             "name": "✅ Feature Name",
             "code": "// Your code example here\nconsole.log('Hello World');"
           }
         ]
       }
     ]
   }
   ```
3. Update the manifest file:
   ```cmd
   npm run update-manifest
   ```
   Or manually add the filename to `content/manifest.json`

### Content File Ordering

Control the order of content files in the sidebar using multiple methods:

**1. Prefix Method (Recommended):**
```
001-java-versions.json      # Order: 1
002-java-advanced.json      # Order: 2
003-spring-versions.json    # Order: 3
```

**2. Alphabetical Method:**
```
content-template.json       # Auto-assigned order
docker-versions.json        # Auto-assigned order
notes.json                  # Auto-assigned order
```

**3. Custom Order:**
Manually specify order in `manifest.json`.

See `CONTENT_ORDERING_GUIDE.md` for detailed instructions.

### Enabling/Disabling Content

Set `"enabled": false` in the config section of any content file to disable it:
```json
{
  "config": {
    "id": "docker",
    "name": "🐳 Docker",
    "description": "Docker & Containerization",
    "icon": "🐳",
    "enabled": false  // This will hide Docker from the sidebar
  }
}
```

### Updating Existing Content

1. Edit the relevant section in any `content/*.json` file
2. Update feature names, code examples, or descriptions
3. Save the file - changes appear immediately when you refresh the page

## Usage

1. **Sidebar Navigation** - Click on technology icons to switch between content
2. **Collapsible Sidebar** - Click the hamburger menu to collapse/expand
3. **Version Tabs** - Click on version tabs to explore different releases
4. **Feature Cards** - Click on feature cards to expand and view code examples
5. **Copy Code** - Use the copy button to copy code to clipboard
6. **Keyboard Navigation** - Use Tab, Enter, Space for accessibility

## Troubleshooting

### Port Already in Use Error
If you get "EADDRINUSE" error:
```cmd
# Try a different port
npx http-server -p 8080
# Then open http://localhost:8080
```

### PowerShell Execution Policy Error
If you get PowerShell script execution errors:
```cmd
# Solution: Use Command Prompt (cmd) instead of PowerShell
# Open Command Prompt and run:
npx http-server -p 8000
```

### Content Not Loading
- Make sure you're using a web server (not opening file directly)
- Check browser console for error messages
- Verify content files exist in the `content/` folder
- Ensure `enabled: true` in content file configs

## Browser Support

- Chrome/Edge 88+
- Firefox 85+
- Safari 14+
- All modern browsers with ES6+ support

## Development

The application uses vanilla JavaScript with no external dependencies. All styling is handled through CSS custom properties for easy theming.

### Key Features:
- **Dynamic Content Loading** - Data loaded from JSON files in content folder
- **Automatic File Discovery** - Uses manifest.json for efficient file loading
- **Fallback Mechanism** - Works even without web server
- **Modular Architecture** - Clean separation of data, styling, and logic
- **Error Handling** - Graceful fallbacks if data fails to load
- **Performance Optimized** - Efficient DOM manipulation and event handling
- **Collapsible Sidebar** - Space-efficient navigation
- **Content Management** - Easy enable/disable of content types
- **Manifest Management** - Automated content file discovery

### Console Messages:
- `✅ Loaded content configuration` - Successfully loaded from content files
- `📊 Enabled content types: [array]` - Shows which content types are enabled
- `⚠️ Failed to load [file]` - Individual file loading issues
