import React from 'react';
import {View, Text} from "react-native";
import ProgressBar from 'react-native-progress/Bar';

export default class PlayBar extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            start: "",
            end: "",
            currentTime: ""
        };
    }
    render() {
        return (
            <View>
                <ProgressBar progress={this.state.currentTime} width={null} height={5} unfilledColor="#E3E3E3" color="#035BDA" borderWidth={0} borderRadius={5} />
                <View style={{flexDirection: 'row', justifyContent:'space-between'}}>
                    <Text style={{fontSize: 10}}>{this.state.start}</Text>
                    <Text style={{fontSize: 10}}>-{this.state.end}</Text>
                </View>
            </View>
        );


    }
}