import React from 'react';
import {ActivityIndicator, Alert, AsyncStorage, BackHandler, Image, KeyboardAvoidingView, Modal, Text, View, TextInput, TouchableOpacity, StyleSheet, ScrollView} from "react-native";
import { StackActions, NavigationActions } from 'react-navigation';
import Api from '../Components/Api';
import {Colors} from "../Components/Colors";
import {Constants} from "../Components/Constants";
import { WebView } from 'react-native-webview';

/*
const resetAction = StackActions.reset({
    index: 0,
    actions: [NavigationActions.navigate({ routeName: 'CheckPassword' })],
});
*/
const api = new Api();

export default class LoginScreen extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            sendRequest: false,
            email: "",
            emailValidationFailed: false,
            termsModal: false,
            webModal: false,
            webViewLoading: true,
            timerActive: false,
            timer: "",
        };
    }

    componentDidMount() {
        AsyncStorage.getItem('accepted_agreement', (err, agreement) => {
            AsyncStorage.getItem('email', (err, email) => {
                this.setState({email: email, termsModal: !agreement});
            });
        });

        this.createTimerForLogin();
    }

    onChangeEmail(email) {
        let emailValidationFailed = (!email.length > 0);
        this.setState({email, emailValidationFailed});
    }

    createTimerForLogin() {
        AsyncStorage.getItem('next_login', (err, nextLogin) => {
            let timer = setInterval(() => {
                let remaining = Math.ceil((parseInt(nextLogin) - Date.now()) / 1000);
                if (remaining >= 0) {
                    let minutes = Math.floor(remaining/60);
                    let seconds = remaining-(minutes*60);
                    this.setState({timer: minutes+":"+(seconds < 10 ? "0"+seconds : seconds)});
                } else {
                    clearInterval(timer);
                    this.setState({timerActive: false, timer: ""});
                }
            }, 1000);
        });
    }

    loginAttempt() {

        this.setState({sendRequest: true});

        api.postRequest("User/SubmitEmail", JSON.stringify([{key: "Email", value: this.state.email}]))
            .then((response) => {
                this.setState({sendRequest: false});
                if (response && (response.result === "success" || response.result === "duplicate")) {
                    AsyncStorage.setItem('userId', response.userId.toString());
                    AsyncStorage.setItem('email', this.state.email);
                    AsyncStorage.setItem('email_request_count', 0);
                    AsyncStorage.setItem('next_login', '');
                    this.props.navigation.navigate('CheckPassword');
                } else {
                    Alert.alert('Whoops!', 'Looks something went wrong! Please try again.');
                }
            })
            .catch((error) => {
                console.error(error);
            });

    }

    submitEmail = () => {
        if (!this.state.email || this.state.email.length < 6) {
            this.setState({emailValidationFailed: true});
        } else {
            AsyncStorage.getItem('email_request_count', (err, count) => {
                console.log('email_request_count', count);
                AsyncStorage.getItem('next_login', (err, nextLogin) => {
                    console.log('next_login', nextLogin);
                    if (parseInt(count) >= 3) {
                        if (parseInt(nextLogin) > Date.now()) {
                            this.setState({timerActive: true});
                            Alert.alert('Whoops!', 'you have tried 3 times. please try ' + Math.ceil((parseInt(nextLogin) - Date.now()) / 60000) + ' minutes later');
                        } else {
                            AsyncStorage.setItem('email_request_count', '1').then(() => {});
                            AsyncStorage.setItem('next_login', '').then(() => {});
                            this.loginAttempt();
                        }
                    } else {
                        count = parseInt(count) > 0 ? parseInt(count) + 1 : 1;
                        AsyncStorage.setItem('email_request_count', count.toString()).then(() => {});

                        if (parseInt(count) === 3)
                            AsyncStorage.setItem('next_login', (Date.now() + 3600000).toString()).then(() => {});

                        this.loginAttempt();

                    }
                }).then(() => {});
            }).then(() => {});
        }
    };

    acceptAgreement() {
        AsyncStorage.setItem('accepted_agreement', "true", () => {
            this.setState({termsModal: false});
        });
    }

    render() {
        // const {navigate} = this.props.navigation;
        return (
            <KeyboardAvoidingView style={styles.contentContainer} contentContainerStyle={styles.contentContainer}>
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={this.state.termsModal}
                >
                    <View style={{flex: 1, backgroundColor: 'rgba(255, 255, 255, 0.7)', justifyContent: 'center', alignItems: 'center'}}>
                        <View style={{height: 250, width: 300, borderRadius: 5, backgroundColor: '#e5e5e5', padding: 20}}>
                            <Text style={{fontSize: 18, fontWeight: 'bold', padding: 10}}>Terms and Conditions</Text>
                            <Text style={{color: Colors.text, padding: 10, paddingBottom: 0}}>
                                Please confirm that you have read and agree to the Azurepin
                            </Text>
                            <View style={{flexDirection: 'row'}}>
                                <TouchableOpacity onPress={() => this.setState({webModal: true})}>
                                    <Text style={{color: Colors.primary, fontWeight: 'bold', paddingLeft: 10}}>
                                        terms and conditions
                                    </Text>
                                </TouchableOpacity>
                                <Text style={{color: Colors.text}}> agreement.</Text>
                            </View>
                            <View style={{flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'flex-end', height: 100}}>
                                <TouchableOpacity onPress={() => BackHandler.exitApp()}>
                                    <Text style={{color: Colors.primaryDark, padding: 20}}>DISAGREE</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => this.acceptAgreement()}>
                                    <Text style={{color: Colors.primaryDark, padding: 20}}>AGREE</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
                <Modal
                    animationType="slide"
                    transparent={false}
                    visible={this.state.webModal}
                    onRequestClose={() => {this.setState({webModal: false})}}
                >
                    <View style={{flex: 1}}>
                        <View style={{borderBottomWidth: 1, borderBottomColor: Colors.border, margin: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                            <Text>{this.state.webModalName}</Text>
                            <TouchableOpacity style={{padding: 10}} onPress={() => {this.setState({webModal: false})}}>
                                <Image source={require('../assets/images/Cancel.png')} style={{width: 12, height: 12}} />
                            </TouchableOpacity>
                        </View>
                        {this.state.webViewLoading &&
                        <View style={{justifyContent: 'center', alignItems: 'center'}}>
                            <ActivityIndicator size="large" color={Colors.primary}/>
                            <Text style={{color: Colors.text}}>Please wait ...</Text>
                        </View>}
                        <WebView source={{uri: Constants.webPages.terms}} onLoadEnd={() => this.setState({webViewLoading: false})} />
                    </View>
                </Modal>
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
                                           keyboardType="email-address"
                                           value={this.state.email}
                                           style={styles.textInput}
                                           onChangeText={(email) => this.onChangeEmail(email)} />
                            </View >
                            <Text style={{color: Colors.danger, display: this.state.emailValidationFailed ? 'flex' : 'none'}}>Please enter a valid email address</Text>

                                <TouchableOpacity
                                style={styles.submitButton}
                                onPress={() => this.submitEmail()}
                                disabled={this.state.sendRequest}
                            >
                                    {this.state.sendRequest ?
                                        <ActivityIndicator size="small" color={Colors.primary}/> :
                                <View>
                                    <Text style={styles.submitButtonText}>Submit</Text>
                                </View>}
                            </TouchableOpacity>
                            {this.state.sendRequest && <View style={{justifyContent: 'center', alignItems: 'center'}}>
                                <Text style={{color: Colors.text}}>Please wait ...</Text>
                            </View>}
                            {this.state.timerActive && <View style={{justifyContent: 'center', alignItems: 'center', padding: 10, flexDirection: 'row'}}>
                                <Text style={{color: Colors.text}}>next login attempt in </Text>
                                <Text style={{color: Colors.danger}}>{this.state.timer}</Text>
                            </View>}
                        </View>
                    </View>
                </View>
            </KeyboardAvoidingView>
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
        margin: 40,
        marginBottom: 0,
    },
    submitButtonText: {
        color: '#007BFE',
        textAlign: 'center'
    }
});