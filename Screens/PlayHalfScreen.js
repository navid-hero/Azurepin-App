import React from 'react';
import {
    StyleSheet,
    Image,
    View,
    ScrollView,
    TouchableOpacity,
    Text,
    TextInput,
    PermissionsAndroid,
    Share
} from "react-native";
import MapboxGL from "@mapbox/react-native-mapbox-gl";
import Geolocation from 'react-native-geolocation-service';

const accessToken = "pk.eyJ1Ijoibmhlcm8iLCJhIjoiY2syZnMya2l1MGFrejNkbGhlczI1cjlnMCJ9.9QUBMhEvbP2RSkNfsjoQeA";
MapboxGL.setAccessToken(accessToken);

export default class PlayHalfScreen extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            mapCenter: {lng: 175.2908138, lat: -37.7906929},
            mapZoomLevel: 13,
            coordinates: [
                {id: "1", lng: 175.2908138, lat: -37.7906929},
                {id: "2", lng: 175.28, lat: -37.78},
                {id: "3", lng: 175.28, lat: -37.8},
                {id: "4", lng: 175.3, lat: -37.8}
            ],
            search: false,
            searchQuery: "",
            searchResult: [],
            rated: false,
            fullScreen: false,
        };

        this.finishRenderMap = this.finishRenderMap.bind(this);
        this.searchPlaces = this.searchPlaces.bind(this);
        this.setCenterToResultItem = this.setCenterToResultItem.bind(this);
        this.onShare = this.onShare.bind(this);
        this.rate = this.rate.bind(this);
        this.goFullScreen = this.goFullScreen.bind(this);
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
        this.setState({searchQuery: query}, function() {
            if (query.length > 0) {
                fetch('https://api.mapbox.com/geocoding/v5/mapbox.places/' + query + '.json?access_token=' + accessToken)
                    .then((response) => response.json())
                    .then((responseJson) => {
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
            mapZoomLevel: 11
        });
    }

    rate() {
        this.setState({rated: !this.state.rated});
    }

    goFullScreen = () => {
        this.setState({fullScreen: true});
    };

    onShare = async () => {
        try {
            const result = await Share.share({
                message:
                    'Azurepin | Share This content',
            });

            if (result.action === Share.sharedAction) {
                if (result.activityType) {
                    // shared with activity type of result.activityType
                } else {
                    // shared
                }
            } else if (result.action === Share.dismissedAction) {
                // dismissed
            }
        } catch (error) {
            alert(error.message);
        }
    };

    render() {
        return (
            <View style={{flex: 1}}>
                {!this.state.fullScreen ?
                    <View>
                        <View style={{flexDirection: 'row', margin: 15}}>
                            <View style={{flex: 1}}>
                                <Image source={require('../assets/images/Video-small.png')}
                                       style={{width: 150, height: 150}}/>
                            </View>
                            <View style={{flex: 1}}>
                                <Text style={styles.titleText} numberOfLines={1}>Gretta is here in New York</Text>
                                <Text style={styles.subtitleText}>FEBRUARY 22, 2019 / 8:16 AM / New York, US</Text>
                                <TouchableOpacity onPress={() => {
                                    this.rate();
                                }}>
                                    <Image
                                        source={this.state.rated ? require('../assets/images/Rated.png') : require('../assets/images/Rate.png')}
                                        style={{width: 95, height: 11, alignSelf: 'center', margin: 18}}/>
                                </TouchableOpacity>

                                <View style={{
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    margin: 5
                                }}>
                                    <TouchableOpacity onPress={() => {
                                        this.onShare();
                                    }}>
                                        <Image source={require('../assets/images/Share.png')}
                                               style={{width: 13, height: 18}}/>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => {this.goFullScreen();}}>
                                        <Image source={require('../assets/images/Cancel.png')}
                                               style={{width: 12, height: 12}}/>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>

                        <View style={{marginBottom: 5}}>
                            <TouchableOpacity onPress={() => {this.props.navigation.goBack();}}
                                              style={{alignSelf: 'center'}} >
                                <Image source={require('../assets/images/Rectangle-64.png')}
                                       style={{width: 145, height: 10, borderRadius: 10}}/>
                            </TouchableOpacity>
                        </View>
                    </View> : <View></View>
                }
                <View style={{flex:1}}>
                    <View style={styles.page}>
                        <View style={styles.container}>
                            <MapboxGL.MapView
                                style={styles.map}
                                logoEnabled={false}
                                zoomLevel={this.state.mapZoomLevel}
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

                            {this.state.search ?
                                <View style={styles.searchOpenIcon}>
                                    <Image source={require('../assets/images/Searchbar-close.png')}
                                           style={[styles.image, {width: 57, height: 57}]}/>
                                    <TextInput
                                        style={[styles.textInput, {position: this.state.search ? 'absolute' : 'relative'}]}
                                        placeholder="New Search"
                                        onChangeText={text => this.searchPlaces(text)}
                                        value={this.state.searchQuery}
                                    />
                                    <Image source={require('../assets/images/Blue-Location.png')}
                                           style={{width: 20, height: 19, marginRight: 10}}/>
                                </View> : <View></View>
                            }
                            {this.state.searchResult ?
                                <ScrollView style={[styles.placesContainer, {display: this.state.searchResult.length > 0 ? 'flex' : 'none', position: this.state.searchResult.length > 0 ? 'absolute' : 'relative'}]}>
                                    {this.state.searchResult.map((item, key) => {
                                        return  <TouchableOpacity style={styles.searchResultItem}
                                                                  onPress={() => this.setCenterToResultItem(item.center[0], item.center[1])} >
                                            <Text style={styles.searchResultItemText}>{item.place_name}</Text>
                                        </TouchableOpacity>;
                                    })}
                                </ScrollView> : ''
                            }

                            <TouchableOpacity style={[styles.icon, styles.playIcon]}
                                              onPress={() => this.props.navigation.navigate('Play')}>
                                <Image source={require('../assets/images/Play.png')}
                                       style={styles.image} />
                            </TouchableOpacity>

                            <TouchableOpacity style={[styles.icon, styles.pinIcon]}>
                                <Image source={require('../assets/images/Pin_+.png')}
                                       style={styles.image} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        );
    }
}

const styles = {
    titleText: {
        color: '#666666',
        fontSize: 15,
        margin: 5
    },
    subtitleText: {
        color: '#666666',
        fontSize: 11,
        margin: 5
    },
    playContent: {
        height: 62,
        width: 62,
        position: 'absolute',
        top: '40%',
        left: '40%'
    },
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
        top: 110,
        height: 120,
        backgroundColor: '#DCDCDC',
        color: '#707070'
    },
    searchResultItem: {
        margin: 10,
        marginTop: 0,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#c7c7c7'
    },
    searchResultItemText: {
        color: '#707070'
    }
};
