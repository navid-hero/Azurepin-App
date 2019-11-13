import React from 'react';
import {Image, Text, TextInput, StyleSheet, TouchableOpacity, View} from "react-native";

export default class DropPinScreen extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            date: "Date",
            time: "Time",
            location: "Location",
            video:false,
            audio:true
        };
    }
    render() {
        return (
            <View style={{flex:1}}>
                <View style={{flexDirection:'row', justifyContent: 'space-between', borderBottomColor: '#E3E3E3', borderBottomWidth: 1, margin: 10, paddingBottom: 10}}>
                    <TouchableOpacity>
                        <Image source={require('../assets/images/Draft.png')}
                               style={{width: 36, height: 36}} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => {this.props.navigation.navigate('Setting');}}>
                        <Image source={require('../assets/images/Logo_Text.png')}
                               style={{width: 129, height: 32}} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => {this.props.navigation.goBack();}} style={{marginRight: 10, marginTop: 10}}>
                        <Image source={require('../assets/images/Cancel.png')}
                               style={{width: 12, height: 12}} />
                    </TouchableOpacity>
                </View>
                <View style={{margin: 10, marginTop: 5, padding: 5}}>
                    <TextInput placeholder="Title" style={{backgroundColor: '#DCDCDC', color: '#707070', padding: 8, borderRadius: 5, margin: 5, marginTop: 0}} />
                    <Text style={{margin: 5, color: '#666666', fontSize: 11}}>
                        <Text>{this.state.date}</Text>
                        <Text> / </Text>
                        <Text>{this.state.time}</Text>
                        <Text> / </Text>
                        <Text>{this.state.location}</Text>
                    </Text>
                    <Image source={this.state.video ? require('../assets/images/Pin-Video.png') : require('../assets/images/Audio.png')}
                           style={{width: 330, height: 330, marginTop: 5}}/>
                    <View style={{flexDirection:'row', borderRadius: 10, backgroundColor: '#DCDCDC', marginTop: 5, justifyContent: 'space-between', padding: 10}}>
                        <TouchableOpacity>
                            <Image source={require('../assets/images/Path_11.png')} style={{width: 11, height: 23}}/>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => {this.setState({video: true, audio: false});}}>
                            <Text style={this.state.video ? styles.active : ''}>Video</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => {this.setState({video: false, audio: true});}}>
                            <Text style={this.state.audio ? styles.active : ''}>Audio</Text>
                        </TouchableOpacity>
                        <TouchableOpacity>
                            <Image source={require('../assets/images/Reverse-Camera-Icon.png')} style={{width: 21, height: 17}}/>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    active: {
        color: '#4960EB'
    }
});