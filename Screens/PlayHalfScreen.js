import React from 'react';
import {
    Alert,
    AsyncStorage,
    ToastAndroid,
    Image,
    View,
    ScrollView,
    TouchableOpacity,
    Text,
    TextInput,
    PermissionsAndroid,
    Share, ActivityIndicator
} from "react-native";
import MapboxGL from "@mapbox/react-native-mapbox-gl";
import Geolocation from 'react-native-geolocation-service';
import Api from '../Components/Api';
import NetInfo from "@react-native-community/netinfo";
import ViewPager from '@react-native-community/viewpager';
import RNFetchBlob from "rn-fetch-blob";
import Video from "react-native-video";
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import {Colors} from "../Components/Colors";
import {Constants} from "../Components/Constants";

const api = new Api();
const accessToken = "pk.eyJ1Ijoibmhlcm8iLCJhIjoiY2syZnMya2l1MGFrejNkbGhlczI1cjlnMCJ9.9QUBMhEvbP2RSkNfsjoQeA";
MapboxGL.setAccessToken(accessToken);

const audioRecorderPlayer = new AudioRecorderPlayer();

export default class PlayHalfScreen extends React.Component {
    constructor(props) {
        super(props);

        const mapCenter = JSON.parse(this.props.navigation.getParam('mapCenter'));
        const coordinates = JSON.parse(this.props.navigation.getParam('coordinates'));
        const zoomLevel = this.props.navigation.getParam('zoomLevel');

        this.state = {
            mapCenter: mapCenter,
            nw: {lng: "", lat: ""},
            se: {lng: "", lat: ""},
            mapZoomLevel: zoomLevel,
            coordinates: coordinates,
            markers: coordinates,
            search: false,
            searchQuery: "",
            searchResult: [],
            orderId: 0,
            rated: false,
            rating: "",
            likes: 0,
            dislikes: 0,
            fullScreen: false,
            pinId: "",
            mute: true,
            initialRateValue: 3,
            video: "",
            audio: "",
            uri: "",
            title: "",
            date: "",
            time: "",
            location: "",
            lat: "",
            lng: "",
            playBack: false,
            currentPositionSec: "",
            currentDurationSec: "",
            playTime: "",
            duration: "",
            hasLiked: false,
            videoLoading: false
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

        NetInfo.fetch().then(state => {
            if (!state.isConnected)
                Alert.alert("Connection Error!", "You are not connected to the internet, application may not work correctly.");

            if (!this.requestLocationPermission())
                Alert.alert("Permission Denied", "In order to have a better experience, Azurepin needs to access your location.");
        });
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
        // let mapCenter = JSON.parse(this.props.navigation.getParam('mapCenter'));
        // let coordinates = JSON.parse(this.props.navigation.getParam('coordinates'));
        // this.setState({mapCenter, coordinates});
    }

    getPins() {
        this.getCorners().then((corners) => {
            let nw = {lng: corners[1][0], lat: corners[0][1]};
            let se = {lng: corners[0][0], lat: corners[1][1]};
            let orderId = this.state.orderId+1;
            this.setState({nw, se, orderId}, () => {
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
                            if (response && response.result === "success" && response.orderId === orderId.toString()) {
                                if (response.pins && response.pins.length > 0) {
                                    let pins = response.pins;
                                    let markers = [];
                                    for (let i = 0; i < pins.length; i++)
                                        markers.push({
                                            id: pins[i].pinId.toString(),
                                            lng: parseFloat(pins[i].longitude),
                                            lat: parseFloat(pins[i].latitude),
                                            title: pins[i].title
                                        });

                                    this.setState({markers}, () => {
                                        this.forceUpdate();
                                        // this.onPageSelected(0);
                                    });
                                }
                                else
                                    Alert.alert('Woops!', 'Looks something went wrong!');
                            } else {
                                this.setState({markers: []}, () => {
                                    this.forceUpdate();
                                });
                            }
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
        AsyncStorage.getItem('userId', (err, userId) => {
            api.postRequest("Pin/LikePin", JSON.stringify([
                {key: "UserId", value: userId},
                {key: "PinId", value: this.state.pinId},
                {key: "LikeType", value: rating.toString()}
            ])).then((response) => {
                if (response && response.result === "success") {
                    ToastAndroid.show('rated successfully', ToastAndroid.SHORT);
                    this.setState({rated: true, rating: rating});
                }
            })
        });
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
    onPageSelected = (e) => {
        let index = e === 0 ? e : e.nativeEvent.position;

        console.log("index", this.state.coordinates[index]);

        this.setState({
            playback: false,
            pinId: "",
            rated: false,
            rating: "",
            likes: 0,
            dislikes: 0,
            initialRateValue: 3,
            title: "",
            lng: "",
            lat: "",
            date: "",
            time: "",
            location: "",
            uri: "",
            video: "",
            audio: ""
        }, () => {
            if (!this.state.coordinates[index].downloaded) {
                AsyncStorage.getItem('userId', (err, userId) => {
                    const { coordinates } = this.state;
                    if (coordinates && coordinates.length > 0) {
                        api.postRequest("Pin/GetPin", JSON.stringify([
                            {key: "UserId", value: userId},
                            {key: "PinId", value: coordinates[index].id},
                        ]))
                            .then((responseJson) => {
                                console.log(responseJson);
                                if (responseJson && responseJson.result === "success") {
                                    let dateTime = new Date(parseInt(responseJson.timestamp));
                                    let months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
                                    let year = dateTime.getFullYear();
                                    let month = months[dateTime.getMonth()];
                                    let date = dateTime.getDate();
                                    let hour = dateTime.getHours();
                                    let minute = dateTime.getMinutes();
                                    let location = responseJson.location;
                                    let url = Constants.baseUrl+responseJson.url.replace("~/", "").replace(/ /g, "%20");
                                    let video = null, audio = responseJson.type === 1 ? url : null;


                                    // set date time location
                                    this.setState({
                                        title: coordinates[index].title,
                                        date: month + " " + date + " " + year + " / ",
                                        time: (hour.toString().length < 2 ? "0"+hour : hour) + ":" + (minute.toString().length< 2 ? "0"+minute : minute) + " / ",
                                        location: location,
                                        audio: audio,
                                        video: video,
                                        rated: (responseJson.likeDislike === 1 || responseJson.likeDislike === -1),
                                        rating: responseJson.likeDislike,
                                        likes: responseJson.likes,
                                        dislikes: responseJson.dislikes,
                                    }, () => {
                                        coordinates[index].details = {
                                            pinId: coordinates[index].id,
                                            rated: (responseJson.likeDislike === 1 || responseJson.likeDislike === -1),
                                            rating: responseJson.likeDislike,
                                            likes: responseJson.likes,
                                            dislikes: responseJson.dislikes,
                                            initialRateValue: (responseJson.likes / 20),
                                            title: coordinates[index].title,
                                            lng: coordinates[index].lng,
                                            lat: coordinates[index].lat,
                                            date: month + " " + date + " " + year + " / ",
                                            time: (hour.toString().length < 2 ? "0"+hour : hour) + ":" + (minute.toString().length< 2 ? "0"+minute : minute) + " / ",
                                            location: location,
                                            uri: url,
                                            audio: audio,
                                            video: null
                                        };
                                    });

                                    if (responseJson.type === 2) {
                                        if (!coordinates[index].fileDownloaded) {
                                            this.setState({videoLoading: true}, () => {
                                                console.log("downloading...");
                                                RNFetchBlob
                                                    .config({
                                                        fileCache: true,
                                                        appendExt: 'mp4'
                                                    })
                                                    .fetch('GET', url)
                                                    .then((res) => {
                                                        this.setState({videoLoading: false}, () => {
                                                            console.log('The file saved to ', res.path());
                                                            coordinates[index].fileDownloaded = true;
                                                            video = Platform.OS === 'android' ? ('file://' + res.path()) : res.path();
                                                            this.setState({video: video}, () => {
                                                                coordinates[index].details.audio = "";
                                                                coordinates[index].details.video = video;
                                                                coordinates[index].fileDownloaded = true;
                                                            });
                                                        });
                                                    });
                                            });
                                        }
                                    } else if (responseJson.type === 1) {
                                        this._playAudio();
                                    }

                                    coordinates[index].downloaded = true;

                                    this.setState(this.state.coordinates[index].details, () => {
                                        this.forceUpdate();
                                    });
                                }
                            });
                    }
                });
            } else {
                this.setState(this.state.coordinates[index].details, () => {
                    if (this.state.coordinates[index].details.audio) {
                        this._playAudio();
                    }
                });
            }
        });
    };

    async _playAudio() {
        await audioRecorderPlayer.startPlayer(this.state.audio).then(() => this.setState({playBack: true}));
        audioRecorderPlayer.addPlayBackListener((e) => {
            if (e.current_position === e.duration) {
                audioRecorderPlayer.stopPlayer().then(() => this.setState({playBack: false}));
                audioRecorderPlayer.removePlayBackListener();
                this.setState({playBack: false});
            }
            this.setState({
                currentPositionSec: e.current_position,
                currentDurationSec: e.duration,
                playTime: audioRecorderPlayer.mmssss(Math.floor(e.current_position)),
                duration: audioRecorderPlayer.mmssss(Math.floor(e.duration)),
            });
        });
    }

    ratingCompleted(rating) {
        console.log("rating", rating);
        AsyncStorage.getItem('userId', (err, userId) => {
            api.postRequest("Pin/LikePin", JSON.stringify([
                {key: "UserId", value: userId},
                {key: "PinId", value: this.state.pinId},
                {key: "LikeType", value: rating.toString()}
            ])).then((response) => {
                if (response && response.result === "success") {
                    ToastAndroid.show('rated successfully', ToastAndroid.SHORT);
                    this.setState({rated: true});
                }
            })
        });
    }

    render() {
        return (
            <View style={{flex: 1}}>
                {this.state.fullScreen ? <Text></Text> :
                this.state.coordinates && this.state.coordinates.length > 0 ?
                    <ViewPager initialPage={0} style={{flex: 1}}
                               onPageSelected={(e) => this.onPageSelected(e)}>
                        {this.state.coordinates.map((item, key) => {
                            return (
                                <View key={key}>
                                    <View style={{flexDirection: 'row', margin: 15}}>
                                        <View style={{flex: 1}}>
                                            {this.state.videoLoading ?
                                                <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                                                    <ActivityIndicator size="large" color={Colors.primary}/>
                                                </View> :
                                                (this.state.video ?
                                            <View style={{width: 150, height: 150}}>
                                                <Video source={{uri: this.state.video}}
                                                       ref={(ref) => {this.player = ref }}
                                                       resizeMode="cover"
                                                       paused={false}
                                                       repeat={true}
                                                       style={{width: '100%', height: '100%'}}
                                                />
                                            </View> :
                                            <Image source={require('../assets/images/Audio.png')}
                                                   style={{width: 150, height: 150}}/>)}
                                        </View>
                                        <View style={{flex: 1}}>
                                            <Text style={styles.titleText} numberOfLines={1}>{this.state.title}</Text>
                                            <Text style={styles.subtitleText}>{this.state.date} {this.state.time} {this.state.location}</Text>
                                            {/*<TouchableOpacity onPress={(rating) => this.ratingCompleted(rating)}>*/}
                                                {/*<Image*/}
                                                    {/*source={this.state.rated ? require('../assets/images/Rated.png') : require('../assets/images/Rate.png')}*/}
                                                    {/*style={{width: 95, height: 11, alignSelf: 'center', margin: 18}}/>*/}
                                            {/*</TouchableOpacity>*/}
                                            <View style={{flexDirection: 'row', justifyContent: 'space-around'}}>
                                                <TouchableOpacity onPress={() => { this.ratingCompleted(1) }}>
                                                    <Image source={this.state.rating === 1 ? require('../assets/images/liked.png') : require('../assets/images/like.png')} style={{width: 40, height: 40}} />
                                                </TouchableOpacity>
                                                <View>
                                                    <Text style={{color: Colors.text, fontSize: 10}}>ratio</Text>
                                                    <Text style={{color: Colors.text, fontSize: 10}}>{this.state.likes} : {this.state.dislikes}</Text>
                                                </View>
                                                <TouchableOpacity onPress={() => { this.ratingCompleted(-1) }}>
                                                    <Image source={this.state.rating === -1 ? require('../assets/images/Disliked.png') : require('../assets/images/Dislike.png')} style={{width: 40, height: 40}} />
                                                </TouchableOpacity>
                                            </View>
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
                                </View>)})}
                        </ViewPager> :

                    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}><Text>No items in playlist</Text></View>
                }
                <View style={{flex:2}}>
                    <View style={styles.page}>
                        <View style={styles.container}>
                            <MapboxGL.MapView
                                ref={c => (this._map = c)}
                                style={styles.map}
                                logoEnabled={false}
                                zoomLevel={this.state.mapZoomLevel}
                                centerCoordinate={[this.state.mapCenter.lng, this.state.mapCenter.lat]}
                                showUserLocation={true}
                                onDidFinishRenderingMapFully={this.finishRenderMap}
                                onRegionDidChange={() => this.getPins()}
                            >
                                {this.state.markers.map((item, key) => {
                                    return <MapboxGL.PointAnnotation key={key} id={item.id} coordinate={[item.lng, item.lat]} />;
                                })}
                            </MapboxGL.MapView>

                            <TouchableOpacity onPress={() => {this.setState({search: true})}}
                                              style={[styles.icon, styles.searchIcon, {display: this.state.search ? 'none' : 'flex'}]}>
                                <Image source={require('../assets/images/Searchbar-close.png')}
                                       style={[styles.image, {display: this.state.search ? 'none' : 'flex'}]} />
                            </TouchableOpacity>

                            {this.state.search ?
                                <View style={styles.searchOpenIcon}>
                                    <TouchableOpacity  onPress={() => {this.setState({search: false, searchResult: []})}}>
                                        <Image source={require('../assets/images/Searchbar-close.png')}
                                               style={[styles.image, {width: 57, height: 57}]}/>
                                    </TouchableOpacity>
                                    <TextInput
                                        style={[styles.textInput, {position: this.state.search ? 'absolute' : 'relative'}]}
                                        placeholder="New Search"
                                        onChangeText={text => this.searchPlaces(text)}
                                        value={this.state.searchQuery}
                                    />
                                    <TouchableOpacity onPress={() => {this.gotoCurrentLocation();}}>
                                        <Image source={require('../assets/images/Blue-Location.png')}
                                               style={{width: 20, height: 19, marginRight: 20}}/>
                                    </TouchableOpacity>
                                </View> : <View></View>
                            }
                            {this.state.searchResult ?
                                <ScrollView style={[styles.placesContainer, {display: this.state.searchResult.length > 0 ? 'flex' : 'none', position: this.state.searchResult.length > 0 ? 'absolute' : 'relative'}]}>
                                    {this.state.searchResult.map((item, key) => {
                                        return  <TouchableOpacity key={key} style={styles.searchResultItem}
                                                                  onPress={() => this.setCenterToResultItem(item.center[0], item.center[1])} >
                                            <Text style={styles.searchResultItemText}>{item.place_name}</Text>
                                        </TouchableOpacity>;
                                    })}
                                </ScrollView> : ''
                            }

                            <TouchableOpacity style={[styles.icon, styles.playIcon]}
                                              onPress={() => this.props.navigation.navigate('Play', {coordinates: JSON.stringify(this.state.markers)})}>
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
};
