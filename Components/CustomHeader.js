import React from 'react';
import {Image, TouchableOpacity, View} from "react-native";
import { StackActions, NavigationActions } from 'react-navigation';

const resetAction = StackActions.reset({
    index: 0,
    actions: [NavigationActions.navigate({ routeName: 'Home' })],
});

export default class CustomHeader extends React.Component {
    render() {
        return (
            <View style={{flex:1, flexDirection:'row', justifyContent: 'space-between'}}>
                <TouchableOpacity style={{margin:10}}>
                    <Image
                        source={require('../assets/images/More.png')}
                        style={{ width: 20, height: 19 }}
                    />
                </TouchableOpacity>

                <TouchableOpacity>
                    <Image
                        source={require('../assets/images/Logo_Text.png')}
                        style={{ width: 129, height: 32 }}
                    />
                </TouchableOpacity>

                <TouchableOpacity style={{margin:10}} onPress={() => this.props.navigation.navigate('Home')}>
                    <Image
                        source={require('../assets/images/Cancel.png')}
                        style={{ width: 12, height: 12 }}
                    />
                </TouchableOpacity>
            </View>
        );
    }
}