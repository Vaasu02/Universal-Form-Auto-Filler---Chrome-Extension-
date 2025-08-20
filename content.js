// Universal Form Auto-Filler content script
console.log('Universal Form Auto-Filler content script loaded');

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'autoFill') {
        console.log('Received auto-fill request:', request.data);
        
        try {
            const result = autoFillUniversalForm(request.data);
            sendResponse({ success: result.success, message: result.message });
        } catch (error) {
            console.error('Auto-fill error:', error);
            sendResponse({ success: false, message: error.message });
        }
        
        return true; // Keep message channel open for async response
    }
});

function autoFillUniversalForm(data) {
    console.log('Starting universal form automation with data:', data);
    
    let filledFields = 0;
    let totalAttempts = 0;
    const results = [];
    
    // Step 1: Fill First Name (smart detection)
    if (data.firstName) {
        const firstNameResult = fillFieldByType(data.firstName, 'firstName', 'First Name');
        if (firstNameResult.success) filledFields++;
        totalAttempts++;
        results.push(firstNameResult);
    }
    
    // Step 2: Fill Last Name (smart detection)
    if (data.lastName) {
        const lastNameResult = fillFieldByType(data.lastName, 'lastName', 'Last Name');
        if (lastNameResult.success) filledFields++;
    totalAttempts++;
        results.push(lastNameResult);
    }
    
    // Step 3: Fill Email (smart detection)
    if (data.email) {
        const emailResult = fillFieldByType(data.email, 'email', 'Email');
    if (emailResult.success) filledFields++;
    totalAttempts++;
    results.push(emailResult);
    }
    
    // Step 4: Fill Phone/Mobile (smart detection)
    if (data.mobile) {
        const phoneResult = fillFieldByType(data.mobile, 'phone', 'Phone');
        if (phoneResult.success) filledFields++;
        totalAttempts++;
        results.push(phoneResult);
    }
    
    // Step 5: Fill Address (smart detection)
    if (data.address) {
        const addressResult = fillFieldByType(data.address, 'address', 'Address');
        if (addressResult.success) filledFields++;
        totalAttempts++;
        results.push(addressResult);
    }
    
    // Step 6: Select Gender (smart detection)
    if (data.gender) {
        const genderResult = selectRadioByValue(data.gender, 'gender', 'Gender');
        if (genderResult.success) filledFields++;
        totalAttempts++;
        results.push(genderResult);
    }
    
    // Step 7: Select Hobbies (smart detection)
    if (data.hobbies) {
        const hobbiesResult = selectCheckboxByValue(data.hobbies, 'hobbies', 'Hobbies');
        if (hobbiesResult.success) filledFields++;
        totalAttempts++;
        results.push(hobbiesResult);
    }
    
    // Step 8: Fill Date fields (smart detection)
    if (data.dateOfBirth) {
        const dateResult = fillDateField(data.dateOfBirth, 'Date');
        if (dateResult.success) filledFields++;
        totalAttempts++;
        results.push(dateResult);
    }
    
    // Step 9: Fill Subject/Message (smart detection with DemoQA special handling)
    if (data.subjects) {
        let subjectResult;
        
        // Check if this is DemoQA and handle subjects specially
        if (window.location.href.includes('demoqa.com')) {
            subjectResult = fillDemoQASubjects(data.subjects);
        } else {
            subjectResult = fillFieldByType(data.subjects, 'subject', 'Subject');
        }
        
        if (subjectResult.success) filledFields++;
        totalAttempts++;
        results.push(subjectResult);
    }
    
    // Step 10: Handle State and City dropdowns (DemoQA specific)
    if (data.state) {
        setTimeout(() => {
            const stateResult = handleDropdownSelection(data.state, '#state', 'State');
            if (stateResult.success) filledFields++;
            results.push(stateResult);
            
            // Step 11: Handle City after state selection
            if (data.city) {
                setTimeout(() => {
                    const cityResult = handleDropdownSelection(data.city, '#city', 'City');
                    if (cityResult.success) filledFields++;
                    results.push(cityResult);
                    
                    // Step 12: Auto-submit after all fields
                    setTimeout(() => {
                        const submitResult = attemptSubmit();
                        if (submitResult.success) filledFields++;
                        results.push(submitResult);
                        
                        // Final visual feedback
                        addVisualFeedback(filledFields);
                    }, 1000);
                }, 1000);
            } else {
                // Submit without city
                setTimeout(() => {
                    const submitResult = attemptSubmit();
                    if (submitResult.success) filledFields++;
                    results.push(submitResult);
                    
                    // Final visual feedback
                    addVisualFeedback(filledFields);
                }, 1000);
            }
        }, 1000);
    } else {
        // Submit without state/city
        setTimeout(() => {
            const submitResult = attemptSubmit();
            if (submitResult.success) filledFields++;
            results.push(submitResult);
            
            // Final visual feedback
            addVisualFeedback(filledFields);
        }, 1500);
    }
    
    // Add initial visual feedback
    addVisualFeedback(filledFields);
    
    console.log('Universal form automation results:', results);
    console.log(`Filled ${filledFields} out of ${totalAttempts} attempted fields`);
    
    return {
        success: filledFields > 0,
        message: `Successfully filled ${filledFields} field(s) on this form`,
        details: results
    };
}

