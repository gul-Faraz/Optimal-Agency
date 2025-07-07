document.addEventListener('DOMContentLoaded', initFormTracking);

function initFormTracking() {
    const forms = document.querySelectorAll('form');

    forms.forEach(form => {
        const fieldEvents = [];
        const inputs = form.querySelectorAll('input, textarea, select');

        inputs.forEach(input => {
            input.addEventListener('blur', function () {
                const fieldData = {
                    form_id: form.id || 'unnamed_form',
                    field_name: input.name || input.id || 'unnamed_field',
                    field_value: input.value || '',
                    event: 'field_abandoned',
                    field_type: input.type || input.tagName.toLowerCase(),
                    timestamp: new Date().toISOString()
                };
                fieldEvents.push(fieldData);
            });
        });

        form.addEventListener('submit', function (event) {
            event.preventDefault();

            const formData = new FormData(form);

            const data = {
                form_id: form.id || 'unnamed_form',
                fields: {},
                metadata: {
                    timestamp: new Date().toISOString(),
                    page_url: window.location.href,
                    referrer: document.referrer || 'none',
                    utm_source: getParameterByName('utm_source') || 'none',
                    utm_medium: getParameterByName('utm_medium') || 'none',
                    utm_campaign: getParameterByName('utm_campaign') || 'none',
                    device: /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
                    browser: navigator.userAgent
                },
                field_events: fieldEvents
            };

            formData.forEach((value, key) => {
                data.fields[key] = value;
            });

            // Create result element if it doesn't exist
            let formResult = document.getElementById('formResult');
            if (!formResult) {
                formResult = document.createElement('div');
                formResult.id = 'formResult';
                form.insertAdjacentElement('afterend', formResult);
            }



            // Make AJAX request using Fetch API
            fetch('https://staging.monitizetext.com/api/v1/form/submission/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(result => {
                    formResult.textContent = 'Form submitted successfully!';
                    formResult.style.color = 'green';
                    console.log('Form submission and field events tracked:', result);
                })
                .catch(error => {
                    formResult.textContent = 'Submission failed. Please try again.';
                    formResult.style.color = 'red';
                    if (error.message.includes('Failed to fetch')) {
                        formResult.textContent = 'Submission failed: CORS error or server unreachable. Contact support.';
                        console.error('CORS or network error: The server may not be configured to allow requests from this origin.');
                    } else {
                        console.error('Error tracking form:', error);
                    }
                });
        });
    });
}

function getParameterByName(name) {
    name = name.replace(/[\[\]]/g, '\\$&');
    const url = window.location.href;
    const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
    const results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}