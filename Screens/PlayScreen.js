import React from 'react';
import {ActivityIndicator, AsyncStorage, Clipboard, Image, Share, Text, ToastAndroid, TouchableOpacity, View} from "react-native";
import ActionSheet from 'react-native-actionsheet';
import {withNavigation} from "react-navigation";
import Api from '../Components/Api';
import Video from 'react-native-video';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import ViewPager from '@react-native-community/viewpager';
import { Colors } from "../Components/Colors";
import { Constants } from "../Components/Constants";
import RNFetchBlob from 'rn-fetch-blob'

const api = new Api();
const audioRecorderPlayer = new AudioRecorderPlayer();

class PlayScreen extends React.Component {
    constructor(props) {
        super(props);

        this.state= {
            coordinates: [],
            pinId: "",
            mute: false,
            rated: false,
            rating: "",
            likes: "",
            dislikes: "",
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
            paused: false,
            currentPositionSec: "",
            currentDurationSec: "",
            playTime: "",
            duration: "",
            hasLiked: false,
            optionArray: ['Report', 'Bookmark', 'Copy Link', 'Save', 'Settings', 'Cancel'],
            cancelButtonIndex: 5,
            destructiveButtonIndex: 0,
            videoLoading: false,
            start: "",
            end: "",
            currentTime: ""
        };
    }
    componentDidMount() {
        let coordinates = JSON.parse(this.props.navigation.getParam('coordinates'));
        for(let i=0; i<coordinates.length; i++) {
            coordinates[i].downloaded = false;
            coordinates[i].fileDownloaded = false;
            coordinates[i].details = {};
        }
        this.setState({coordinates}, () => {console.log(this.state.coordinates)});
    }

    componentWillUnmount () {
        this.setState({paused: true});
    }

    showActionSheet = () => {
        this.ActionSheet.show();
    };

    resetActionSheet() {
        this.setState({
            optionArray: ['Report', 'Bookmark', 'Copy Link', 'Save', 'Settings', 'Cancel'],
            cancelButtonIndex: 4,
            destructiveButtonIndex: 0
        });
    }

    onActionButtonPressed(index) {
        switch (index) {
            case 'Report':
                this.onReport();
                break;
            case 'Bookmark':
                this.onBookmark();
                break;
            case 'Copy Link':
                this.onCopyLink();
                break;
            case 'Save':
                break;
            case 'Settings':
                this.beforeNavigate();
                this.props.navigation.navigate('Setting');
                break;
            case 'Spam':
                this.onSpam();
                break;
            case 'Inappropriate':
                this.onInappropriate();
                break;
            case 'Cancel':
                this.resetActionSheet();
                break;
            default:
                alert(index);
                break;
        }
    }

    onReport() {
        this.setState({
            optionArray: ['Spam', 'Inappropriate', 'Cancel'],
            cancelButtonIndex: 2,
            destructiveButtonIndex: 0
        });
        this.ActionSheet.show();
    }

    onBookmark() {
        AsyncStorage.getItem('userId', (err, userId) => {
            api.postRequest("Pin/BookmarkPin", JSON.stringify([
                {key: "userId", value: userId},
                {key: "pinId", value: this.state.pinId}
            ])).then((response) => {
                if (response.result === "success")
                    ToastAndroid.show('Bookmarked successfully', ToastAndroid.SHORT);
            })
        });
    }

    onCopyLink() {
        Clipboard.setString(this.state.uri);
        console.log("uri", this.state.uri);
        ToastAndroid.show('Link copied to clipboard.', ToastAndroid.SHORT);
    }

    onSpam() {
        AsyncStorage.getItem('userId', (err, userId) => {
            api.postRequest("Pin/SpamPin", JSON.stringify([
                {key: "UserId", value: userId},
                {key: "PinId", value: this.state.pinId}
            ])).then((response) => {
                if (response.result === "success")
                    ToastAndroid.show('Marked as Spam!', ToastAndroid.SHORT);
            })
        });

        this.resetActionSheet();
    }

    onInappropriate() {
        AsyncStorage.getItem('userId', (err, userId) => {
            api.postRequest("Pin/InappropiratePin", JSON.stringify([
                {key: "UserId", value: userId},
                {key: "PinId", value: this.state.pinId}
            ])).then((response) => {
                if (response.result === "success")
                    ToastAndroid.show('Marked as Inappropriate!', ToastAndroid.SHORT);
            })
        });

        this.resetActionSheet();
    }

    async togglePlay() {
        if (this.state.video) {
            this.setState({paused: !this.state.paused});
        } else if (this.state.audio) {
            if (!this.state.playBack) {
                console.log("play", this.state.playBack);
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
            } else {
                console.log("pause", this.state.playBack);
                await audioRecorderPlayer.pausePlayer().then(() => this.setState({playBack: false}));
            }
        } else {
            //
        }
    }

