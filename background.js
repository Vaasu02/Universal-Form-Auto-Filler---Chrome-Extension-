// Background service worker for Form Auto-Filler extension
console.log('Form Auto-Filler background script loaded');

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        console.log('Form Auto-Filler extension installed');
        
        // Set default form data for DemoQA
        chrome.storage.local.set({
            formData: {
                firstName: 'Vasu',
                lastName: 'Chourasia',
                email: 'vasu.chourasia@example.com',
                gender: 'Male',
                mobile: '9876543210',
                dateOfBirth: '2000-08-19',
                subjects: 'Math',
                hobbies: 'Sports',
                address: '123 Main Street, New Delhi',
                state: 'Uttar Pradesh',
                city: 'Agra'
            }
        });
    }
});

// Handle messages from content scripts or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Background received message:', request);
    
    if (request.action === 'logActivity') {
        console.log('Activity logged:', request.data);
        sendResponse({ success: true });
    }
    
    return true;
});

// Handle tab updates to inject content script if needed
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url && 
        (tab.url.startsWith('http://') || tab.url.startsWith('https://'))) {
        
        // Ensure content script is injected
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ['content.js']
        }).catch(error => {
            // Ignore errors - content script might already be injected
            console.log('Content script injection info:', error.message);
        });
    }
});

// Add context menu for quick access (optional enhancement)
chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
        id: 'autoFillForm',
        title: 'Auto-Fill DemoQA Form',
        contexts: ['page']
    });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'autoFillForm') {
        // Get stored form data and trigger auto-fill
        chrome.storage.local.get(['formData'], (result) => {
            if (result.formData) {
                chrome.tabs.sendMessage(tab.id, {
                    action: 'autoFill',
                    data: result.formData
                });
            }
        });
    }
});