// Universal field detection and filling functions

function fillFieldByType(value, fieldType, fieldName) {
    const selectors = getSelectorsForFieldType(fieldType);
    
    for (const selector of selectors) {
        try {
            const elements = document.querySelectorAll(selector);
            
            for (const element of elements) {
                if (isVisible(element) && !element.disabled && !element.readOnly) {
                    // Additional validation to prevent cross-field contamination
                    if (!isValidFieldForType(element, fieldType)) {
                        console.log(`⚠️ Skipping element for ${fieldName} - failed validation:`, element);
                        continue;
                    }
                    
                    // Clear and fill the field
                    element.focus();
                    element.value = '';
                    element.value = value.trim();
                    
                    // Trigger events
                    element.dispatchEvent(new Event('input', { bubbles: true }));
                    element.dispatchEvent(new Event('change', { bubbles: true }));
                    element.blur();
                    
                    // Add visual highlight
                    highlightElement(element);
                    
                    console.log(`✅ Filled ${fieldName} field using selector:`, selector);
                    return { success: true, field: fieldName, selector: selector };
                }
            }
        } catch (error) {
            console.warn(`Error with selector ${selector}:`, error);
        }
    }
    
    console.log(`ℹ️ No ${fieldName} field found on this page`);
    return { success: false, field: fieldName, reason: 'Field not found on this page' };
}

function isValidFieldForType(element, fieldType) {
    const elementName = (element.name || '').toLowerCase();
    const elementId = (element.id || '').toLowerCase();
    const elementPlaceholder = (element.placeholder || '').toLowerCase();
    const elementType = (element.type || '').toLowerCase();
    
    // Email field validation - should not contain address-related terms
    if (fieldType === 'email') {
        if (elementType === 'email') return true; // type="email" is always valid
        if (elementName.includes('address') && !elementName.includes('email')) return false;
        if (elementId.includes('address') && !elementId.includes('email')) return false;
        if (elementPlaceholder.includes('address') && !elementPlaceholder.includes('email')) return false;
    }
    
    // Address field validation - should not be email type
    if (fieldType === 'address') {
        if (elementType === 'email') return false; // Never fill email fields with address
        if (elementName.includes('email')) return false;
        if (elementId.includes('email')) return false;
    }
    
    // Phone field validation
    if (fieldType === 'phone') {
        if (elementType === 'email') return false;
        if (elementName.includes('email') || elementName.includes('address')) return false;
        if (elementId.includes('email') || elementId.includes('address')) return false;
    }
    
    // Name field validation
    if (fieldType === 'firstName' || fieldType === 'lastName') {
        if (elementType === 'email') return false;
        if (elementName.includes('email') || elementName.includes('address')) return false;
        if (elementId.includes('email') || elementId.includes('address')) return false;
    }
    
    return true; // Default to valid if no conflicts detected
}

