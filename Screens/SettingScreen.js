import React from 'react';
import {Alert, ActivityIndicator, AsyncStorage, Image, Modal, ScrollView, StyleSheet, ToastAndroid, Text, TouchableOpacity, View} from "react-native";
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
                {title: 'FAQ', url: Constants.webPages.help},
                {title: 'Terms and Conditions', url: Constants.webPages.terms},
                {title: 'Feedback', url: Constants.webPages.feedback},
                {title: 'About', url: Constants.webPages.about}
            ],
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
        let minute = dateTime.getMinutes().toString().length < 2 ? "0"+dateTime.getMinutes() : dateTime.getMinutes();

        return { year, month, date, hour, minute };
    }

    componentDidMount() {
        AsyncStorage.getItem('userId', (err, userId) => {
            api.postRequest("Pin/GetMyPins", JSON.stringify([
                {key: "UserId", value: userId},
                {key: "Page", value: 0},
                {key: "Row", value: 10}
            ])).then((response) => {
                console.log("my pins", response);
                if (response.result === "success") {
                    let myPins = [];
                    for(let j=0; j<response.pins.length; j++) {
                        const { year, month, date, hour, minute } = this.pinDateAndTime(response.pins[j].timeStamp);

                        myPins.push({
                            id: response.pins[j].pinId,
                            title: response.pins[j].title,
                            subtitle: hour + ":" + minute + "/ " + date + " " + month + " " + year,
                            location: response.pins[j].location,
                            rating: response.pins[j].likeDislike,
                            likes: response.pins[j].likes,
                            dislikes: response.pins[j].dislikes
                        });
                    }

                    this.setState({myPins}, () => console.log("pins", myPins));
                }
            });
            api.postRequest("Pin/GetBookmarksPin", JSON.stringify([
                {key: "UserId", value: userId}
            ])).then((response) => {
                console.log("my bookmarks", response);
                if (response.result === "success") {
                    let bookmarks = [];
                    for (let i = 0; i < response.bookmarks.length; i++) {
                        const {year, month, date, hour, minute} = this.pinDateAndTime(response.bookmarks[i].timeStamp);

                        bookmarks.push({
                            id: response.bookmarks[i].pinId,
                            title: response.bookmarks[i].title,
                            subtitle: hour + ":" + minute + "/ " + date + " " + month + " " + year,
                            location: response.bookmarks[i].location,
                            rating: response.bookmarks[i].likeDislike,
                            likes: response.bookmarks[i].likes,
                            dislikes: response.bookmarks[i].dislikes
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
                console.log("delete bookmark response", response);
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

    deletePin = (index) => {
        Alert.alert(
            'Delete Pin',
            'Be careful, this action can not be undone!',
            [
                {text: 'Delete', onPress: () => {
                        AsyncStorage.getItem('userId', (err, userId) => {
                            api.postRequest('Pin/DeleteMyPin', JSON.stringify([
                                {key: "UserId", value: userId},
                                {key: "PinId", value: index}
                            ])).then((response) => {
                                if (response.result === "success") {
                                    ToastAndroid.show('Pin removed successfully', ToastAndroid.SHORT);
                                    this.setState({myPins: this.state.myPins.filter(obj => {
                                            if (obj.id !== index) return obj;
                                        })});
                                } else {
                                    ToastAndroid.show(response.message, ToastAndroid.SHORT);
                                }
                            });
                        });
                    }},
                {text: 'Cancel', onPress: () => {}, style: 'cancel'},
            ],
            {cancelable: true},
        );
    }

    changeActiveTab(tab) {
        this.setState({active: tab});
    }

    logout() {
        AsyncStorage.removeItem('userId');
        AsyncStorage.removeItem('logged_in');
        AsyncStorage.removeItem('email');
        const resetAction = StackActions.reset({
            index: 0,
            actions: [NavigationActions.navigate({ routeName: 'Login' })],
        });
        this.props.navigation.dispatch(resetAction);
    }

    render() {
        let content = (
            <View style={[styles.content, {flex: 1, justifyContent: 'center', alignItems: 'center', margin: 10, padding: 10}]}>
                <Text style={{color: Colors.text}}>Nothing in here!</Text>
            </View>
        );
        if (this.state.active === 'myPins') {
            const data = this;
            if (this.state.myPins && this.state.myPins.length > 0) {
                content = (<ScrollView style={styles.content}>
                    {this.state.myPins.map(function (item, key) {
                        return (
                            <View style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                borderBottomWidth: 1,
                                borderBottomColor: Colors.border2,
                                height: 50,
                                margin: 10,
                                paddingBottom: 20
                            }}
                                  key={key}>
                                <TouchableOpacity style={{flex: 1, marginRight: 5}}
                                                  onPress={() => {
                                                      data.props.navigation.navigate('Play', {
                                                          coordinates: JSON.stringify([{
                                                              id: item.id,
                                                              title: item.title
                                                          }]), mapCenter: JSON.stringify({lng: item.lng, lat: item.lat})
                                                      })
                                                  }}>
                                    <Text style={{color: Colors.text, fontSize: 12}}>{item.title}</Text>
                                    <Text style={{color: Colors.text, fontSize: 10}}>{item.subtitle}</Text>
                                    <Text style={{color: Colors.text, fontSize: 10}}>{item.location}</Text>
                                </TouchableOpacity>
                                <View style={{
                                    flex: 1,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    marginLeft: 5
                                }}>
                                    <View style={{flex: 5, flexDirection: 'row', justifyContent: 'space-around'}}>
                                        <Image
                                            source={item.rating === 1 ? require('../assets/images/liked.png') : require('../assets/images/like.png')}
                                            style={{width: 40, height: 40}}/>
                                        <View style={{alignItems: 'center'}}>
                                            <Text style={{color: Colors.text, fontSize: 10}}>ratio</Text>
                                            <Text style={{color: Colors.text, fontSize: 10}}>{item.likes} : {item.dislikes}</Text>
                                        </View>
                                        <Image
                                            source={item.rating === -1 ? require('../assets/images/Disliked.png') : require('../assets/images/Dislike.png')}
                                            style={{width: 40, height: 40}}/>
                                    </View>
                                    <TouchableOpacity onPress={() => data.deletePin(item.id)} style={{flex: 1, justifyContent: 'flex-end', alignItems: 'flex-start'}}>
                                        <Image source={require('../assets/images/Union.png')} style={{width: 12, height: 12}}/>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        );
                    })}</ScrollView>);
            } else {
                content =
                    (<View style={[styles.content, {flex: 1, justifyContent: 'center', alignItems: 'center', margin: 10, padding: 10}]}>
                        <Image  source={require('../assets/images/no_pin.png')} />
                    </View>);
            }
        } else if (this.state.active === 'bookmark') {
            const data = this;
            if (this.state.bookmarks && this.state.bookmarks.length > 0) {
                content = (<ScrollView style={styles.content}>
                    {this.state.bookmarks.map(function (item, key) {
                    return (
                        <View
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                borderBottomWidth: 1,
                                borderBottomColor: Colors.border2,
                                height: 50,
                                margin: 10,
                                paddingBottom: 20}}
                            key={key}>
                            <TouchableOpacity style={{flex: 1, marginRight: 5}}
                                              onPress={() => {data.props.navigation.navigate('Play', {coordinates: JSON.stringify([{id: item.id, title: item.title}]), mapCenter: JSON.stringify({lng: item.lng, lat: item.lat})})}}>
                                <Text style={{color: Colors.text, fontSize: 12}}>{item.title}</Text>
                                <Text style={{color: Colors.text, fontSize: 10}}>{item.subtitle}</Text>
                                <Text style={{color: Colors.text, fontSize: 10}}>{item.location}</Text>
                            </TouchableOpacity>
                            <View style={{
                                flex: 1,
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                marginLeft: 5
                            }}>
                                <View style={{flex: 5, flexDirection: 'row', justifyContent: 'space-around'}}>
                                    <Image source={item.rating === 1 ? require('../assets/images/liked.png') : require('../assets/images/like.png')}
                                           style={{flex: 1, width: 40, height: 40}} />
                                    <View style={{flex: 1, alignItems: 'center'}}>
                                        <Text style={{color: Colors.text, fontSize: 10}}>ratio</Text>
                                        <Text style={{color: Colors.text, fontSize: 10}}>{item.likes} : {item.dislikes}</Text>
                                    </View>
                                    <Image source={item.rating === -1 ? require('../assets/images/Disliked.png') : require('../assets/images/Dislike.png')}
                                           style={{flex: 1, width: 40, height: 40}} />
                                </View>
                                <TouchableOpacity onPress={() => data.deleteBookmark(item.id)} style={{flex: 1, justifyContent: 'flex-end', alignItems: 'flex-start'}}>
                                    <Image source={require('../assets/images/Icon.png')}/>
                                </TouchableOpacity>
                            </View>
                        </View>
                    );
                    })}</ScrollView>);
            } else {
                content =
                    (<View style={[styles.content, {flex: 1, justifyContent: 'center', alignItems: 'center', margin: 10, padding: 10}]}>
                        <Image  source={require('../assets/images/no_bookmark.png')} />
                    </View>);
            }
        } else if (this.state.active === 'ad') {
                content = (
                    <View style={[styles.content, {flex: 1, justifyContent: 'center', alignItems: 'center', margin: 10, padding: 10}]}>
                        <Text style={{color: Colors.textMuted}}>Coming Soon!</Text>
                    </View>
                );
        } else if (this.state.active === 'setting') {
            content = (
                <View style={[styles.content, {flex: 1, justifyContent: 'space-between'}]}>
                    <View>
                        {this.state.settings.map((item, key) => {
                            return (
                                <View key={key} style={{flexDirection: 'row', margin: 10}}>
                                    <Image source={require('../assets/images/Path-40.png')}
                                           style={{width: 6, height: 12, marginHorizontal: 7, marginVertical: 5}}/>
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
                {/*<View style={{flexDirection:'row', borderBottomColor: Colors.border2, borderBottomWidth: 1, margin: 10, padding: 10}}>*/}
                <View style={{flexDirection:'row', justifyContent: 'center', alignItems: 'center', borderBottomColor: Colors.border2, borderBottomWidth: 1, margin: 10, padding: 10}}>
                    {/*<View style={{flex: 1}}><Text></Text></View>*/}
                    <View style={{flex:1, justifyContent: 'center', alignItems:'flex-start'}}></View>
                    <View style={{flex: 2, justifyContent: 'center', alignItems:'center'}}>
                        <Image source={require('../assets/images/Logo_Text.png')} style={{padding: 3}} />
                    </View>
                    <TouchableOpacity style={{flex: 1, justifyContent: 'center', alignItems:'flex-end', paddingRight: 10}}
                                      onPress={() => {this.props.navigation.goBack();}}>
                        <Image
                            source={require('../assets/images/Cancel.png')}
                            style={{ width: 12, height: 12 }}
                        />
                    </TouchableOpacity>
                </View>
                <View style={{flexDirection:'row', justifyContent: 'space-around', margin: 10}}>
                    <View style={styles.itemContainer}>
                        <TouchableOpacity style={[styles.tabItem, this.state.active === 'myPins' && styles.activeBackground]}
                                          onPress={() => this.changeActiveTab('myPins')}>
                            <Image source={this.state.active === 'myPins' ? require('../assets/images/myPins2.png') : require('../assets/images/myPins.png')}
                                   style={{width: 31, height: 40}} />
                        </TouchableOpacity>
                        <Text style={styles.itemText}>My Pins</Text>
                    </View>
                    <View style={styles.itemContainer}>
                        <TouchableOpacity style={[styles.tabItem, this.state.active === 'bookmark' && styles.activeBackground]}
                                          onPress={() => this.changeActiveTab('bookmark')}>
                            <Image source={this.state.active === 'bookmark' ? require('../assets/images/Icon2.png') : require('../assets/images/Icon.png')}
                                   style={{width: 21, height: 27}} />
                        </TouchableOpacity>
                        <Text style={styles.itemText}>Bookmarks</Text>
                    </View>
                    <View style={styles.itemContainer}>
                        <TouchableOpacity style={[styles.tabItem, this.state.active === 'ad' && styles.activeBackground]}
                                          onPress={() => this.changeActiveTab('ad')}>
                            <Image source={this.state.active === 'ad' ? require('../assets/images/Ads2.png') : require('../assets/images/Ads.png')}
                                   style={{width: 31, height: 24}} />
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
                {content}
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
        borderRadius: 20,
        paddingTop: 10
    }
});