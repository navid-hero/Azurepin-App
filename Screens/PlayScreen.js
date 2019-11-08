import React from 'react';
import {Image, Share, Text, TouchableOpacity, View} from "react-native";
import {withNavigation} from "react-navigation";

class PlayScreen extends React.Component {
    constructor(props) {
        super(props);

        this.state= {
            mode: "pause",
            mute: true,
            rated: false
        };
    }
    changePlayIcon() {
        this.setState({mode: this.state.mode === "play" ? "pause" : "play"});
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
                        <Text style={styles.titleText}>Gretta is here in New York</Text>
                        <Text style={styles.subtitleText}>FEBRUARY 22, 2019 / 8:16 AM / New York, US</Text>
                    </View>
                    <View>
                        <TouchableOpacity onPress={() => this.props.navigation.navigate('Detail')}>
                            <Image source={require('../assets/images/Location.png')}
                                   style={{width: 40, height: 40}}/>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={{flex:6}}>
                    <Image source={require('../assets/images/Video.png')}
                           style={{width: '100%', height: '100%'}} />
                    <TouchableOpacity style={styles.playContent} onPress={() => {this.changePlayIcon()}}>
                        <Image source={this.state.mode === "pause" ? require('../assets/images/Play-Button.png') : require('../assets/images/Pasue-Button.png')}
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