function getSelectorsForFieldType(fieldType) {
    const selectorMap = {
        firstName: [
            // DemoQA specific
            '#firstName',
            // Formspree and common registration forms
            'input[name="first_name"]',
            'input[id="first_name"]',
            'input[name="firstName"]',
            'input[id="firstName"]',
            // Generic selectors
            'input[name*="first"][name*="name"]:not([name*="last"])',
            'input[id*="first"][id*="name"]:not([id*="last"])',
            'input[placeholder*="first"][placeholder*="name"]',
            'input[name="fname"]',
            'input[id="fname"]',
            'input[name="firstname"]',
            'input[id="firstname"]',
            // W3Schools specific
            'input[name="fname"]',
            // Additional common patterns
            'input[name="given_name"]',
            'input[id="given_name"]',
            'input[placeholder*="first name"]',
            // Generic name fields (fallback)
            'input[name*="name"]:not([name*="last"]):not([name*="user"]):not([name*="company"]):not([name*="full"])'
        ],
        lastName: [
            // DemoQA specific
            '#lastName',
            // Formspree and common registration forms
            'input[name="last_name"]',
            'input[id="last_name"]',
            'input[name="lastName"]',
            'input[id="lastName"]',
            // Generic selectors
            'input[name*="last"][name*="name"]',
            'input[id*="last"][id*="name"]',
            'input[placeholder*="last"][placeholder*="name"]',
            'input[name="lname"]',
            'input[id="lname"]',
            'input[name="lastname"]',
            'input[id="lastname"]',
            // W3Schools specific
            'input[name="lname"]',
            // Additional common patterns
            'input[name="family_name"]',
            'input[id="family_name"]',
            'input[name="surname"]',
            'input[id="surname"]',
            'input[placeholder*="last name"]'
        ],
        email: [
            // DemoQA specific
            '#userEmail',
            // Most reliable email selectors first
            'input[type="email"]',
            'input[name="email"]:not([name*="address"])',
            'input[id="email"]:not([id*="address"])',
            // Formspree and registration forms
            'input[name="email_address"]',
            'input[id="email_address"]',
            'input[name="user_email"]',
            'input[id="user_email"]',
            // Generic patterns (excluding address-related)
            'input[name*="email"]:not([name*="address"])',
            'input[id*="email"]:not([id*="address"])',
            'input[placeholder*="email"]:not([placeholder*="address"])',
            'input[autocomplete="email"]',
            // Fallback patterns (excluding address-related)
            'input[name*="mail"]:not([name*="address"]):not([name*="mailing"])',
            'input[id*="mail"]:not([id*="address"]):not([id*="mailing"])'
        ],
        phone: [
            // DemoQA specific
            '#userNumber',
            // Universal phone selectors
            'input[type="tel"]',
            'input[name*="phone"]',
            'input[id*="phone"]',
            'input[placeholder*="phone"]',
            'input[name*="mobile"]',
            'input[id*="mobile"]',
            'input[placeholder*="mobile"]',
            'input[name="phone"]',
            'input[id="phone"]',
            'input[name="mobile"]',
            'input[id="mobile"]'
        ],
        address: [
            // DemoQA specific
            '#currentAddress',
            // Textarea fields first (more likely to be address)
            'textarea[name*="address"]:not([name*="email"])',
            'textarea[id*="address"]:not([id*="email"])',
            'textarea[placeholder*="address"]:not([placeholder*="email"])',
            'textarea[name="address"]',
            'textarea[id="address"]',
            // Specific address input fields
            'input[name="current_address"]',
            'input[id="current_address"]',
            'input[name="home_address"]',
            'input[id="home_address"]',
            'input[name="street_address"]',
            'input[id="street_address"]',
            // Generic input address fields (excluding email)
            'input[name*="address"]:not([name*="email"]):not([type="email"])',
            'input[id*="address"]:not([id*="email"]):not([type="email"])',
            'input[placeholder*="address"]:not([placeholder*="email"]):not([type="email"])'
        ],
        subject: [
            // Generic subject selectors
            'input[name*="subject"]',
            'input[id*="subject"]',
            'input[placeholder*="subject"]',
            'select[name*="subject"]',
            'select[id*="subject"]',
            'textarea[name*="message"]',
            'textarea[id*="message"]',
            'textarea[placeholder*="message"]',
            'input[name="subject"]',
            'input[id="subject"]'
        ]
    };
    
    return selectorMap[fieldType] || [];
}

function selectRadioByValue(value, fieldType, fieldName) {
    const selectors = [
        `input[type="radio"][value="${value}"]`,
        `input[type="radio"][value="${value.toLowerCase()}"]`,
        `input[type="radio"][name*="gender"]`,
        `input[type="radio"]`
    ];
    
    for (const selector of selectors) {
        try {
            const radios = document.querySelectorAll(selector);
            
            for (const radio of radios) {
                if (radio.value.toLowerCase() === value.toLowerCase() || 
                    (radio.nextSibling && radio.nextSibling.textContent && 
                     radio.nextSibling.textContent.toLowerCase().includes(value.toLowerCase()))) {
                    
                    radio.click();
                    highlightElement(radio.parentElement);
                    console.log(`✅ Selected ${fieldName}: ${value}`);
                    return { success: true, field: fieldName, value: value };
                }
            }
        } catch (error) {
            console.warn(`Error with radio selector ${selector}:`, error);
        }
    }
    
    console.log(`ℹ️ No ${fieldName} radio button found on this page`);
    return { success: false, field: fieldName, reason: 'Radio button not found on this page' };
}

