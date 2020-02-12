import React from 'react';
import {
    Alert,
    StyleSheet,
    Image,
    KeyboardAvoidingView,
    View,
    ScrollView,
    TouchableOpacity,
    Text,
    TextInput,
    AsyncStorage
} from "react-native";
import MapboxGL from "@mapbox/react-native-mapbox-gl";
import {PermissionsAndroid} from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import NetInfo from "@react-native-community/netinfo";
import Api from '../Components/Api';
import {NavigationActions, StackActions} from "react-navigation";

const accessToken = "pk.eyJ1Ijoibmhlcm8iLCJhIjoiY2syZnMya2l1MGFrejNkbGhlczI1cjlnMCJ9.9QUBMhEvbP2RSkNfsjoQeA";
MapboxGL.setAccessToken(accessToken);

const api = new Api();

export default class HomeScreen extends React.Component {

    constructor(props) {
        super(props);

        AsyncStorage.getItem('userId', (err, userId) => {
            AsyncStorage.getItem('logged_in', (err, loggedIn) => {
                if ((!(userId > 0)) || loggedIn !== "true") {
                    const resetAction = StackActions.reset({
                        index: 0,
                        actions: [NavigationActions.navigate({ routeName: 'Splash' })],
                    });
                    this.props.navigation.dispatch(resetAction);
                }
            });
        });

        this.state = {
            mapCenter: {lng: 175.2908138, lat: -37.7906929},
            mapCenterParam: {lng: "", lat: ""},
            nw: {lng: "", lat: ""},
            se: {lng: "", lat: ""},
            mapZoomLevel: 13,
            coordinates: [],
            search: false,
            searchQuery: "",
            searchResult: [],
            orderId: 0
        };

        this.finishRenderMap = this.finishRenderMap.bind(this);
        this.searchPlaces = this.searchPlaces.bind(this);
        this.setCenterToResultItem = this.setCenterToResultItem.bind(this);
    }

    componentDidMount() {
        MapboxGL.setTelemetryEnabled(false);
        NetInfo.fetch().then(state => {
            // console.log("Connection type", state.type);
            // console.log("Is connected?", state.isConnected);
            if (!state.isConnected)
                Alert.alert("Connection Error!", "You are not connected to the internet, application may not work correctly.");

            if (!this.requestLocationPermission())
                Alert.alert("Permission Denied", "In order to have a better experience, Azurepin needs to access your location.");
        });

        AsyncStorage.getItem('userId', (err, userId) => {console.log(userId)});

        // let drafts = [
        //     {id: 1, title: "GooOoooOoooOoooAL", time: "5M"},
        //     {id: 2, title: "Was a Foul", time: "10M"},
        //     {id: 3, title: "New Zealand", time: "15M"},
        //     {id: 4, title: "Azurepin", time: "59M"}
        // ];
        // AsyncStorage.setItem('drafts', JSON.stringify(drafts));
    }

