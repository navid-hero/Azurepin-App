import React from 'react';
import {Image, View, StyleSheet} from "react-native";
import { StackActions, NavigationActions } from 'react-navigation';
const resetAction = StackActions.reset({
    index: 0,
    actions: [NavigationActions.navigate({ routeName: 'Login' })],
});

export default class splashScreen extends React.Component {

    static navigationOptions = {
        headerShown: false
    };

    componentDidMount() {
        // const {navigate} = this.props.navigation;
        setTimeout(() => { this.props.navigation.dispatch(resetAction) }, 10000);
    }
    render() {
        return (
            <View style={styles.container}>
                <View style={styles.bottom}>
                    <Image source={require('../assets/images/Official_Logo.png')}
                           style={{width: 200, height: 200}}/>
                    <Image source={require('../assets/images/Logo_Text.png')}
                           style={{height: 41, width: 171}}/>
                </View>
            </View>
        );
    }
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center'
    },
    bottom: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginBottom: 80
    }
});