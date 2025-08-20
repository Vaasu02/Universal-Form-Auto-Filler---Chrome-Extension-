# Form Auto-Filler Chrome Extension Demo

A Chrome extension that demonstrates automated form filling capabilities for website automation. Built for internship application demo.

## 🎯 Features

- **Smart Form Detection**: Automatically finds and fills common form fields
- **Multiple Field Types**: Handles text inputs, dropdowns, textareas, and email fields
- **Visual Feedback**: Highlights filled fields with green borders and shows completion status
- **Persistent Data**: Remembers your form data between sessions
- **Modern UI**: Beautiful popup interface with gradient design
- **Cross-Site Compatibility**: Works on any website with standard HTML forms

## 🚀 Installation Instructions

### Step 1: Download the Extension
1. Download all files to a folder (manifest.json, popup.html, popup.js, content.js, background.js)
2. Create a new folder called `form-auto-filler-demo`
3. Place all files in this folder

### Step 2: Load in Chrome
1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `form-auto-filler-demo` folder
5. The extension should now appear in your extensions list

### Step 3: Pin the Extension
1. Click the puzzle piece icon in Chrome toolbar
2. Find "Form Auto-Filler Demo" and click the pin icon
3. The extension icon will now appear in your toolbar

## 🎬 Demo Instructions

### Quick Test Sites:
1. **Contact Forms**: Try any business website's contact page
2. **Newsletter Signups**: Most websites have these
3. **Support Forms**: Help/support pages often have forms
4. **Registration Forms**: Many sites have signup forms

### Suggested Test Sites:
- Any WordPress site's contact page
- Business websites with "Contact Us" forms
- Event registration pages
- Newsletter signup forms

## 📋 How to Use

1. **Fill Your Data**: Click the extension icon and enter your information in the popup
2. **Navigate to a Form**: Go to any website with a contact form or signup form
3. **Auto-Fill**: Click the "🚀 Auto-Fill Form" button in the popup
4. **Watch the Magic**: The extension will automatically:
   - Find form fields (name, email, phone, company, subject, message)
   - Fill them with your data
   - Highlight filled fields with green borders
   - Show a success notification

## 🔧 Technical Implementation

### Architecture:
- **Manifest V3**: Latest Chrome extension format
- **Content Script**: Handles DOM manipulation and form filling
- **Background Service Worker**: Manages extension lifecycle and storage
- **Popup Interface**: User interaction and data input
- **Storage API**: Persists user data between sessions

### Key Automation Features:
- **Smart Selectors**: Uses multiple CSS selectors to find form fields
- **Field Detection**: Identifies fields by name, id, placeholder, and type attributes
- **Event Triggering**: Properly fires input/change events for form validation
- **Visual Feedback**: Highlights filled fields and shows completion status
- **Error Handling**: Gracefully handles missing fields and edge cases

### Form Field Mapping:
- **Name Fields**: `input[name*="name"]`, `input[id*="name"]`, etc.
- **Email Fields**: `input[type="email"]`, `input[name*="email"]`, etc.
- **Phone Fields**: `input[type="tel"]`, `input[name*="phone"]`, etc.
- **Company Fields**: `input[name*="company"]`, `input[name*="organization"]`, etc.
- **Subject Fields**: `select[name*="subject"]`, dropdown handling
- **Message Fields**: `textarea[name*="message"]`, `textarea[id*="message"]`, etc.


### Common Issues:
- **No Form Found**: Make sure you're on a page with a visible form
- **Fields Not Filled**: The site might use non-standard field names
- **Permission Errors**: Make sure the extension has permission for the site

## 🌟 Extension Capabilities Demonstrated

This extension showcases the key skills:

✅ **Chrome Extension (MV3)** - Built with latest manifest version  
✅ **DOM Manipulation** - Smart form field detection and filling  
✅ **Content Scripts** - Injected scripts for page interaction  
✅ **Background Service Worker** - Extension lifecycle management  
✅ **Message Passing** - Communication between popup and content script  
✅ **Modern Web App Handling** - Works with dynamic forms  
✅ **CSS/XPath Selectors** - Multiple selector strategies  
✅ **User Interface** - Beautiful, responsive popup design  
✅ **Error Handling** - Graceful fallbacks and user feedback  

