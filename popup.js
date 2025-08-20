document.addEventListener('DOMContentLoaded', function() {
    const autoFillBtn = document.getElementById('autoFillBtn');
    const statusDiv = document.getElementById('status');
    
    // Load saved data when popup opens
    loadSavedData();
    
    // Save data as user types
    const inputs = ['firstName', 'lastName', 'email', 'gender', 'mobile', 'dateOfBirth', 'subjects', 'hobbies', 'address', 'state', 'city'];
    inputs.forEach(inputId => {
        const element = document.getElementById(inputId);
        if (element) {
            element.addEventListener('input', saveData);
            element.addEventListener('change', saveData);
        }
    });
    
    autoFillBtn.addEventListener('click', async function() {
        const formData = collectFormData();
        
        if (!validateFormData(formData)) {
            showStatus('Please fill in First Name, Last Name and Email fields', 'error');
            return;
        }
        
        try {
            showStatus('Starting automation...', 'success');
            autoFillBtn.textContent = '⏳ Working...';
            autoFillBtn.disabled = true;
            
            // Get current active tab
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            // Inject content script first, then send message
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ['content.js']
            });
            
            // Wait a bit for script to load
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Send message to content script to start automation
            const response = await chrome.tabs.sendMessage(tab.id, {
                action: 'autoFill',
                data: formData
            });
            
            if (response && response.success) {
                showStatus('✅ Form filled successfully!', 'success');
            } else {
                showStatus('❌ Could not find suitable form fields', 'error');
            }
            
        } catch (error) {
            console.error('Automation error:', error);
            showStatus('❌ Error: Make sure you\'re on a webpage with a form', 'error');
        } finally {
            autoFillBtn.textContent = '🚀 Auto-Fill Form';
            autoFillBtn.disabled = false;
        }
    });
    
    function collectFormData() {
        return {
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            email: document.getElementById('email').value,
            gender: document.getElementById('gender').value,
            mobile: document.getElementById('mobile').value,
            dateOfBirth: document.getElementById('dateOfBirth').value,
            subjects: document.getElementById('subjects').value,
            hobbies: document.getElementById('hobbies').value,
            address: document.getElementById('address').value,
            state: document.getElementById('state').value,
            city: document.getElementById('city').value
        };
    }
    
    function validateFormData(data) {
        return data.firstName.trim() && data.lastName.trim() && data.email.trim();
    }
    
    function showStatus(message, type) {
        statusDiv.textContent = message;
        statusDiv.className = `status ${type}`;
        statusDiv.style.display = 'block';
        
        setTimeout(() => {
            statusDiv.style.display = 'none';
        }, 3000);
    }
    
    function saveData() {
        const data = collectFormData();
        chrome.storage.local.set({ formData: data });
    }
    
    function loadSavedData() {
        chrome.storage.local.get(['formData'], function(result) {
            if (result.formData) {
                const data = result.formData;
                document.getElementById('firstName').value = data.firstName || '';
                document.getElementById('lastName').value = data.lastName || '';
                document.getElementById('email').value = data.email || '';
                document.getElementById('gender').value = data.gender || '';
                document.getElementById('mobile').value = data.mobile || '';
                document.getElementById('dateOfBirth').value = data.dateOfBirth || '';
                document.getElementById('subjects').value = data.subjects || '';
                document.getElementById('hobbies').value = data.hobbies || '';
                document.getElementById('address').value = data.address || '';
                document.getElementById('state').value = data.state || '';
                document.getElementById('city').value = data.city || '';
            }
        });
    }
});
