import React from 'react';
import {Alert, AsyncStorage, Image, Text, View, TextInput, TouchableOpacity, StyleSheet} from "react-native";
import { StackActions, NavigationActions } from 'react-navigation';
import Api from '../Components/Api';
const resetAction = StackActions.reset({
    index: 0,
    actions: [NavigationActions.navigate({ routeName: 'Home' })],
});

const api = new Api();

export default class CheckPasswordScreen extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            code: ""
        };
    }

    onChangeCode(code) {
        this.setState({code});
    }

    submitCode = () => {
        AsyncStorage.getItem('userId', (err, value) => {
            api.postRequest("User/SubmitSignupKey", JSON.stringify([{key: "UserId", value: value}, {key: "Key", value: this.state.code}]))
                .then((response) => {
                    if (response.result === "success")
                        this.props.navigation.dispatch(resetAction);
                    else
                        Alert.alert('Woops!', 'Looks something went wrong!');
                })
                .catch((error) => {
                    console.error(error);
                });
        });
    }
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
                        <View style={styles.textInputContainer}>
                            <Text style={{textAlign: 'right', width: 50, color: '#707070'}}>AZ -</Text>
                            <TextInput placeholder=" XXXXX"
                                       style={[styles.textInput, {textAlign: 'left', width: 90}]}
                                       keyboardType="numeric"
                                       onChangeText={(code) => this.onChangeCode(code)} />
                        </View>
                        <TouchableOpacity
                            style={styles.submitButton}
                            onPress={() => this.submitCode()}
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
    textInputContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#DCDCDC',
        width: 180,
        borderRadius: 50,
    },
    textInput: {
        color: '#707070',
        paddingTop: 13
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