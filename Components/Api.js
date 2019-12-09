const baseUrl = "http://192.99.246.61/";
export default class Api {
    async postRequest(url, data) {
        return await fetch(baseUrl + url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: data,
        })
            .then((response) => response.json())
            .catch((error) => {
                console.error(error);
            });
    }
}