document.getElementById('mobile-menu').addEventListener('click', () => {
    document.querySelector('.navbar-menu').classList.toggle('active');
});

function isValidUrl(url) {
    const urlPattern = new RegExp('^(https?:\\/\\/)?'+ 
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|'+ 
        '((\\d{1,3}\\.){3}\\d{1,3}))'+ 
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ 
        '(\\?[;&a-z\\d%_.~+=-]*)?'+ 
        '(\\#[-a-z\\d_]*)?$','i'); 
    return !!urlPattern.test(url);
}

function checkUrl() {
    const url = document.getElementById('urlInput').value;
    if (!isValidUrl(url)) {
        document.getElementById('result').innerText = 'Invalid URL format.';
        return;
    }

    fetch('/check-url', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url })
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('result').innerText = data.message;
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById('result').innerText = 'An error occurred. Please try again.';
    });
}

function reportUrl() {
    const url = document.getElementById('reportUrlInput').value;
    if (!isValidUrl(url)) {
        alert('Invalid URL format.');
        return;
    }

    fetch('/report-url', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url })
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        alert(data.message);
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    });
}
