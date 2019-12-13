import React from 'react';
import {Alert, AsyncStorage, BackHandler, Image, View, StyleSheet} from "react-native";
import { StackActions, NavigationActions } from 'react-navigation';

export default class splashScreen extends React.Component {

    static navigationOptions = {
        headerShown: false
    };

    componentDidMount() {
        // const {navigate} = this.props.navigation;
        let userId = 0;
        AsyncStorage.getItem('userId', (err, value) => { userId = value; });
        if (userId > 0) {
            this.goToNextScreen(userId);
        } else {
            Alert.alert(
                'Terms and Conditions',
                'Please confirm that you have read and agree to the Azurepin terms and conditions agreement.',
                [
                    {text: 'DISAGREE', onPress: () => BackHandler.exitApp() },
                    {text: 'AGREE', onPress: () => this.goToNextScreen(userId) },
                ],
                {cancelable: false},
            );
        }
    }

    goToNextScreen(userId) {
        setTimeout(() => {
            let nextScreen = userId > 0 ? "Home" : "Login";

            const resetAction = StackActions.reset({
                index: 0,
                actions: [NavigationActions.navigate({ routeName: nextScreen })],
            });

            this.props.navigation.dispatch(resetAction)
        }, 2000);
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