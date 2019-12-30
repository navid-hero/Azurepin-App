import React from 'react';
import {AsyncStorage, Image, View, StyleSheet} from "react-native";
import { StackActions, NavigationActions } from 'react-navigation';

export default class splashScreen extends React.Component {

    static navigationOptions = {
        headerShown: false
    };

    componentDidMount() {
        // const {navigate} = this.props.navigation;
        AsyncStorage.getItem('userId', (err, userId) => {
            AsyncStorage.getItem('logged_in', (err, loggedIn) => {
                setTimeout(() => {
                    let nextScreen = (userId > 0 && loggedIn) ? "Home" : "Login";

                    const resetAction = StackActions.reset({
                        index: 0,
                        actions: [NavigationActions.navigate({ routeName: nextScreen })],
                    });

                    this.props.navigation.dispatch(resetAction)
                }, 2000);
            });
        });
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