const baseUrl = "http://185.173.106.155/";
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
            body: formData,
            timeout: 300000
        })
            .then(response => response.json())
            .catch(err => {
                console.log("err", err);
        });
    }

    async getRequest(url) {
        return await fetch(baseUrl+url)
            .then(response => response.json())
            .catch(err => {
                console.log("err", err);
            });
    }

    async getLocationName(lat, lng) {
        const accessToken = "pk.eyJ1Ijoibmhlcm8iLCJhIjoiY2syZnMya2l1MGFrejNkbGhlczI1cjlnMCJ9.9QUBMhEvbP2RSkNfsjoQeA";

        return await fetch('https://api.mapbox.com/geocoding/v5/mapbox.places/' + lng + ',' + lat + '.json?access_token=' + accessToken)
            .then((response) => response.json())
            .then((responseJson) => responseJson.features[1].place_name)
            .catch((error) => {
                console.error(error);
            });
    }
}
