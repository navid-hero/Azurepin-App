import React from 'react';
import {Alert, Image, Text, View, TextInput, TouchableOpacity, StyleSheet, ScrollView} from "react-native";
import { StackActions, NavigationActions } from 'react-navigation';
import Storage from '../Components/store';
import Api from '../Components/Api';
import {Colors} from "../Components/Colors";

const resetAction = StackActions.reset({
    index: 0,
    actions: [NavigationActions.navigate({ routeName: 'CheckPassword' })],
});

const api = new Api();

export default class LoginScreen extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            email: "",
            emailValidationFailed: false
        };
    }

    onChangeEmail(email) {
        let emailValidationFailed = true;
        if (email.length > 0) emailValidationFailed = false;
        this.setState({email, emailValidationFailed});
    }

    submitEmail = () => {
        if (this.state.email.length < 6) {
            this.setState({emailValidationFailed: true});
        } else {
            api.postRequest("User/SubmitEmail", JSON.stringify({Email: this.state.email}))
                .then((response) => {
                    console.log("response", response);
                    if (response.result === "success" || response.result === "duplicate") {
                        console.log("response.userId", response.userId);
                        Storage.storeData('userId', response.userId);
                        this.props.navigation.dispatch(resetAction);
                    } else {
                        Alert.alert('Woops!', 'Looks something went wrong!');
                    }
                })
                .catch((error) => {
                    console.error(error);
                });
        }
    }

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
                                Please enter a <Text style={{fontWeight: 'bold'}}>valid email address.</Text>
                            </Text>
                            <Text style={styles.text}>We will send you a verification code</Text>
                            <Text style={styles.text}>for a secure login.</Text>
                        </View>
                        <View style={styles.buttonContainer}>
                            <View style={styles.textInputContainer}>
                                <TextInput placeholder="example@website.com"
                                           keyboardType="email-address" style={styles.textInput}
                                           onChangeText={(email) => this.onChangeEmail(email)} />
                            </View >
                            <Text style={{color: Colors.danger, display: this.state.emailValidationFailed ? 'flex' : 'none'}}>Please enter a valid email address</Text>
                            <TouchableOpacity
                                style={styles.submitButton}
                                onPress={() => this.submitEmail()}
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
    textInputContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#DCDCDC',
        width: 250,
        borderRadius: 50,
        padding: 5
    },
    textInput: {
        padding: 8,
        color: '#707070',
        textAlign: 'center'
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