    async requestLocationPermission() {
        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                {
                    title: 'Access Location',
                    message: 'Azurepin needs access to your location',
                    buttonNeutral: 'Ask Me Later',
                    buttonNegative: 'Cancel',
                    buttonPositive: 'OK',
                },
            );
            return granted === PermissionsAndroid.RESULTS.GRANTED;
        } catch (err) {
            return false;
        }
    }

    finishRenderMap() {
        if (this.requestLocationPermission())
            this.gotoCurrentLocation();
        else
            Alert.alert("Permission Denied", "In order to have a better experience, Azurepin needs to access your location.");
    }

    async getPins() {
        const center = await this._map.getCenter();
        const mapCenterParam = {lng : center[0], lat : center[1]};
        let coordinates = [];
        this.getCorners().then((corners) => {
            let nw = {lng: corners[1][0], lat: corners[0][1]};
            let se = {lng: corners[0][0], lat: corners[1][1]};
            let orderId = this.state.orderId+1;
            this.setState({nw, se, orderId, mapCenterParam, coordinates}, () => {
                AsyncStorage.getItem('userId', (err, userId) => {
                    api.postRequest("Pin/GetPins", JSON.stringify([
                        {key: "UserId", value: userId},
                        {key: "Lat1", value: nw.lat.toString()},
                        {key: "Lat2", value: se.lat.toString()},
                        {key: "Lon1", value: nw.lng.toString()},
                        {key: "Lon2", value: se.lng.toString()},
                        {key: "Count", value: "20"},
                        {key: "OrderId", value: orderId.toString()}
                    ]))
                        .then((response) => {
                            console.log("pins", response);
                            if (response && response.result === "success" && response.orderId === orderId.toString())
                                if (response.pins && response.pins.length > 0) {
                                    let pins = response.pins;

                                    for (let i=0; i<pins.length; i++)
                                        coordinates.push({
                                            id: pins[i].pinId.toString(),
                                            lng: parseFloat(pins[i].longitude),
                                            lat: parseFloat(pins[i].latitude),
                                            title: pins[i].title
                                        });

                                    this.setState({coordinates}, () => {console.log("state coord",this.state.coordinates)});
                                }
                                else
                                    Alert.alert('Woops!', 'Looks something went wrong!');
                        })
                        .catch((error) => {
                            console.error(error);
                        });
                });
            });
        });

    }

    gotoCurrentLocation = () => {
        Geolocation.getCurrentPosition(
            (position) => {
                this.setState({
                    mapCenter: {
                        lng: position.coords.longitude,
                        lat: position.coords.latitude
                    }
                });

                this.getPins();
            },
            (error) => {
                if (error.code === 5) // Location settings are not satisfied.
                    Alert.alert("Permission Denied", "In order to have a better experience, Azurepin needs to access your location.");
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );

    };

    async getCorners() {
        if (this._map !== null) {
            return await this._map.getVisibleBounds();
        } else {
            console.log("this._map is null");
        }
    }

    searchPlaces(query) {
        console.log("start search");
        this.setState({searchQuery: query}, function() {
            if (query.length > 0) {
                fetch('https://api.mapbox.com/geocoding/v5/mapbox.places/' + query + '.json?access_token=' + accessToken)
                    .then((response) => response.json())
                    .then((responseJson) => {
                        console.log(responseJson);
                        if (responseJson)
                            this.setState({
                                searchResult: responseJson.features
                            }, function () {
                                // console.log(this.state.searchResult);
                            });
                    })
                    .catch((error) => {
                        console.error(error);
                    });
            } else {
                this.setState({
                    searchResult: []
                });
            }
        });
    }

    setCenterToResultItem(lng, lat) {
        this.setState({
            search: false,
            searchQuery: "",
            searchResult: [],
            mapCenter: {lng: lng, lat: lat},
            mapZoomLevel: 5
        });
    }

    render() {
        return (
            <View style={styles.page}>
                <View style={styles.container}>
                    <MapboxGL.MapView
                        ref={c => (this._map = c)}
                        style={styles.map}
                        logoEnabled={false}
                        rotateEnabled={false}
                        compassEnabled={false}
                        zoomLevel={this.state.mapZoomLevel}
                        centerCoordinate={[this.state.mapCenter.lng, this.state.mapCenter.lat]}
                        showUserLocation={true}
                        onDidFinishRenderingMapFully={this.finishRenderMap}
                        onRegionDidChange={() => this.getPins()}
                    >
                        {this.state.coordinates.map((item, key) => {
                            console.log("creating marker", {lng: item.lng, lat: item.lat});
                            return <MapboxGL.PointAnnotation key={key}
                                                             id={item.id}
                                                             coordinate={[item.lng, item.lat]}
                                                             onSelected={(e) => {this.props.navigation.navigate('Play', {coordinates: JSON.stringify([this.state.coordinates[key]]), mapCenter: JSON.stringify(this.state.mapCenterParam), zoomLevel: this._map.getZoom()})}}
                            />;
                        })}
                    </MapboxGL.MapView>

                    <TouchableOpacity onPress={() => {this.setState({search: true})}}
                                      style={[styles.icon, styles.searchIcon, {display: this.state.search ? 'none' : 'flex'}]}>
                        <Image source={require('../assets/images/Searchbar-close.png')}
                               style={[styles.image, {display: this.state.search ? 'none' : 'flex'}]} />
                    </TouchableOpacity>

                    {this.state.search ?
                        <View style={styles.searchOpenIcon}>
                            <TouchableOpacity onPress={() => {this.setState({search: false, searchResult: []})}}>
                                <Image source={require('../assets/images/Searchbar-close.png')}
                                       style={[styles.image, {width: 57, height: 57}]}/>
                            </TouchableOpacity>
                            <TextInput
                                style={[styles.textInput, {position: this.state.search ? 'absolute' : 'relative'}]}
                                placeholder="Explore the world here! "
                                onChangeText={text => this.searchPlaces(text)}
                                value={this.state.searchQuery}
                            />
                            <TouchableOpacity onPress={() => {this.gotoCurrentLocation();}}>
                                <Image source={require('../assets/images/Blue-Location.png')}
                                       style={{width: 20, height: 19, marginRight: 20}}/>
                            </TouchableOpacity>
                        </View> : <View></View>
                    }

                    {this.state.searchResult &&
                        <ScrollView style={[styles.placesContainer, {display: this.state.searchResult.length > 0 ? 'flex' : 'none', position: this.state.searchResult.length > 0 ? 'absolute' : 'relative'}]}>
                            {this.state.searchResult.map((item, key) => {
                                return  <TouchableOpacity key={key}
                                                          style={styles.searchResultItem}
                                                          onPress={() => this.setCenterToResultItem(item.center[0], item.center[1])} >
                                    <Text style={styles.searchResultItemText}>{item.place_name}</Text>
                                </TouchableOpacity>;
                            })}
                        </ScrollView>}

                    <TouchableOpacity style={[styles.icon, styles.playIcon]}
                                      onPress={() => this.props.navigation.navigate('Play', {coordinates: JSON.stringify(this.state.coordinates), mapCenter: JSON.stringify(this.state.mapCenterParam)})}>
                        <Image source={require('../assets/images/Play.png')}
                               style={styles.image} />
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.icon, styles.pinIcon]}
                                      onPress={() => this.props.navigation.navigate('DropPin')}>
                        <Image source={require('../assets/images/Pin_+.png')}
                               style={styles.image} />
                    </TouchableOpacity>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    page: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F5FCFF"
    },
    container: {
        height: '100%',
        width: '100%',
        backgroundColor: "gray"
    },
    map: {
        flex: 1
    },
    icon: {
        width: 60,
        height: 60,
        position: 'absolute',
    },
    searchIcon: {
        right: 35,
        top: 50
    },
    searchOpenIcon: {
        height: 60,
        position: 'absolute',
        left: 35,
        right: 35,
        top: 50,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#DCDCDC',
        borderRadius: 50,
    },
    playIcon: {
        left: 35,
        bottom: 50
    },
    pinIcon: {
        right: 35,
        bottom: 50
    },
    image: {
        width: '100%',
        height: '100%',
    },
    textInput: {
        textAlign: 'left',
        backgroundColor: '#DCDCDC',
        color: '#707070',
        height: 60,
        left: 60,
        right: 40,
        padding: 15,
        paddingLeft: 5,
    },
    placesContainer: {
        left: 35,
        right: 35,
        top: 112,
        height: 120,
        backgroundColor: '#DCDCDC',
        color: '#707070',
        borderRadius: 20
    },
    searchResultItem: {
        margin: 10,
        marginTop: 0,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#c7c7c7'
    },
    searchResultItemText: {
        color: '#707070',
        paddingTop: 5
    }
});