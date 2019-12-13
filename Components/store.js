import AsyncStorage from 'react-native';

export default class Storage {

    static storeData = (key, value) => {
        try {
            AsyncStorage.setItem(key, value, () => {
                console.log(key + " stored successfully");
            });
        } catch (e) {
            console.log("store data error", e);
        }
    };

    static getData = (key) => {
        try {
            AsyncStorage.getItem(key, (err, result) => {
                return result;
            });
        } catch(e) {
            console.log("get data error", e);
            return null;
        }
    };

}