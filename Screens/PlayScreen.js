import React from 'react';
import {AsyncStorage, Image, Share, Text, TouchableOpacity, View} from "react-native";
import {withNavigation} from "react-navigation";
import Api from '../Components/Api';
import Video from 'react-native-video';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';

const api = new Api();
const audioRecorderPlayer = new AudioRecorderPlayer();

class PlayScreen extends React.Component {
    constructor(props) {
        super(props);

        this.state= {
            mute: true,
            rated: false,
            video: "",
            audio: "",
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
            duration: ""
        };
    }
    componentDidMount() {
        AsyncStorage.getItem('userId', (err, userId) => {
            let coordinates = JSON.parse(this.props.navigation.getParam('coordinates'));
            if (coordinates.length > 0) {
                let formData = new FormData();
                formData.append("UserId",userId);
                formData.append("PinId",coordinates[0].id);
                fetch('http://192.99.246.61/Pin/GetPin',{
                    method: 'post',
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    body: formData
                })
                    .then(response => response.json())
                    .then(responseJson => {
                        console.log(responseJson);
                        if (responseJson.result === "success") {
                            let dateTime = new Date(responseJson.timestamp * 1000);
                            let months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
                            let year = dateTime.getFullYear();
                            let month = months[dateTime.getMonth()];
                            let date = dateTime.getDate();
                            let hour = dateTime.getHours();
                            let minute = dateTime.getMinutes();
                            let location = "";

                            api.getLocationName(coordinates[0].lat, coordinates[0].lng).then(response => {
                                location = response;

                                this.setState({
                                    title: coordinates[0].title,
                                    lng: coordinates[0].lng,
                                    lat: coordinates[0].lat,
                                    date: month + " " + date + " " + year,
                                    time: hour + ":" + minute,
                                    location: location,
                                });
                            });

                            let url = "http://192.99.246.61/"+responseJson.url.replace("~/", "").replace(/ /g, "%20");
                            if (responseJson.type === 1) // audio
                                this.setState({video: "", audio: url});
                            else if (responseJson.type === 2) // video
                                this.setState({video: url, audio: ""});
                        }
                    })
                    .catch(err => {
                        console.log("err", err);
                    });
            }
        });
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
    rate() {
        this.setState({rated: !this.state.rated});
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
    render() {
        return (
            <View style={{flex:1, margin: 20, marginTop: 0}}>
                <View style={{flex:1, flexDirection: 'row', justifyContent: 'space-between'}}>
                    <View>
                        <Text style={styles.titleText}>{this.state.title}</Text>
                        <Text style={styles.subtitleText}>{this.state.date} / {this.state.time} / {this.state.location}</Text>
                    </View>
                    <View>
                        <TouchableOpacity onPress={() => this.props.navigation.navigate('Detail', {lat: this.state.lat, lng: this.state.lng})}>
                            <Image source={require('../assets/images/Location.png')}
                                   style={{width: 40, height: 40}}/>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={{flex:6}}>
                    {this.state.audio.length > 0 ?
                        <Image source={require('../assets/images/Audio.png')}
                               style={{width: '100%', height: '100%'}} />
                        :
                        <Video source={{uri: this.state.video}}
                               ref={(ref) => {this.player = ref }}
                               paused={this.state.playBack}
                               onEnd={() => { this.setState({playBack: true}) }}
                               style={{width: '100%', height: '100%'}}
                        />
                    }
                    <TouchableOpacity style={styles.playContent} onPress={() => {this.changePlayIcon()}}>
                        <Image source={!this.state.playBack ? require('../assets/images/Play-Button.png') : require('../assets/images/Pasue-Button.png')}
                               style={{ height: 62, width: 62 }} />
                    </TouchableOpacity>
                </View>
                <View style={{flex:2}}>
                    <View style={{flexDirection: 'row', justifyContent: 'space-between', marginTop: 20}}>
                        <TouchableOpacity onPress={() => {this.enableDisableSound()}}>
                            <Image source={this.state.mute ? require('../assets/images/Mute.png') : require('../assets/images/More-Volume.png')}
                                   style={{ height: 19, width: 29 }} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => {this.rate()}}>
                            <Image source={this.state.rated ? require('../assets/images/Rated.png') : require('../assets/images/Rate.png')}
                                   style={{ height: 11, width: 95 }} />
                        </TouchableOpacity>
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