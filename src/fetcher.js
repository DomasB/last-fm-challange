const fetch = require('node-fetch');
export default function fetcher(url, callback) {
    fetch(
        url,
        {
            method: "GET",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
            }
        }
    )
        .then(response => response.json())
        .catch(error => console.error('Fetch error:', error))
        .then(r => { callback(r); });
}