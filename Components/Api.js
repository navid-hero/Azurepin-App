const baseUrl = "http://192.99.246.61/";
export default class Api {
    async postRequest(url, data) {
        let dataArray = JSON.parse(data);
        let formData = new FormData();
        for (let i=0; i<dataArray.length; i++)
            formData.append(dataArray[i].key, dataArray[i].value);

        return await fetch(baseUrl+url,{
            method: 'post',
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            body: formData
        })
            .then(response => response.json())
            .catch(err => {
            console.log(err)
        });
    }
}