function selectCheckboxByValue(value, fieldType, fieldName) {
    const selectors = [
        `input[type="checkbox"][value*="${value}"]`,
        `input[type="checkbox"]`
    ];
    
    for (const selector of selectors) {
        try {
            const checkboxes = document.querySelectorAll(selector);
            
            for (const checkbox of checkboxes) {
                const label = document.querySelector(`label[for="${checkbox.id}"]`) || 
                             checkbox.parentElement.querySelector('label') ||
                             checkbox.nextSibling;
                
                if (checkbox.value.toLowerCase().includes(value.toLowerCase()) ||
                    (label && label.textContent && label.textContent.toLowerCase().includes(value.toLowerCase()))) {
                    
                    checkbox.click();
                    highlightElement(checkbox.parentElement);
                    console.log(`✅ Selected ${fieldName}: ${value}`);
                    return { success: true, field: fieldName, value: value };
                }
            }
        } catch (error) {
            console.warn(`Error with checkbox selector ${selector}:`, error);
        }
    }
    
    console.log(`ℹ️ No ${fieldName} checkbox found on this page`);
    return { success: false, field: fieldName, reason: 'Checkbox not found on this page' };
}

function fillDateField(dateValue, fieldName) {
    const selectors = [
        '#dateOfBirthInput', // DemoQA specific
        'input[type="date"]',
        'input[name*="date"]',
        'input[id*="date"]',
        'input[placeholder*="date"]',
        'input[name*="birth"]',
        'input[id*="birth"]'
    ];
    
    for (const selector of selectors) {
        try {
            const element = document.querySelector(selector);
            
            if (element && isVisible(element) && !element.disabled) {
                if (element.type === 'date') {
                    element.value = dateValue;
                } else {
                    // Try different date formats
                    const date = new Date(dateValue);
                    const formats = [
                        dateValue,
                        `${String(date.getDate()).padStart(2, '0')} ${date.toLocaleString('en', { month: 'short' })} ${date.getFullYear()}`,
                        `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`,
                        `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
                    ];
                    
                    element.value = formats[0];
                }
                
                element.dispatchEvent(new Event('change', { bubbles: true }));
                highlightElement(element);
                console.log(`✅ Filled ${fieldName} field`);
                return { success: true, field: fieldName };
            }
        } catch (error) {
            console.warn(`Error with date selector ${selector}:`, error);
        }
    }
    
    console.log(`ℹ️ No ${fieldName} field found on this page`);
    return { success: false, field: fieldName, reason: 'Date field not found on this page' };
}

function fillDemoQASubjects(subjects) {
    try {
        const subjectsInput = document.querySelector('#subjectsInput');
        
        if (subjectsInput && isVisible(subjectsInput)) {
            // Clear the field first
            subjectsInput.focus();
            subjectsInput.value = '';
            
            // Type the subjects
            subjectsInput.value = subjects;
            
            // Trigger input event to show autocomplete options
            subjectsInput.dispatchEvent(new Event('input', { bubbles: true }));
            subjectsInput.dispatchEvent(new Event('change', { bubbles: true }));
            
            // Wait for autocomplete options to appear, then select the first one
            setTimeout(() => {
                // Try different selectors for autocomplete options
                const autocompleteOptions = document.querySelectorAll(
                    '.subjects-auto-complete__option, ' +
                    '[class*="auto-complete"] [class*="option"], ' +
                    '[class*="subjects"] [class*="option"], ' +
                    '.css-1n7v3ny-option, ' +
                    '[class*="menu"] [class*="option"]'
                );
                
                if (autocompleteOptions.length > 0) {
                    // Click the first matching option
                    for (const option of autocompleteOptions) {
                        if (option.textContent && 
                            option.textContent.toLowerCase().includes(subjects.toLowerCase())) {
                            option.click();
                            break;
                        }
                    }
                    
                    // If no exact match, click the first option
                    if (autocompleteOptions[0]) {
                        autocompleteOptions[0].click();
                    }
                } else {
                    // If no autocomplete options, try pressing Tab or Enter
                    subjectsInput.dispatchEvent(new KeyboardEvent('keydown', { 
                        key: 'Tab', 
                        code: 'Tab', 
                        keyCode: 9,
                        bubbles: true 
                    }));
                    
                    // Also try Enter
                    setTimeout(() => {
                        subjectsInput.dispatchEvent(new KeyboardEvent('keydown', { 
                            key: 'Enter', 
                            code: 'Enter', 
                            keyCode: 13,
                            bubbles: true 
                        }));
                    }, 100);
                }
                
                highlightElement(subjectsInput);
                console.log(`✅ Filled DemoQA subjects: ${subjects}`);
            }, 500);
            
            return { success: true, field: 'Subjects', value: subjects };
        }
    } catch (error) {
        console.warn('Error filling DemoQA subjects:', error);
    }
    
    console.log('ℹ️ DemoQA subjects field not found');
    return { success: false, field: 'Subjects', reason: 'DemoQA subjects field not accessible' };
}

function handleDropdownSelection(value, selector, fieldName) {
    console.log(`Attempting to select ${fieldName}: ${value}`);
    
    try {
        const dropdown = document.querySelector(selector);
        
        if (!dropdown) {
            console.log(`ℹ️ ${fieldName} dropdown not found on this page`);
            return { success: false, field: fieldName, reason: 'Dropdown not found on this page' };
        }
        
        // Check if this is a DemoQA React-Select dropdown
        if (window.location.href.includes('demoqa.com')) {
            return handleDemoQAReactSelect(value, selector, fieldName);
        } else {
            // Handle regular select dropdowns for other sites
            return handleRegularSelect(value, selector, fieldName);
        }
    } catch (error) {
        console.warn(`Error handling ${fieldName} dropdown:`, error);
        return { success: false, field: fieldName, reason: error.message };
    }
}

function handleDemoQAReactSelect(value, selector, fieldName) {
    return new Promise((resolve) => {
        try {
            const dropdown = document.querySelector(selector);
            
            if (dropdown) {
                // Scroll to dropdown and click to open
                dropdown.scrollIntoView({ behavior: 'smooth', block: 'center' });
                dropdown.click();
                
                setTimeout(() => {
                    // Method 1: Try typing into React-Select input
                    let inputSelector = '';
                    if (fieldName === 'State') {
                        inputSelector = 'input[id*="react-select"][id*="3"]';
                    } else if (fieldName === 'City') {
                        inputSelector = 'input[id*="react-select"][id*="4"]';
                    }
                    
                    let inputElement = document.querySelector(inputSelector);
                    
                    // Method 2: Try finding any input inside the dropdown
                    if (!inputElement) {
                        inputElement = dropdown.querySelector('input');
                    }
                    
                    // Method 3: Try generic React-Select input
                    if (!inputElement) {
                        inputElement = document.querySelector(`${selector} input`);
                    }
                    
                    if (inputElement) {
                        // Type the value
                        inputElement.focus();
                        inputElement.value = value;
                        
                        // Dispatch input events
                        inputElement.dispatchEvent(new Event('input', { bubbles: true }));
                        inputElement.dispatchEvent(new Event('change', { bubbles: true }));
                        
                        setTimeout(() => {
                            // Press Enter to select
                            inputElement.dispatchEvent(new KeyboardEvent('keydown', { 
                                key: 'Enter', 
                                code: 'Enter', 
                                keyCode: 13,
                                bubbles: true 
                            }));
                            
                            highlightElement(dropdown);
                            console.log(`✅ Selected ${fieldName}: ${value}`);
                            resolve({ success: true, field: fieldName, value: value });
                        }, 200);
                    } else {
                        // Fallback: look for visible options
                        const options = document.querySelectorAll('[class*="option"], .css-1n7v3ny-option, [id*="option"]');
                        let found = false;
                        
                        for (const option of options) {
                            if (option.textContent && option.textContent.trim() === value) {
                                option.click();
                                highlightElement(dropdown);
                                console.log(`✅ Selected ${fieldName} (fallback): ${value}`);
                                resolve({ success: true, field: fieldName, value: value });
                                found = true;
                                break;
                            }
                        }
                        
                        if (!found) {
                            console.warn(`❌ Could not find option "${value}" for ${fieldName}`);
                            resolve({ success: false, field: fieldName, reason: `Option "${value}" not found` });
                        }
                    }
                }, 300);
            } else {
                console.warn(`❌ Dropdown ${selector} not found`);
                resolve({ success: false, field: fieldName, reason: 'Dropdown not found' });
            }
        } catch (error) {
            console.warn(`Error selecting ${fieldName}:`, error);
            resolve({ success: false, field: fieldName, reason: error.message });
        }
    });
}

function handleRegularSelect(value, selector, fieldName) {
    try {
        const selectElement = document.querySelector(selector);
        
        if (selectElement && selectElement.tagName.toLowerCase() === 'select') {
            // Handle regular HTML select element
            const options = selectElement.querySelectorAll('option');
            
            for (const option of options) {
                if (option.value.toLowerCase() === value.toLowerCase() ||
                    option.textContent.toLowerCase().trim() === value.toLowerCase()) {
                    selectElement.value = option.value;
                    selectElement.dispatchEvent(new Event('change', { bubbles: true }));
                    highlightElement(selectElement);
                    console.log(`✅ Selected ${fieldName}: ${value}`);
                    return { success: true, field: fieldName, value: value };
                }
            }
        }
        
        console.log(`ℹ️ No matching option found for ${fieldName}: ${value}`);
        return { success: false, field: fieldName, reason: `Option "${value}" not found` };
    } catch (error) {
        console.warn(`Error with regular select ${fieldName}:`, error);
        return { success: false, field: fieldName, reason: error.message };
    }
}

function attemptSubmit() {
    const selectors = [
        '#submit', // DemoQA specific
        'button[type="submit"]',
        'input[type="submit"]',
        '.submit-btn',
        '.btn-submit',
        '.btn-primary'
    ];
    
    // First try specific selectors
    for (const selector of selectors) {
        try {
            const element = document.querySelector(selector);
            
            if (element && isVisible(element) && !element.disabled) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                highlightElement(element);
                
                setTimeout(() => {
                    element.click();
                    console.log('✅ Form submitted successfully!');
                }, 500);
                
                return { success: true, field: 'Submit', action: 'Form submitted' };
            }
        } catch (error) {
            console.warn(`Error with submit selector ${selector}:`, error);
        }
    }
    
    // Then try finding buttons by text content
    try {
        const allButtons = document.querySelectorAll('button');
        
        for (const button of allButtons) {
            const buttonText = button.textContent.toLowerCase().trim();
            
            if ((buttonText.includes('submit') || 
                 buttonText.includes('send') || 
                 buttonText.includes('save') ||
                 buttonText.includes('register') ||
                 buttonText.includes('sign up') ||
                 buttonText.includes('create')) &&
                isVisible(button) && !button.disabled) {
                
                button.scrollIntoView({ behavior: 'smooth', block: 'center' });
                highlightElement(button);
                
                setTimeout(() => {
                    button.click();
                    console.log(`✅ Form submitted successfully using button: "${buttonText}"`);
                }, 500);
                
                return { success: true, field: 'Submit', action: `Form submitted via "${buttonText}" button` };
            }
        }
    } catch (error) {
        console.warn('Error searching buttons by text:', error);
    }
    
    console.log('ℹ️ No submit button found on this page');
    return { success: false, field: 'Submit', reason: 'Submit button not found on this page' };
}

// Legacy function for backward compatibility
function fillDemoQAField(value, selector, fieldName) {
    try {
        const element = document.querySelector(selector);
        
        if (element && isVisible(element) && !element.disabled && !element.readOnly) {
            // Clear and fill the field
                    element.focus();
                    element.value = '';
                    element.value = value.trim();
            
            // Trigger events
                    element.dispatchEvent(new Event('input', { bubbles: true }));
                    element.dispatchEvent(new Event('change', { bubbles: true }));
                    element.blur();
            
            // Add visual highlight
                    highlightElement(element);
                    
            console.log(`✅ Filled ${fieldName} field:`, selector);
                    return { success: true, field: fieldName, selector: selector };
        }
    } catch (error) {
        console.warn(`Error filling ${fieldName}:`, error);
    }
    
    console.warn(`❌ Could not fill ${fieldName} field`);
    return { success: false, field: fieldName, reason: 'Field not found or not accessible' };
}

function selectGender(gender) {
    try {
        // DemoQA uses radio buttons with labels
        const genderLabel = document.querySelector(`label[for="gender-radio-${gender.toLowerCase() === 'male' ? '1' : gender.toLowerCase() === 'female' ? '2' : '3'}"]`);
        
        if (genderLabel) {
            genderLabel.click();
            highlightElement(genderLabel);
            console.log(`✅ Selected gender: ${gender}`);
            return { success: true, field: 'Gender', value: gender };
        }
        
        // Fallback: try clicking the radio button directly
        const radioButton = document.querySelector(`input[value="${gender}"]`);
        if (radioButton) {
            radioButton.click();
            highlightElement(radioButton.parentElement);
            console.log(`✅ Selected gender (fallback): ${gender}`);
            return { success: true, field: 'Gender', value: gender };
        }
    } catch (error) {
        console.warn('Error selecting gender:', error);
    }
    
    console.warn('❌ Could not select gender');
    return { success: false, field: 'Gender', reason: 'Gender option not found' };
}

function fillDateOfBirth(dateString) {
    try {
        // DemoQA uses a date picker, try to click and set date
        const dateInput = document.querySelector('#dateOfBirthInput');
        
        if (dateInput) {
            dateInput.click(); // Open date picker
            
            // Try to set the date directly
            const date = new Date(dateString);
            const formattedDate = `${String(date.getDate()).padStart(2, '0')} ${date.toLocaleString('en', { month: 'short' })} ${date.getFullYear()}`;
            
            setTimeout(() => {
                dateInput.value = formattedDate;
                dateInput.dispatchEvent(new Event('change', { bubbles: true }));
                highlightElement(dateInput);
            }, 100);
            
            console.log(`✅ Set date of birth: ${formattedDate}`);
            return { success: true, field: 'Date of Birth', value: formattedDate };
        }
    } catch (error) {
        console.warn('Error setting date of birth:', error);
    }
    
    console.warn('❌ Could not set date of birth');
    return { success: false, field: 'Date of Birth', reason: 'Date picker not accessible' };
}

function fillSubjects(subjects) {
    try {
        const subjectsInput = document.querySelector('#subjectsInput');
        
        if (subjectsInput) {
            subjectsInput.focus();
            subjectsInput.value = subjects;
            
            // Trigger input event to show autocomplete
            subjectsInput.dispatchEvent(new Event('input', { bubbles: true }));
            
            // Try to select the first suggestion
            setTimeout(() => {
                const firstOption = document.querySelector('.subjects-auto-complete__option');
                if (firstOption) {
                    firstOption.click();
                }
            }, 100);
            
            highlightElement(subjectsInput);
            console.log(`✅ Filled subjects: ${subjects}`);
            return { success: true, field: 'Subjects', value: subjects };
        }
    } catch (error) {
        console.warn('Error filling subjects:', error);
    }
    
    console.warn('❌ Could not fill subjects');
    return { success: false, field: 'Subjects', reason: 'Subjects field not accessible' };
}

function selectHobbies(hobby) {
    try {
        // DemoQA uses checkboxes for hobbies
        const hobbiesMap = {
            'Sports': 'hobbies-checkbox-1',
            'Reading': 'hobbies-checkbox-2',
            'Music': 'hobbies-checkbox-3'
        };
        
        const hobbyId = hobbiesMap[hobby];
        if (hobbyId) {
            const hobbyLabel = document.querySelector(`label[for="${hobbyId}"]`);
            if (hobbyLabel) {
                hobbyLabel.click();
                highlightElement(hobbyLabel);
                console.log(`✅ Selected hobby: ${hobby}`);
                return { success: true, field: 'Hobbies', value: hobby };
            }
        }
    } catch (error) {
        console.warn('Error selecting hobbies:', error);
    }
    
    console.warn('❌ Could not select hobbies');
    return { success: false, field: 'Hobbies', reason: 'Hobby option not found' };
}

function selectDropdown(value, selector, fieldName) {
    return new Promise((resolve) => {
        try {
            const dropdown = document.querySelector(selector);
            
            if (dropdown) {
                // DemoQA uses React-Select dropdowns, click to open
                dropdown.scrollIntoView({ behavior: 'smooth', block: 'center' });
                dropdown.click();
                
                setTimeout(() => {
                    // Method 1: Try typing into React-Select input
                    let inputSelector = '';
                    if (fieldName === 'State') {
                        inputSelector = 'input[id*="react-select"][id*="3"]';
                    } else if (fieldName === 'City') {
                        inputSelector = 'input[id*="react-select"][id*="4"]';
                    }
                    
                    let inputElement = document.querySelector(inputSelector);
                    
                    // Method 2: Try finding any input inside the dropdown
                    if (!inputElement) {
                        inputElement = dropdown.querySelector('input');
                    }
                    
                    // Method 3: Try generic React-Select input
                    if (!inputElement) {
                        inputElement = document.querySelector(`${selector} input`);
                    }
                    
                    if (inputElement) {
                        // Type the value
                        inputElement.focus();
                        inputElement.value = value;
                        
                        // Dispatch input events
                        inputElement.dispatchEvent(new Event('input', { bubbles: true }));
                        inputElement.dispatchEvent(new Event('change', { bubbles: true }));
                        
                        setTimeout(() => {
                            // Press Enter to select
                            inputElement.dispatchEvent(new KeyboardEvent('keydown', { 
                                key: 'Enter', 
                                code: 'Enter', 
                                keyCode: 13,
                                bubbles: true 
                            }));
                            
                            highlightElement(dropdown);
                            console.log(`✅ Selected ${fieldName}: ${value}`);
                            resolve({ success: true, field: fieldName, value: value });
                        }, 200);
                    } else {
                        // Fallback: look for visible options
                        const options = document.querySelectorAll('[class*="option"], .css-1n7v3ny-option, [id*="option"]');
                        let found = false;
                        
                        for (const option of options) {
                            if (option.textContent && option.textContent.trim() === value) {
                                option.click();
                                highlightElement(dropdown);
                                console.log(`✅ Selected ${fieldName} (fallback): ${value}`);
                                resolve({ success: true, field: fieldName, value: value });
                                found = true;
                                break;
                            }
                        }
                        
                        if (!found) {
                            console.warn(`❌ Could not find option "${value}" for ${fieldName}`);
                            resolve({ success: false, field: fieldName, reason: `Option "${value}" not found` });
                        }
                    }
                }, 300);
            } else {
                console.warn(`❌ Dropdown ${selector} not found`);
                resolve({ success: false, field: fieldName, reason: 'Dropdown not found' });
            }
        } catch (error) {
            console.warn(`Error selecting ${fieldName}:`, error);
            resolve({ success: false, field: fieldName, reason: error.message });
        }
    });
}

function submitForm() {
    try {
        // DemoQA specific submit button selector
        const submitButton = document.querySelector('#submit') || 
                           document.querySelector('button[id="submit"]') ||
                           document.querySelector('button[type="submit"]') ||
                           document.querySelector('.btn-primary') ||
                           document.querySelector('button');
        
        if (submitButton && isVisible(submitButton)) {
            // Scroll to submit button
            submitButton.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Highlight before clicking
            highlightElement(submitButton);
            
            setTimeout(() => {
                try {
                    // Use both click methods for better compatibility
                    submitButton.focus();
                    submitButton.click();
                    
                    // Also try dispatching a click event
                    submitButton.dispatchEvent(new MouseEvent('click', {
                        bubbles: true,
                        cancelable: true,
                        view: window
                    }));
                    
                    console.log('✅ Form submitted successfully!');
                } catch (clickError) {
                    console.warn('Error clicking submit button:', clickError);
                    throw clickError;
                }
            }, 500);
            
            return { success: true, field: 'Submit', action: 'Form submitted' };
        } else {
            console.warn('❌ Submit button not found or not visible');
            // Log all buttons for debugging
            const allButtons = document.querySelectorAll('button');
            console.log('Available buttons:', Array.from(allButtons).map(btn => ({
                id: btn.id,
                type: btn.type,
                text: btn.textContent,
                classes: btn.className
            })));
        }
    } catch (error) {
        console.warn('Error submitting form:', error);
    }
    
    console.warn('❌ Could not find or click submit button');
    return { success: false, field: 'Submit', reason: 'Submit button not found' };
}

// Removed showSubmissionSuccess function as requested

function isVisible(element) {
    const style = window.getComputedStyle(element);
    return style.display !== 'none' && 
           style.visibility !== 'hidden' && 
           style.opacity !== '0' &&
           element.offsetWidth > 0 && 
           element.offsetHeight > 0;
}

function highlightElement(element) {
    const originalBorder = element.style.border;
    const originalBoxShadow = element.style.boxShadow;
    
    element.style.border = '3px solid #4CAF50';
    element.style.boxShadow = '0 0 15px rgba(76, 175, 80, 0.7)';
    
    setTimeout(() => {
        element.style.border = originalBorder;
        element.style.boxShadow = originalBoxShadow;
    }, 3000);
}

function addVisualFeedback(filledCount) {
    // Remove existing feedback
    const existingFeedback = document.getElementById('universal-auto-fill-feedback');
    if (existingFeedback) {
        existingFeedback.remove();
    }
    
    // Create feedback element
    const feedback = document.createElement('div');
    feedback.id = 'universal-auto-fill-feedback';
    feedback.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(45deg, #4CAF50, #45a049);
        color: white;
        padding: 20px 25px;
        border-radius: 15px;
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        font-family: Arial, sans-serif;
        font-size: 16px;
        font-weight: bold;
        animation: slideIn 0.6s ease-out;
        max-width: 300px;
    `;
    
    feedback.innerHTML = `
        🎯 Form Auto-Filled!<br>
        ✅ Filled ${filledCount} field(s)<br>
        <small style="font-weight: normal; opacity: 0.9;">Automation complete!</small>
    `;
    
    // Add animation keyframes
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(feedback);
    
    // Remove after 3 seconds
    setTimeout(() => {
        feedback.style.animation = 'slideIn 0.6s ease-out reverse';
        setTimeout(() => feedback.remove(), 600);
    }, 3000);
}