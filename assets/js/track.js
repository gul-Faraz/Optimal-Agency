document.addEventListener('DOMContentLoaded', function () {

    $('form').on('submit', function (e) {
        e.preventDefault(); // prevent reload
        const phone = $(this).find('input[name="phone"]').val();
        if (!phone) return;
        sendFormAttribution(phone);
    });


    function sendFormAttribution(phone = null) {
        const dataToSend = {
            form_id: 'contact-form',
            fields: {
                phone: phone
            },
            metadata: {
                timestamp: new Date().toISOString(),
                page_url: window.location.href,
                referrer: document.referrer || 'none',
                utm_source: getParam('utm_source'),
                utm_medium: getParam('utm_medium'),
                utm_campaign: getParam('utm_campaign'),
                utm_term: getParam('utm_term'),
                utm_content: getParam('utm_content'),
                gclid: getParam('gclid'),
                fbclid: getParam('fbclid'),
                device: /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
                browser: navigator.userAgent
            }
        };

        fetch('https://staging.monitizetext.com/api/v1/form/submission/', {
            method: 'POST',
            headers: {
                'x-requested-with': 'XMLHttpRequest',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dataToSend),
        })
            .then((response) => {
                if (!response.ok) throw new Error("Request failed");
                return response.json();
            })
            .then((res) => {
                console.log("Data sent successfully:", res);
            })
            .catch((error) => {
                console.error("Fetch error:", error.message);
            });
    }

    function getParam(name) {
        const url = new URL(window.location.href);
        return url.searchParams.get(name) || 'none';
    }

});