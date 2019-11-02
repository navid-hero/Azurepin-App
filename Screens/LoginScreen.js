import React from 'react';
import {Image, Text, View, TextInput, TouchableOpacity, StyleSheet, ScrollView} from "react-native";
import { StackActions, NavigationActions } from 'react-navigation';
const resetAction = StackActions.reset({
    index: 0,
    actions: [NavigationActions.navigate({ routeName: 'CheckPassword' })],
});

export default class LoginScreen extends React.Component {
    render() {
        // const {navigate} = this.props.navigation;
        return (
            <ScrollView contentContainerStyle={styles.contentContainer}>
                <View style={{flex:1, alignItems: 'center'}}>
                    <View style={{flex:1, justifyContent: 'center'}}>
                        <Image source={require('../assets/images/Enter_Number_Icon.png')}
                               style={{width: 129, height: 153}}/>
                    </View>
                    <View style={{flex:1}}>
                        <View style={{flex:1, alignItems: 'center'}}>
                            <Text style={styles.text}>
                                Please enter a <Text style={{fontWeight: 'bold'}}>valid phone number.</Text>
                            </Text>
                            <Text style={styles.text}>We will send you a verification code</Text>
                            <Text style={styles.text}>for a secure login.</Text>
                        </View>
                        <View style={styles.buttonContainer}>
                            <TextInput style={styles.textInput} placeholder="+XX | XXXXX" />
                            <TouchableOpacity
                                style={styles.submitButton}
                                onPress={() => this.props.navigation.dispatch(resetAction)}
                            >
                                <Text style={styles.submitButtonText}>Submit</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </ScrollView>
        );
    }
}

const styles = StyleSheet.create({
    contentContainer: {
        alignItems: 'center',
        flex: 1
    },
    text: {
        color: '#707070',
        fontFamily: 'Segoe UI'
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