    async beforeNavigate() {
        if (this.state.video)
            this.setState({paused: true});
        else if (this.state.audio)
            if (this.state.playBack)
                await audioRecorderPlayer.pausePlayer().then(() => this.setState({playBack: false}));
    }

    enableDisableSound() {
        this.setState({mute: !this.state.mute});
    }

    onShare = async () => {
        try {
            const result = await Share.share({ message: this.state.uri });

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
        let index = e.nativeEvent.position;

        console.log("index", this.state.coordinates[index]);

        this.setState({
            playback: false,
            pinId: "",
            rated: false,
            rating: "",
            likes: "",
            dislikes: "",
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
                                    let dateTime = new Date(parseInt(responseJson.timestamp)*1000);
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
                                        duration: responseJson.duration,
                                        audio: audio,
                                        video: video,
                                        rated: (responseJson.likeDislike === 1 || responseJson.likeDislike === -1),
                                        rating: responseJson.likeDislike,
                                        likes: responseJson.likes,
                                        dislikes: responseJson.dislikes
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
                this.setState(this.state.coordinates[index].details);
            }
        });
    };

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
                    this.setState({rated: true, rating: rating});
                }
            })
        });
    }

    render() {
        return (
            <View style={{flex: 1}}>
                <View style={{flexDirection:'row', justifyContent: 'center', alignItems: 'center', borderBottomColor: '#E3E3E3', borderBottomWidth: 1, margin: 10, padding: 10}}>
                    <ActionSheet
                        ref={o => (this.ActionSheet = o)}
                        options={this.state.optionArray}
                        //Define cancel button index in the option array
                        //this will take the cancel option in bottom and will highlight it
                        cancelButtonIndex={this.state.cancelButtonIndex}
                        //If you want to highlight any specific option you can use below prop
                        destructiveButtonIndex={this.state.destructiveButtonIndex}
                        onPress={index => {
                            //Clicking on the option will give you the index of the option clicked
                            this.onActionButtonPressed(this.state.optionArray[index]);
                        }}
                    />
                    <TouchableOpacity style={{flex:1, justifyContent: 'center', alignItems:'flex-start'}} onPress={() => {if(this.state.coordinates.length > 0) this.showActionSheet();}}>
                        <Image
                            source={require('../assets/images/More.png')}
                            style={{ width: 20, height: 19 }}
                        />
                    </TouchableOpacity>

                    <TouchableOpacity style={{flex: 2, justifyContent: 'center', alignItems:'center'}} onPress={() => {this.beforeNavigate(); this.props.navigation.navigate('Setting');}}>
                        <Image
                            source={require('../assets/images/Logo_Text.png')}
                            style={{ width: 129, height: 32 }}
                        />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => {this.props.navigation.pop();}} style={{flex: 1, justifyContent: 'center', alignItems:'flex-end', paddingRight: 15}}>
                        <Image
                            source={require('../assets/images/Cancel.png')}
                            style={{ width: 12, height: 12 }}
                        />
                    </TouchableOpacity>
                </View>

                {this.state.coordinates.length > 0 ?
                    <View style={{flex:1, margin: 0}}>
                        <ViewPager style={{flex: 5}} initialPage={0}
                                   onPageSelected={(e) => this.onPageSelected(e)}>
                            {this.state.coordinates.map((item, key) => {
                                return (<View key={key}>
                                    <View style={{flex:1, flexDirection: 'row', padding: 15}}>
                                        <View style={{flex: 6}}>
                                            <Text style={styles.titleText}>{this.state.title}</Text>
                                            <Text style={styles.subtitleText}>{this.state.date}{this.state.time}{this.state.location}</Text>
                                        </View>
                                        <View style={{flex: 1, alignItems: 'flex-end'}}>
                                            <TouchableOpacity onPress={() => {this.beforeNavigate(); this.props.navigation.navigate('Detail', {lat: this.state.lat, lng: this.state.lng});}}>
                                                <Image source={require('../assets/images/Location.png')}
                                                       style={{width: 40, height: 40}}/>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                    <View style={{flex:6}}>
                                        <View key={key} style={{backgroundColor: '$#9f9f9'}}>
                                            {this.state.audio ?
                                                <View style={{borderWidth: 1, borderColor: Colors.border, borderRadius: 5, height: '100%', marginHorizontal: 10, justifyContent: 'center', alignItems: 'center'}}>
                                                    <TouchableOpacity onPress={() => this.togglePlay()}>
                                                        <Image source={this.state.playBack ? require('../assets/images/Audio-Pause.png') : require('../assets/images/Audio-Play.png')} />
                                                    </TouchableOpacity>
                                                </View>
                                                :
                                                <View>
                                                    <Video source={{uri: this.state.video}}
                                                           ref={(ref) => {this.player = ref }}
                                                           resizeMode="contain"
                                                           paused={this.state.paused}
                                                           muted={this.state.mute}
                                                        // onEnd={() => { this.setState({playBack: false}) }}
                                                        // bufferConfig={{
                                                        //     minBufferMs: 5000,
                                                        //     maxBufferMs: 5000,
                                                        //     bufferForPlaybackMs: 5000,
                                                        //     bufferForPlaybackAfterRebufferMs: 5000
                                                        // }}
                                                        // posterResizeMode="contain"
                                                        // onLoadStart={() => {this.setState({videoLoading: true})}}
                                                        // onBuffer={() => {this.setState({videoLoading: true})}}
                                                        // onLoad={() => {this.setState({videoLoading: false})}}
                                                           repeat={true}
                                                           style={{width: '100%', height: '100%'}}
                                                    />
                                                    <TouchableOpacity style={[styles.playContent, {top: '40%'}]} onPress={() => {this.togglePlay()}}>
                                                        {this.state.videoLoading ? <ActivityIndicator size="large" color={Colors.primary}/> :
                                                            <Image source={this.state.paused ? require('../assets/images/Play-Button.png') : require('../assets/images/Pasue-Button.png')} />}
                                                    </TouchableOpacity>
                                                </View>
                                            }
                                        </View>
                                    </View>
                                </View>);
                            })}
                        </ViewPager>
                        <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-between', padding: 15}}>
                            <TouchableOpacity onPress={() => {this.enableDisableSound()}}>
                                <Image source={this.state.mute ? require('../assets/images/Mute.png') : require('../assets/images/More-Volume.png')}
                                       style={{ height: 19, width: 29, marginTop: 10 }} />
                            </TouchableOpacity>
                            {/*<Rating*/}
                                {/*type='custom'*/}
                                {/*ratingImage={RATE_IMAGE}*/}
                                {/*ratingColor={Colors.primary}*/}
                                {/*ratingBackgroundColor={Colors.light}*/}
                                {/*imageSize={15}*/}
                                {/*onFinishRating={(rating) => this.ratingCompleted(rating)}*/}
                                {/*readonly={this.state.rated}*/}
                                {/*startingValue={this.state.initialRateValue}*/}
                            {/*/>*/}

                            <View style={{flexDirection: 'row'}}>
                                <TouchableOpacity onPress={() => { this.ratingCompleted(1) }}>
                                    <Image source={this.state.rating === 1 ? require('../assets/images/liked.png') : require('../assets/images/like.png')}
                                           style={{ height: 40, width: 40 }} />
                                </TouchableOpacity>
                                <View style={{paddingHorizontal: 10, alignItems: 'center'}}>
                                    <Text style={{color: Colors.text, fontSize: 10}}>ratio</Text>
                                    <Text style={{color: Colors.text, fontSize: 10}}>{this.state.likes} : {this.state.dislikes}</Text>
                                </View>
                                <TouchableOpacity onPress={() => { this.ratingCompleted(-1) }}>
                                    <Image source={this.state.rating === -1 ? require('../assets/images/Disliked.png') : require('../assets/images/Dislike.png')}
                                           style={{ height: 40, width: 40 }} />
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity onPress={() => {this.onShare()}} style={{marginTop: 2}}>
                                <Image source={require('../assets/images/Share.png')}
                                       style={{ height: 24, width: 24 }} />
                            </TouchableOpacity>
                        </View>
                    </View>
                :
                <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                    <Text style={{color: Colors.text, textAlign: 'center', padding: 10}}>No playlist available for this area at the moment!</Text>
                </View>}
                <View style={{alignItems: 'center'}}>
                    <TouchableOpacity style={{position: 'absolute', bottom: 0, padding: 10}}
                                      onPress={() => {this.beforeNavigate(); this.props.navigation.navigate('PlayHalf', {mapCenter: this.props.navigation.getParam('mapCenter'), zoomLevel:  this.props.navigation.getParam('zoomLevel'), coordinates: JSON.stringify(this.state.coordinates)});}}>
                        <Image source={require('../assets/images/Rectangle-64.png')}
                               style={{ height: 10, width: 150, borderRadius: 5 }} />
                    </TouchableOpacity>
                </View>
            </View>

        );
    }
}

const styles = {
    titleText: {
        color: '#666666',
        fontSize: 15,
        fontWeight: 'bold'
    },
    subtitleText: {
        color: '#666666',
        fontSize: 11
    },
    playContent: {
        height: 62,
        width: 62,
        position: 'absolute',
        left: '40%',
    }
};

export default withNavigation(PlayScreen);