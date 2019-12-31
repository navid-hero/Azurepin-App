import React from 'react';
import {ActivityIndicator, AsyncStorage, Image, Modal, ScrollView, StyleSheet, ToastAndroid, Text, TouchableOpacity, View} from "react-native";
import {Colors} from "../Components/Colors";
import Api from '../Components/Api';
import { Rating } from 'react-native-elements';
import { WebView } from 'react-native-webview';
import {NavigationActions, StackActions} from "react-navigation";
import {Constants} from "../Components/Constants";

const api = new Api();
const RATE_IMAGE = require('../assets/images/rate-icon.png');

export default class SettingScreen extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            active: 'myPins',
            myPins: [
                    // {title: 'GooOoooOoooOoooAL', subtitle: 'FEBRUARY 22, 2019 5:32 PM', location: 'Manchester, UK', rate: 3, active: true},
                    // {title: 'Was a Foul!', subtitle: 'FEBRUARY 22, 2019 5:33 PM', location: 'Manchester, UK', rate: 2, active: true},
                    // {title: 'New Zealand', subtitle: 'FEBRUARY 22, 2019 7:16 PM', location: 'Hamilton, New Zealand', rate: 5, active: false},
                ],
            bookmarks: [
                // {title: 'GooOoooOoooOoooAL', subtitle: 'FEBRUARY 22, 2019 5:32 PM', location: 'Manchester, UK', rate: 3, active: true},
                // {title: 'Was a Foul!', subtitle: 'FEBRUARY 22, 2019 5:33 PM', location: 'Manchester, UK', rate: 2, active: true},
                // {title: 'New Zealand', subtitle: 'FEBRUARY 22, 2019 7:16 PM', location: 'Hamilton, New Zealand', rate: 5, active: false},
            ],
            ads: [],
            settings: [
                {title: 'Help', url: Constants.webPages.help},
                {title: 'Terms and Conditions', url: Constants.webPages.terms},
                {title: 'About', url: Constants.webPages.about}],
            webModal: false,
            webModalName: "",
            webModalUrl: "",
            webViewLoading: true
        };
    }

    pinDateAndTime(timestamp) {
        let dateTime = new Date(timestamp * 1000);
        let months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        let year = dateTime.getFullYear();
        let month = months[dateTime.getMonth()];
        let date = dateTime.getDate();
        let hour = dateTime.getHours();
        let minute = dateTime.getMinutes();

        return { year, month, date, hour, minute };
    }

    componentDidMount() {
        AsyncStorage.getItem('userId', (err, userId) => {
            api.postRequest("Pin/GetBookmarksPin", JSON.stringify([
                {key: "UserId", value: userId}
            ])).then((response) => {
                if (response.result === "success") {
                    let bookmarks = [];
                    for(let i=0; i<response.bookmarks.length; i++) {
                        const { year, month, date, hour, minute } = this.pinDateAndTime(response.bookmarks[i].timeStamp);

                        bookmarks.push({
                            id: response.bookmarks[i].pinId,
                            title: response.bookmarks[i].tile,
                            subtitle: month + " " + date + " " + year + " " + hour + ":" + minute,
                            location: response.bookmarks[i].location,
                            rate: response.bookmarks[i].likes
                        });
                    }

                    this.setState({bookmarks});
                }
            });
        }).then((res) => {console.log("get user id from storage", res)});
    }

    deleteBookmark = (index) => {
        AsyncStorage.getItem('userId', (err, userId) => {
            api.postRequest('Pin/DeleteBookmark', JSON.stringify([
                {key: "UserId", value: userId},
                {key: "BookmarkId", value: index}
            ])).then((response) => {
                if (response.result === "success") {
                    ToastAndroid.show('bookmarked removed successfully', ToastAndroid.SHORT);
                    this.setState({bookmarks: this.state.bookmarks.filter(obj => {
                        if (obj.id !== index) return obj;
                    })});
                } else {
                    ToastAndroid.show(response.message, ToastAndroid.SHORT);
                }
            });
        });
    };

    changeActiveTab(tab) {
        this.setState({active: tab});
    }

    logout() {
        AsyncStorage.removeItem('userId');
        AsyncStorage.removeItem('logged_in');
        const resetAction = StackActions.reset({
            index: 0,
            actions: [NavigationActions.navigate({ routeName: 'Login' })],
        });
        this.props.navigation.dispatch(resetAction);
    }

    render() {
        let content = (
            <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', margin: 10, padding: 10}}>
                <Text style={{color: Colors.text}}>Nothing in here!</Text>
            </View>
        );
        if (this.state.active === 'myPins') {
            if (this.state.myPins && this.state.myPins.length > 0)
                content = (this.state.myPins.map(function(item, key) {
                    return (
                        <View style={{flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: Colors.border2, height: 50, margin: 10, paddingBottom: 10}} key={key}>
                            <View style={{flex: 3, marginRight: 5}}>
                                <Text style={{color: Colors.text, fontSize: 12}}>{item.title}</Text>
                                <Text style={{color: Colors.text, fontSize: 10}}>{item.subtitle}</Text>
                                <Text style={{color: Colors.text, fontSize: 10}}>{item.location}</Text>
                            </View>
                            <View style={{flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginLeft: 5}}
                                  pointerEvents="none">
                                <Image source={require('../assets/images/Rated.png')}
                                       style={{width: 63, height: 7, margin: 5}} />
                                {item.active ? <Image source={require('../assets/images/Cancel.png')}
                                                      style={{width: 12, height: 12, margin: 5}} /> : <View></View>}
                            </View>
                        </View>
                    );
                }));
        } else if (this.state.active === 'bookmark') {
            const data = this;
            if (this.state.bookmarks && this.state.bookmarks.length > 0) {
                content = (this.state.bookmarks.map(function (item, key) {
                    return (
                        <TouchableOpacity
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                borderBottomWidth: 1,
                                borderBottomColor: Colors.border2,
                                height: 50,
                                margin: 10,
                                paddingBottom: 10}}
                            key={key}
                            onPress={() => {/*this.props.navigation.navigate('Play', {coordinates: JSON.stringify([this.state.coordinates[key]]), mapCenter: JSON.stringify(this.state.mapCenter)})*/ToastAndroid.show('bookmark clicked', ToastAndroid.SHORT);}}>
                            <View style={{flex: 3, marginRight: 5}}>
                                <Text style={{color: Colors.text, fontSize: 12}}>{item.title}</Text>
                                <Text style={{color: Colors.text, fontSize: 10}}>{item.subtitle}</Text>
                                <Text style={{color: Colors.text, fontSize: 10}}>{item.location}</Text>
                            </View>
                            <View style={{
                                flex: 2,
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                marginLeft: 5
                            }}>
                                <Rating
                                    type='custom'
                                    ratingImage={RATE_IMAGE}
                                    ratingColor={Colors.primary}
                                    ratingBackgroundColor={Colors.light}
                                    imageSize={15}
                                    startingValue={item.rate}
                                    readonly={true}
                                />
                                <TouchableOpacity onPress={() => data.deleteBookmark(item.id)}>
                                    <Image source={require('../assets/images/Icon.png')}
                                           style={{width: 14, height: 18, margin: 5}}/>
                                </TouchableOpacity>
                            </View>
                        </TouchableOpacity>
                    );
                }));
            }
        } else if (this.state.active === 'ad') {
                //
        } else if (this.state.active === 'setting') {
            content = (
                <View style={{flex: 1, justifyContent: 'space-between'}}>
                    <View>
                        {this.state.settings.map((item, key) => {
                            return (
                                <View key={key} style={{flexDirection: 'row', margin: 10}}>
                                    <Image source={require('../assets/images/Path-40.png')}
                                           style={{width: 6, height: 12, margin: 10}}/>
                                    <TouchableOpacity onPress={() => {
                                        this.setState({webModal: true, webModalName: item.title, webModalUrl: item.url})
                                    }}>
                                        <Text style={{color: Colors.text}}>{item.title}</Text>
                                    </TouchableOpacity>
                                </View>
                            );
                        })}
                    </View>

                    <TouchableOpacity
                        style={{
                        justifyContent: 'center',
                        alignItems: 'center',
                        margin: 10,
                        borderTopWidth: 1,
                        borderTopColor: Colors.border
                    }}
                        onPress={() => {this.logout();}}>
                        <Text style={{color: Colors.danger, padding: 10}}>Log out of Azurepin</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        return (
            <View style={{flex:1}}>
                <Modal
                    animationType="slide"
                    transparent={false}
                    visible={this.state.webModal}
                >
                    <View style={{flex: 1}}>
                        <View style={{borderBottomWidth: 1, borderBottomColor: Colors.border, margin: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                            <Text>{this.state.webModalName}</Text>
                            <TouchableOpacity style={{padding: 10}} onPress={() => {this.setState({webModal: false, webViewLoading: true})}}>
                                <Image source={require('../assets/images/Cancel.png')} style={{width: 12, height: 12}} />
                            </TouchableOpacity>
                        </View>
                        {this.state.webViewLoading &&
                        <View style={{justifyContent: 'center', alignItems: 'center'}}>
                            <ActivityIndicator size="large" color={Colors.primary}/>
                            <Text style={{color: Colors.text}}>Please wait ...</Text>
                        </View>}
                        <WebView source={{uri: this.state.webModalUrl}} onLoadEnd={() => this.setState({webViewLoading: false})}/>
                    </View>
                </Modal>
                <View style={{flexDirection:'row', borderBottomColor: Colors.border2, borderBottomWidth: 1, padding: 15, margin: 10}}>
                    <View style={{flex:2, alignItems: 'flex-end'}}>
                        <Image source={require('../assets/images/Logo_Text.png')}
                               style={{width: 129, height: 32}} />
                    </View>
                    <View style={{flex: 1, alignItems: 'flex-end'}}>
                        <TouchableOpacity onPress={() => {this.props.navigation.goBack();}} style={{margin:10}} >
                            <Image source={require('../assets/images/Cancel.png')}
                               style={{width: 12, height: 12}} />
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={{flexDirection:'row', justifyContent: 'space-around', margin: 10}}>
                    <View style={styles.itemContainer}>
                        <TouchableOpacity style={[styles.tabItem, this.state.active === 'myPins' && styles.activeBackground]}
                                          onPress={() => this.changeActiveTab('myPins')}>
                            <Image source={this.state.active === 'myPins' ? require('../assets/images/Notification2.png') : require('../assets/images/Notification.png')}
                                   style={{width: 36, height: 32}} />
                        </TouchableOpacity>
                        <Text style={styles.itemText}>My Pins</Text>
                    </View>
                    <View style={styles.itemContainer}>
                        <TouchableOpacity style={[styles.tabItem, this.state.active === 'bookmark' && styles.activeBackground]}
                                          onPress={() => this.changeActiveTab('bookmark')}>
                            <Image source={this.state.active === 'bookmark' ? require('../assets/images/Icon2.png') : require('../assets/images/Icon.png')}
                                   style={{width: 21, height: 27}} />
                        </TouchableOpacity>
                        <Text style={styles.itemText}>Bookmark</Text>
                    </View>
                    <View style={styles.itemContainer}>
                        <TouchableOpacity style={[styles.tabItem, this.state.active === 'ad' && styles.activeBackground]}
                                          onPress={() => this.changeActiveTab('ad')}>
                            <Image source={this.state.active === 'ad' ? require('../assets/images/product2.png') : require('../assets/images/product.png')}
                                   style={{width: 35, height: 39}} />
                        </TouchableOpacity>
                        <Text style={styles.itemText}>Ads</Text>
                    </View>
                    <View style={styles.itemContainer}>
                        <TouchableOpacity style={[styles.tabItem, this.state.active === 'setting' && styles.activeBackground]}
                                          onPress={() => this.changeActiveTab('setting')}>
                            <Image source={this.state.active === 'setting' ? require('../assets/images/settings2.png') : require('../assets/images/settings.png')}
                                   style={{width: 33, height: 33}} />
                        </TouchableOpacity>
                        <Text style={styles.itemText}>Settings</Text>
                    </View>
                </View>
                <View style={styles.content}>
                    {content}
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    tabItem: {
        width: 60,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 50,
        borderWidth: 1,
        borderColor: Colors.border2
    },
    activeBackground: {
        backgroundColor: Colors.primaryDark
    },
    itemContainer: {
        justifyContent: 'center',
        alignItems: 'center'
    },
    itemText: {
        color: Colors.text,
        marginTop: 5,
        fontSize: 12
    },
    content: {
        flex:1,
        margin: 10,
        borderWidth: 1,
        borderColor: Colors.border2,
        borderRadius: 20
    }
});