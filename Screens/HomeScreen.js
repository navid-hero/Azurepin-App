import React from 'react';
import {StyleSheet, Image, View, ScrollView, TouchableOpacity, Text, TextInput} from "react-native";
import MapboxGL from "@mapbox/react-native-mapbox-gl";
import {PermissionsAndroid} from 'react-native';
import Geolocation from 'react-native-geolocation-service';
const accessToken = "pk.eyJ1Ijoibmhlcm8iLCJhIjoiY2syZnMya2l1MGFrejNkbGhlczI1cjlnMCJ9.9QUBMhEvbP2RSkNfsjoQeA";
MapboxGL.setAccessToken(accessToken);

export default class HomeScreen extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            mapCenter: {lng: 175.2908138, lat: -37.7906929},
            coordinates: [
                    {id: "1", lng: 175.2908138, lat: -37.7906929},
                    {id: "2", lng: 175.28, lat: -37.78},
                    {id: "3", lng: 175.28, lat: -37.8},
                    {id: "4", lng: 175.3, lat: -37.8}
                ],
            search: false,
            searchQuery: "",
            searchResult: [],
        };

        this.finishRenderMap = this.finishRenderMap.bind(this);
        this.searchPlaces = this.searchPlaces.bind(this);
    }

    componentDidMount() {
        MapboxGL.setTelemetryEnabled(false);
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
        if (this.requestLocationPermission()) {
            Geolocation.getCurrentPosition(
                (position) => {
                    this.setState({
                        mapCenter: {
                            lng: position.coords.longitude,
                            lat: position.coords.latitude
                        }
                    });
                },
                (error) => {
                    console.log(error.code, error.message);
                },
                { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
            );
        }
    }

    searchPlaces(query) {
        if (query.length > 0) {
            fetch('https://api.mapbox.com/geocoding/v5/mapbox.places/' + query + '.json?access_token=' + accessToken)
                .then((response) => response.json())
                .then((responseJson) => {
                    this.setState({
                        searchQuery: query,
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
                searchQuery: query,
                searchResult: []
            });
        }
    }

    render() {
        return (
            <View style={styles.page}>
                <View style={styles.container}>
                    <MapboxGL.MapView
                        style={styles.map}
                        logoEnabled={false}
                        zoomLevel={13}
                        centerCoordinate={[this.state.mapCenter.lng, this.state.mapCenter.lat]}
                        showUserLocation={true}
                        onDidFinishRenderingMapFully={this.finishRenderMap}
                    >
                        {this.state.coordinates.map((item, key) => {
                            return <MapboxGL.PointAnnotation id={item.id} coordinate={[item.lng, item.lat]} />;
                        })}
                    </MapboxGL.MapView>

                    <TouchableOpacity onPress={() => {this.setState({search: true})}}
                                      style={[styles.icon, styles.searchIcon, {display: this.state.search ? 'none' : 'flex'}]}>
                        <Image source={require('../assets/images/Searchbar-close.png')}
                               style={[styles.image, {display: this.state.search ? 'none' : 'flex'}]} />
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.searchOpenIcon, {display: this.state.search ? 'flex' : 'none'}]}>
                        <Image source={require('../assets/images/Searchbar-open.png')}
                               style={[styles.image, {display: this.state.search ? 'flex' : 'none'}]} />
                        <TextInput style={[styles.textInput, {display: this.state.search ? 'flex' : 'none', position: this.state.search ? 'absolute': 'relative'}]}
                                   placeholder="Search Now"
                                   onChangeText={text => this.searchPlaces(text)}
                        />
                    </TouchableOpacity>
                    {this.state.searchResult ?
                        <ScrollView style={[styles.placesContainer, {display: this.state.searchResult.length > 0 ? 'flex' : 'none', position: this.state.searchResult.length > 0 ? 'absolute' : 'relative'}]}>
                            {this.state.searchResult.map((item, key) => {
                                return <TouchableOpacity style={styles.searchResultItem}><Text style={styles.searchResultItemText}>{item.place_name}</Text></TouchableOpacity>;
                            })}
                        </ScrollView> : ''
                    }

                    <TouchableOpacity style={[styles.icon, styles.playIcon]}>
                        <Image source={require('../assets/images/Play.png')}
                               style={styles.image} />
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.icon, styles.pinIcon]}>
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
        top: 50
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
        top: 110,
        height: 120,
        backgroundColor: '#DCDCDC',
        opacity: 0.95,
        color: '#707070'
    },
    searchResultItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#c7c7c7'
    },
    searchResultItemText: {
        color: '#707070'
    }
});