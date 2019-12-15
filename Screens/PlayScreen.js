import React from 'react';
import {AsyncStorage, Clipboard, Image, Share, Text, ToastAndroid, TouchableOpacity, View} from "react-native";
import ActionSheet from 'react-native-actionsheet';
import {withNavigation} from "react-navigation";
import Api from '../Components/Api';
import Video from 'react-native-video';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import ViewPager from '@react-native-community/viewpager';
import { Rating } from 'react-native-elements';
import {Colors} from "../Components/Colors";

const api = new Api();
const audioRecorderPlayer = new AudioRecorderPlayer();
const RATE_IMAGE = require('../assets/images/rate-icon.png');

class PlayScreen extends React.Component {
    constructor(props) {
        super(props);

        this.state= {
            coordinates: [],
            pinId: "",
            mute: true,
            rated: false,
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
            optionArray: ['Report', 'Bookmark', 'Copy Link', 'Save', 'Cancel'],
            cancelButtonIndex: 4,
            destructiveButtonIndex: 0
        };
    }
    componentDidMount() {
        let coordinates = JSON.parse(this.props.navigation.getParam('coordinates'));
        this.setState({coordinates});
    }

    showActionSheet = () => {
        this.ActionSheet.show();
    };

    resetActionSheet() {
        this.setState({
            optionArray: ['Report', 'Bookmark', 'Copy Link', 'Save', 'Cancel'],
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

    async changePlayIcon() {
        if (this.state.video.length > 0) {
            this.setState({playBack: !this.state.playBack});
        } else if (this.state.audio.length > 0) {
            if (this.state.playBack === false) {
                console.log('onStartPlay');
                const msg = await audioRecorderPlayer.startPlayer(this.state.audio);
                console.log(msg);
                audioRecorderPlayer.addPlayBackListener((e) => {
                    if (e.current_position === e.duration) {
                        console.log('finished');
                        const stop = audioRecorderPlayer.stopPlayer();
                        console.log("stop", stop);
                        this.setState({playBack: !this.state.playBack});
                        audioRecorderPlayer.removePlayBackListener();
                    }
                    this.setState({
                        currentPositionSec: e.current_position,
                        currentDurationSec: e.duration,
                        playTime: audioRecorderPlayer.mmssss(Math.floor(e.current_position)),
                        duration: audioRecorderPlayer.mmssss(Math.floor(e.duration)),
                    });
                });
            } else {
                const msg = await audioRecorderPlayer.pausePlayer();
                console.log("msg", msg);
            }
            this.setState({playBack: !this.state.playBack});
        }
    }
    enableDisableSound() {
        this.setState({mute: !this.state.mute});
    }

    onShare = async () => {
        try {
            const result = await Share.share({
                message:
                    'Azurepin | Share Me',
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
        let index = e.nativeEvent.position;

        AsyncStorage.getItem('userId', (err, userId) => {
            const { coordinates } = this.state;
            if (coordinates.length > 0) {
                api.postRequest("Pin/GetPin", JSON.stringify([
                    {key: "UserId", value: userId},
                    {key: "PinId", value: coordinates[index].id},
                ]))
                    .then((responseJson) => {
                        if (responseJson && responseJson.result === "success") {
                            let dateTime = new Date(responseJson.timestamp * 1000);
                            let months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
                            let year = dateTime.getFullYear();
                            let month = months[dateTime.getMonth()];
                            let date = dateTime.getDate();
                            let hour = dateTime.getHours();
                            let minute = dateTime.getMinutes();
                            let location = "";

                            api.getLocationName(coordinates[index].lat, coordinates[index].lng).then(response => {
                                location = response;

                                this.setState({
                                    playback: false,
                                    pinId: coordinates[index].id,
                                    title: "("+(index+1)+") "+coordinates[index].title,
                                    lng: coordinates[index].lng,
                                    lat: coordinates[index].lat,
                                    date: month + " " + date + " " + year,
                                    time: hour + ":" + minute,
                                    location: location
                                });
                            });

                            let url = "http://185.173.106.155/"+responseJson.url.replace("~/", "").replace(/ /g, "%20");
                            console.log(url);
                            if (responseJson.type === 1) // audio
                                this.setState({uri: url, video: "", audio: url});
                            else if (responseJson.type === 2) // video
                                this.setState({uri: url, video: url, audio: ""});
                        }
                    });
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
                    this.setState({rated: true});
                }
            })
        });
    }

    render() {
        return (
            <View style={{flex: 1}}>
                <View style={{flexDirection:'row', justifyContent: 'space-between',borderBottomColor: '#E3E3E3', borderBottomWidth: 1, margin: 20}}>
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
                    <TouchableOpacity style={{margin:10, flexDirection: 'row'}}
                                      onPress={() => {if(this.state.coordinates.length > 0) this.showActionSheet();}}>
                        <Image
                            source={require('../assets/images/More.png')}
                            style={{ width: 20, height: 19 }}
                        />
                        <Text style={{color: Colors.textMuted, fontSize: 12}}>  ({this.state.coordinates.length})</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => {this.props.navigation.navigate('Setting');}}>
                        <Image
                            source={require('../assets/images/Logo_Text.png')}
                            style={{ width: 129, height: 32 }}
                        />
                    </TouchableOpacity>

                    <TouchableOpacity style={{margin:10}}
                                      onPress={() => {this.props.navigation.pop();}}>
                        <Image
                            source={require('../assets/images/Cancel.png')}
                            style={{ width: 12, height: 12 }}
                        />
                    </TouchableOpacity>
                </View>

                {this.state.coordinates.length > 0 ? <View style={{flex:1, margin: 20, marginTop: 0}}>
                    <View style={{flex:1, flexDirection: 'row', justifyContent: 'space-between'}}>
                        <View style={{flex: 8}}>
                            <Text style={styles.titleText}>{this.state.title}</Text>
                            <Text style={styles.subtitleText}>{this.state.date} / {this.state.time} / {this.state.location}</Text>
                        </View>
                        <View style={{flex: 1}}>
                            <TouchableOpacity onPress={() => this.props.navigation.navigate('Detail', {lat: this.state.lat, lng: this.state.lng})}>
                                <Image source={require('../assets/images/Location.png')}
                                       style={{width: 40, height: 40}}/>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <ViewPager style={{flex:6}} initialPage={0} onPageSelected={(e) => this.onPageSelected(e)}>
                        {this.state.coordinates.map((item, key) => {
                            return (
                                <View key={key} style={{backgroundColor: '$#9f9f9'}}>
                                    {this.state.audio.length > 0 ?
                                        <Image source={require('../assets/images/Audio.png')}
                                               style={{width: '100%', height: '100%'}} />
                                        :
                                        <Video source={{uri: this.state.video}}
                                               ref={(ref) => {this.player = ref }}
                                               resizeMode="cover"
                                               paused={!this.state.playBack}
                                               muted={this.state.mute}
                                               onEnd={() => { this.setState({playBack: false}) }}
                                               style={{width: '100%', height: '100%'}}
                                        />
                                    }
                                    <TouchableOpacity style={styles.playContent} onPress={() => {this.changePlayIcon()}}>
                                        <Image source={!this.state.playBack ? require('../assets/images/Play-Button.png') : require('../assets/images/Pasue-Button.png')}
                                               style={{ height: 62, width: 62 }} />
                                    </TouchableOpacity>
                                </View>
                            );
                        })}
                    </ViewPager>
                    <View style={{flex:2}}>
                        <View style={{flexDirection: 'row', justifyContent: 'space-between', marginTop: 20}}>
                            <TouchableOpacity onPress={() => {this.enableDisableSound()}}>
                                <Image source={this.state.mute ? require('../assets/images/Mute.png') : require('../assets/images/More-Volume.png')}
                                       style={{ height: 19, width: 29 }} />
                            </TouchableOpacity>
                            {/*<TouchableOpacity onPress={() => {this.rate()}}>*/}
                                {/*<Image source={this.state.rated ? require('../assets/images/Rated.png') : require('../assets/images/Rate.png')}*/}
                                       {/*style={{ height: 11, width: 95 }} />*/}
                            {/*</TouchableOpacity>*/}
                            <Rating
                                type='custom'
                                ratingImage={RATE_IMAGE}
                                ratingColor={Colors.primary}
                                ratingBackgroundColor={Colors.light}
                                imageSize={15}
                                onFinishRating={(rating) => this.ratingCompleted(rating)}
                                readonly={this.state.rated}
                            />
                            <TouchableOpacity onPress={() => {this.onShare()}}>
                                <Image source={require('../assets/images/Share.png')}
                                       style={{ height: 27, width: 19 }} />
                            </TouchableOpacity>
                        </View>
                        <View style={{marginTop: 20}}>
                            <TouchableOpacity>
                                <Image source={require('../assets/images/Progress.png')}
                                       style={{ height: 30, width: '100%' }} />
                            </TouchableOpacity>
                        </View>
                        <View style={{alignItems: 'center'}}>
                            <TouchableOpacity style={{marginTop: 20}}
                                              onPress={() => this.props.navigation.navigate('PlayHalf')}>
                                <Image source={require('../assets/images/Rectangle-64.png')}
                                       style={{ height: 10, width: 150, borderRadius: 5 }} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
                :
                <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                    <Text style={{color: Colors.text, textAlign: 'center', padding: 10}}>No playlist available for this area at the moment!</Text>
                </View>}
            </View>

        );
    }
}

const styles = {
    titleText: {
        color: '#666666',
        fontSize: 15
    },
    subtitleText: {
        color: '#666666',
        fontSize: 11
    },
    playContent: {
        height: 62,
        width: 62,
        position: 'absolute',
        top: '40%',
        left: '40%'
    }
};

export default withNavigation(PlayScreen);