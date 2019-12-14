import React  from 'react';
import {
    Alert,
    AsyncStorage,
    BackHandler,
    Image,
    Modal,
    Text,
    TextInput,
    StyleSheet,
    ToastAndroid,
    TouchableOpacity,
    View,
} from "react-native";
import { RNCamera } from 'react-native-camera';
import Video from 'react-native-video';
import Geolocation from 'react-native-geolocation-service';
import ProgressBar from 'react-native-progress/Bar';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import {Colors} from "../Components/Colors";
import Api from '../Components/Api';

const api = new Api();
const audioRecorderPlayer = new AudioRecorderPlayer();

export default class DropPinScreen extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            title: "",
            date: "Date",
            time: "Time",
            latitude: "",
            longitude: "",
            location: "Location",
            flashMode: 'on', // RNCamera.Constants.FlashMode.off,
            video:true,
            audio:false,
            type: RNCamera.Constants.Type.back,
            imageToShow: "",
            recording: "start", // [start , recording , end]
            videoTime: 0,
            videoToShow: "",
            playBack: true,
            indeterminate: false,
            refreshIntervalId: 0,
            start: "0:00",
            end: "1:00",
            modalVisible: false,
            drafts: [],
            audioToPlay: null,
            recordSecs: "",
            recordTime: ""
        };

        this.months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    }
    componentDidMount() {
        BackHandler.addEventListener(
            'hardwareBackPress',
            this.handleBackButtonPressAndroid
        );

        AsyncStorage.getItem('drafts', (err, drafts) => {;
            console.log("draftssss", drafts);
            this.setState({drafts: JSON.parse(drafts)});
        });
    }

    componentWillUnmount() {
        BackHandler.removeEventListener(
            'hardwareBackPress',
            this.handleBackButtonPressAndroid
        );
    }

    handleBackButtonPressAndroid = () => {
        return this.props.navigation.isFocused();
    };

    changeTitle(text) {
        this.setState({title: text});
    }

    titleStyle = function() {
        if (!(this.state.title.length > 0) && this.state.recording === "end") {
            return {
                borderWidth: 1,
                borderColor: '#f00',
            }
        } else {
            return {};
        }
    };

    flipCamera = () => {
        this.setState({
            type:
                this.state.type === RNCamera.Constants.Type.back
                    ? RNCamera.Constants.Type.front
                    : RNCamera.Constants.Type.back,
        });
    };

    toggleTorch = () => {
        this.setState({
            flashMode:
                this.state.flashMode === RNCamera.Constants.FlashMode.off
                    ? RNCamera.Constants.FlashMode.on
                    : RNCamera.Constants.FlashMode.off
        });

        // if (Platform.OS === 'ios') {
        //     this.setState({isTorchOn: newTorchState}, function() {
        //         Torch.switchState(newTorchState);
        //     });
        // } else {
        //     try {
        //         const cameraAllowed = await Torch.requestCameraPermission(
        //             'Camera Permissions', // dialog title
        //             'We require camera permissions to use the torch on the back of your phone.' // dialog body
        //         );
        //
        //         if (cameraAllowed)
        //             this.setState({isTorchOn: newTorchState}, function() {
        //                 Torch.switchState(newTorchState);
        //             });
        //
        //     } catch (e) {
        //         ToastAndroid.show(
        //             'We seem to have an issue accessing your torch',
        //             ToastAndroid.SHORT
        //         );
        //     }
        // }
    };

    // takePicture = async function(camera) {
    //     const options = { quality: 0.5, base64: true };
    //     const data = await camera.takePictureAsync(options);
    //     //  eslint-disable-next-line
    //     console.log(data.uri);
    // };

    takePhoto = async () => {
        // const { onTakePhoto } = this.props;
        const options = {
            quality: 0.4,
            base64: true,
        };
        const data = await this.camera.takePictureAsync(options);
        this.onTakePhoto(data.base64);
    };

    onTakePhoto(photo) {
        // console.log("data:image/png;base64"+photo);
        this.setState({imageToShow: "data:image/png;base64,"+photo});
    }


    animate() {
        let startInt = 0, endInt = 60, videoTime = 0, start = "", end = "";
        let data = this;
        let refreshIntervalId = setInterval(function () {
            if (endInt > 10)
                end = "0:" + (--endInt);
            else if (endInt > 0)
                end = "0:0" + (--endInt);
            else {
                clearInterval(refreshIntervalId);
            }

            if (startInt === 59)
                start = "1:00";
            else if (startInt > 8)
                start = "0:" + (++startInt);
            else
                start = "0:0" + (++startInt);

            videoTime += 0.016;
            if (videoTime < 1)
                data.setState({ videoTime, refreshIntervalId, start, end });

        }, 1000);
    }

    setDateTimeLocation() {
        // let location = "Location";
        Geolocation.getCurrentPosition(
            (position) => {
                let lng = position.coords.longitude;
                let lat = position.coords.latitude;
                api.getLocationName(lat, lng).then(response => {this.setState({location: response, latitude: lat, longitude: lng})});
            },
            (error) => {
                // console.log(error.code, error.message);
                if (error.code === 5) // Location settings are not satisfied.
                    Alert.alert("Permission Denied", "In order to have a better experience, Azurepin needs to access your location.");
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
        // console.log(location);

        let now = new Date;
        let date = this.months[now.getMonth()] + " " + now.getDate() + ", " + now.getFullYear();
        let time = now.getHours() + ":" + now.getMinutes();
        this.setState({date, time});
    }

    dropNewPin(type, isDraft="0") {
        let currentTimestamp = Date.now();
        AsyncStorage.getItem('userId', (err, userId) => {
            let fileName = userId.toString() + "_" + currentTimestamp.toString() + ".mp4";
            console.log("start uploading...");
            api.postRequest("Pin/UploadMedia", JSON.stringify([
                {
                    key: "Pin", value: {
                        name: fileName,
                        type: "video/mp4",
                        uri: type === "video" ? this.state.videoToShow : this.state.audioToPlay
                    }
                },
                {key: "UserId", value: userId}
            ])).then((responseJson) => {
                console.log(responseJson);
                if (responseJson.result === "success") {
                    api.postRequest("Pin/DropNewPin", JSON.stringify([
                        {key: "UserId", value: userId.toString()},
                        {key: "Title", value: this.state.title.toString()},
                        {key: "Timestamp", value: currentTimestamp.toString()},
                        {key: "Latitude", value: this.state.latitude.toString()},
                        {key: "Longitude", value: this.state.longitude.toString()},
                        {key: "Location", value: this.state.location.toString()},
                        {key: "Duration", value: "0"},
                        {key: "Type", value: type === "video" ? "2" : "1"},
                        {key: "FileId", value: responseJson.fileId.toString()},
                        {key: "IsDraft", value: isDraft}
                    ])).then((responseJson) => {
                        console.log(responseJson);
                        if (responseJson.result === "success") {
                            Alert.alert(
                                '',
                                isDraft === "0" ? 'Your pin dropped successfully' : 'Your recording has been drafted!',
                                [{text: 'OK', onPress: () => this.props.navigation.pop()},],
                                {cancelable: false},
                            );
                        }

                    });
                }
            });
        });
    }

    recordVideo = async () => {
        if (this.state.video) {
            let data;
            if (this.state.recording === "start") { // start recording
                this.setDateTimeLocation();
                this.animate();
                this.setState({recording: "recording"});
                const options = {
                    quality: RNCamera.Constants.VideoQuality['480p'],
                    maxDuration: 59,
                    videoBitrate: 1024*1024
                };
                const data = await this.camera.recordAsync(options);
                this.onRecordVideo(data.uri);
            } else if (this.state.recording === "recording") { // stop recording
                this.setState({recording: "end"});
                const data = await this.camera.stopRecording();
            } else {
                if (this.state.title.length > 0) {
                    this.dropNewPin("video");
                } else {
                    //
                }
            }
        } else if (this.state.audio) {
            if (this.state.recording === "start") { // start recording
                this.setDateTimeLocation();
                this.animate();
                const uri = await audioRecorderPlayer.startRecorder();
                console.log("audio", uri);
                audioRecorderPlayer.addRecordBackListener((e) => {
                    this.setState({
                        recording: "recording",
                        recordSecs: e.current_position,
                        recordTime: audioRecorderPlayer.mmssss(Math.floor(e.current_position)),
                    });
                });
            } else if (this.state.recording === "recording") { // stop recording
                const result = await audioRecorderPlayer.stopRecorder();
                clearInterval(this.state.refreshIntervalId);
                audioRecorderPlayer.removeRecordBackListener();
                this.setState({recording: "end", audioToPlay: result, recordSecs: 0});
                console.log("audio result", result);
            } else {
                if (this.state.title.length > 0) {
                    this.dropNewPin("audio");
                } else {
                    //
                }
            }
        }
    };

    onRecordVideo = (video) => {
        console.log(video);
        clearInterval(this.state.refreshIntervalId);
        this.setState({videoToShow: video});
    };

    togglePlay = async () => {
        if (this.state.video) {
            this.setState({playBack: !this.state.playBack});
        } else if (this.state.audio) {
            if (this.state.playBack === true) {
                console.log('onStartPlay');
                const msg = await audioRecorderPlayer.startPlayer();
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
    };

    setModalVisible(visible) {
        this.setState({modalVisible: visible});
    }

    draftItem() {
        if (this.state.title.length > 0) {
            let currentTimestamp = Date.now();
            AsyncStorage.getItem('userId', (err, userId) => {
                let fileName = userId.toString() + "_" + currentTimestamp.toString() + ".mp4";

                let newDraftItem = {
                    id: 5,
                    title: this.state.title.toString(),
                    Timestamp: currentTimestamp.toString(),
                    Pin: {
                        name: fileName,
                        type: "video/mp4",
                        uri: type === "video" ? this.state.videoToShow : this.state.audioToPlay
                    },
                    Latitude: this.state.latitude.toString(),
                    Longitude: this.state.longitude.toString(),
                    Location: this.state.location.toString(),
                    Duration: "0",
                    Type: this.state.video === "video" ? "2" : "1"
                };

                AsyncStorage.getItem('drafts', (err, result) => {
                    let drafts = this.state.drafts && this.state.drafts.length > 0 ? JSON.parse(result) : [];
                    drafts.push(newDraftItem);
                    AsyncStorage.setItem('drafts', JSON.stringify(drafts));
                });

                this.dropNewPin(this.state.video ? "video" : "audio", "1");
            });
        } else {
            ToastAndroid.show('put some title first', ToastAndroid.LONG);
        }
    }

    dropDraft(item) {
        this.setState({drafts: this.state.drafts.filter(obj => {
                if (obj.id !== item.id)
                    return obj;
            }
        )}, () => {
            AsyncStorage.setItem('drafts', JSON.stringify(this.state.drafts));
        });
    }

    onExit = () => {
        if (this.state.videoToShow.length > 0 || this.state.audioToPlay) {
            Alert.alert(
                'Discard Recording?',
                'If you go back now, you will \n' +
                'lose your recording. \n' +
                'You can draft it up to 1 hour.',
                [
                    {text: 'Discard', onPress: () => this.props.navigation.goBack(), style: 'destructive'},
                    {text: 'Draft', onPress: () => this.draftItem()},
                    {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
                ],
                {cancelable: false},
            );
        } else {
            this.props.navigation.goBack();
        }
    };

    render() {
        const { type, flashMode } = this.state;
        return (
            <View style={{flex:1}}>
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={this.state.modalVisible}
                    onRequestClose={() => {
                        // Alert.alert('Modal has been closed.');
                        this.setState({modalVisible:false});
                    }}
                >
                    <View style={styles.containerOne}>
                        <View style={styles.containerTwo}>
                            <Text style={styles.modalTitle}>Draft</Text>
                            <View style={styles.containerThree}>
                                {this.state.drafts && this.state.drafts.length > 0 ? this.state.drafts.map((item, key) => {
                                    return (
                                        <View style={styles.containerFour} key={key} id={item.id}>
                                            <View>
                                                <Text style={{color: '#666666'}}>{item.title}</Text>
                                                <Text style={{color: '#666666', opacity: 0.8}}>{item.time}</Text>
                                            </View>
                                            <View>
                                                <TouchableOpacity onPress={() => this.dropDraft(item)}>
                                                    <Image source={require('../assets/images/Azure-Pin.png')} style={{width: 40, height: 40}}/>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    );
                                }) : <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}><Text style={{color: Colors.text}}>No drafts yet!</Text></View>}
                            </View>
                            <View style={{justifyContent: 'flex-end', alignItems: 'flex-end', paddingRight: 15, paddingBottom: 5}}>
                                <TouchableOpacity onPress={() => {this.setState({modalVisible:false})}}>
                                    <Text style={{color: "#666"}}>Close</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
                <View style={{flexDirection:'row', justifyContent: 'space-between', borderBottomColor: '#E3E3E3', borderBottomWidth: 1, margin: 10, paddingBottom: 10}}>
                    <TouchableOpacity onPress={() => {this.setModalVisible(true);}}>
                        <Image source={require('../assets/images/Draft.png')}
                               style={{width: 36, height: 36}} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => {this.props.navigation.navigate('Setting');}}>
                        <Image source={require('../assets/images/Logo_Text.png')}
                               style={{width: 129, height: 32}} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => {this.onExit();}} style={{marginRight: 10, marginTop: 10}}>
                        <Image source={require('../assets/images/Cancel.png')}
                               style={{width: 12, height: 12}} />
                    </TouchableOpacity>
                </View>
                <View style={{margin: 10, marginTop: 5, padding: 5}}>
                    <View>
                        <TextInput placeholder="Title" value={this.state.title} onChangeText={(text) => {this.changeTitle(text)}} style={[styles.titleTextInput, this.titleStyle()]} />
                        <Text style={{margin: 5, color: '#666666', fontSize: 11}}>
                            <Text>{this.state.date}</Text>
                            <Text> / </Text>
                            <Text>{this.state.time}</Text>
                            <Text> / </Text>
                            <Text>{this.state.location}</Text>
                        </Text>
                    </View>
                    {/*<Image source={this.state.video ? require('../assets/images/Pin-Video.png') : require('../assets/images/Audio.png')}*/}
                           {/*style={{width: 330, height: 330, marginTop: 5}}/>*/}

                    <View style={{margin: 5, height: 330}}>
                        {this.state.audio ?
                            <View>
                                <Image source={require('../assets/images/Audio.png')}/>
                                {this.state.audioToPlay ?
                                <TouchableOpacity style={styles.playContent}
                                                  onPress={() => {
                                                      this.togglePlay()
                                                  }}>
                                    <Image
                                        source={this.state.playBack ? require('../assets/images/Play-Button.png') : require('../assets/images/Pasue-Button.png')}
                                        style={{height: 60, width: 60}}/>
                                </TouchableOpacity> : <Text></Text>}
                            </View>
                            :
                            this.state.videoToShow.length > 0 ?
                                <View style={{flex: 1, flexDirection: 'column', backgroundColor: 'black'}}>
                                    <Video source={{uri: this.state.videoToShow}}
                                           ref={(ref) => {
                                               this.player = ref
                                           }}
                                           paused={this.state.playBack}
                                           resizeMode="cover"
                                           onEnd={() => {
                                               this.setState({playBack: true})
                                           }}
                                           style={{width: '100%', height: '100%'}}
                                    />
                                    <TouchableOpacity style={styles.playContent}
                                                      onPress={() => {
                                                          this.togglePlay()
                                                      }}>
                                        <Image
                                            source={this.state.playBack ? require('../assets/images/Play-Button.png') : require('../assets/images/Pasue-Button.png')}
                                            style={{height: 60, width: 60}}/>
                                    </TouchableOpacity>
                                </View>
                                :
                                <View style={{flex: 1, flexDirection: 'column', backgroundColor: 'black'}}>
                                    <RNCamera ref={cam => {this.camera = cam;}}
                                              style={{flex: 1}}
                                              type={type}
                                              flashMode={flashMode}
                                              defaultVideoQuality={RNCamera.Constants.VideoQuality['480p']}
                                              androidCameraPermissionOptions={{
                                                  title: 'Permission to use camera',
                                                  message: 'We need your permission to use your camera',
                                                  buttonPositive: 'Ok',
                                                  buttonNegative: 'Cancel',
                                              }}
                                              androidRecordAudioPermissionOptions={{
                                                  title: 'Permission to use audio recording',
                                                  message: 'We need your permission to use your audio',
                                                  buttonPositive: 'Ok',
                                                  buttonNegative: 'Cancel',
                                              }}
                                    />
                                </View>
                        }
                    </View>

                    <View pointerEvents={this.state.recording !== "start" ? "none" : "auto"} style={[styles.actionsContainer, {opacity: this.state.recording === "start" ? 1 : 0.7}]}>
                        <TouchableOpacity disabled={!this.state.video} onPress={() => {this.toggleTorch()}}>
                            <Image source={this.state.video ? require('../assets/images/Path_11.png') : require('../assets/images/Path_12.png')}
                                   style={{width: 11, height: 23}}/>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => {this.setState({video: true, audio: false});}}>
                            <Text style={this.state.video ? styles.active : styles.inactive}>Video</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => {this.setState({video: false, audio: true, isTorchOn: false})}}>
                            <Text style={this.state.audio ? styles.active : styles.inactive}>Audio</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => this.flipCamera()}>
                            <Image source={require('../assets/images/Reverse-Camera-Icon.png')} style={{width: 21, height: 17}}/>
                        </TouchableOpacity>
                    </View>
                    <View style={{padding: 10}}>
                        {/*<View style={styles.progressBar}>*/}
                            {/*<Animated.View style={[styles.absoluteFill, {backgroundColor: "#035BDA", width: "50%"}]}/>*/}
                        {/*</View>*/}
                        <ProgressBar progress={this.state.videoTime} width={null} height={5} unfilledColor="#E3E3E3" color="#035BDA" borderWidth={0} borderRadius={5} />
                        <View style={{flexDirection: 'row', justifyContent:'space-between'}}>
                            <Text style={{fontSize: 10}}>{this.state.start}</Text>
                            <Text style={{fontSize: 10}}>-{this.state.end}</Text>
                        </View>
                        <TouchableOpacity style={{alignSelf: 'center'}} onPress={() => this.recordVideo()}>
                            <Image source={this.state.recording === "start" ? require('../assets/images/Droppin.png') : (this.state.recording === "recording" ? require('../assets/images/Stop-Recording.png') : require('../assets/images/Pin_+.png'))}
                                   style={{width: 47, height: 47}}/>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    titleTextInput: {
        backgroundColor: '#DCDCDC',
        color: '#707070',
        padding: 8,
        borderRadius: 5,
        margin: 5,
        marginTop: 0
    },
    active: {
        color: '#4960EB'
    },
    inactive: {
        color: '#666666'
    },
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: 'black',
    },
    preview: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    capture: {
        flex: 0,
        backgroundColor: '#fff',
        borderRadius: 5,
        padding: 15,
        paddingHorizontal: 20,
        alignSelf: 'center',
        margin: 20,
    },
    playContent: {
        height: 60,
        width: 60,
        position: 'absolute',
        top: '41%',
        left: '42%'
    },
    progressBar: {
        flexDirection: 'row',
        height: 5,
        width: '100%',
        backgroundColor: '#E3E3E3',
        borderRadius: 5,
    },
    absoluteFill: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0
    },
    modalTitle: {
        color: '#666',
        fontSize: 16,
        fontWeight: 'bold',
        padding: 10,
        // borderBottomColor: '#E3E3E3',
        // borderBottomWidth: 1
    },
    containerOne: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.7)'
    },
    containerTwo: {
        position: 'absolute',
        top: 150,
        left: 15,
        right: 15,
        bottom: 130,
        borderRadius: 10,
        borderColor: '#D8D8D8',
        borderWidth: 2,
        backgroundColor: '#F2F2F2',
        // margin: 10
        // justifyContent: 'center',
        // alignItems: 'center',
    },
    containerThree: {
        flex: 1,
        // padding: 10,
        // borderBottomWidth: 1,
        // borderBottomColor: '#D8D8D8',
        // borderTopWidth: 1,
        // borderTopColor: '#D8D8D8',
    },
    containerFour: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderBottomColor: '#D8D8D8',
        borderBottomWidth: 1,
        padding: 5,
        // marginBottom: 5,
        marginLeft: 15,
        marginRight: 15,
    },
    actionsContainer: {
        flexDirection:'row',
        borderRadius: 10,
        backgroundColor: '#DCDCDC',
        marginTop: 5,
        justifyContent: 'space-between',
        padding: 10
    },
});