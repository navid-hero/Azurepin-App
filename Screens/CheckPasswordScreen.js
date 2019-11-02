import React from 'react';
import {Image, Text, View, TextInput, TouchableOpacity, StyleSheet} from "react-native";
import { StackActions, NavigationActions } from 'react-navigation';
const resetAction = StackActions.reset({
    index: 0,
    actions: [NavigationActions.navigate({ routeName: 'Home' })],
});

export default class CheckPasswordScreen extends React.Component {
    render() {
        // const {navigate} = this.props.navigation;
        return (
            <View style={{flex:1, alignItems: 'center'}}>
                <View style={{flex:1, justifyContent: 'center'}}>
                    <Image source={require('../assets/images/Eter_Number_Success_Icon.png')}
                           style={{width: 120, height: 153}}/>
                </View>
                <View style={{flex:1}}>
                    <View style={{flex:1, alignItems: 'center'}}>
                        <Text style={styles.text}>Enter the code to verify this device.</Text>
                    </View>
                    <View style={styles.buttonContainer}>
                        <TextInput placeholder="AZ-XXXXX" style={styles.textInput}/>
                        <TouchableOpacity
                            style={styles.submitButton}
                            onPress={() => this.props.navigation.dispatch(resetAction)}
                        >
                            <Text style={styles.submitButtonText}>Done</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    text: {
        color: '#707070',
        fontFamily: 'Segoe UI',
        fontWeight: 'bold'
    },
    buttonContainer: {
        flex:2,
        alignItems: 'center',
        justifyContent: 'flex-start'
    },
    textInput: {
        textAlign: 'center',
        backgroundColor: '#DCDCDC',
        color: '#707070',
        width: 170,
        borderRadius: 50,
        padding: 15
    },
    submitButton: {
        padding:10,
        backgroundColor: '#EFEFEF',
        borderRadius:50,
        width: 100,
        margin: 40
    },
    submitButtonText: {
        color: '#007BFE',
        textAlign: 'center'
    }
});