import React from 'react';
import {ActivityIndicator, AsyncStorage, Image, Modal, ScrollView, StyleSheet, ToastAndroid, Text, TouchableOpacity, View} from "react-native";
import {Colors} from "../Components/Colors";
import Api from '../Components/Api';
import { Rating } from 'react-native-elements';
import { WebView } from 'react-native-webview';

const api = new Api();
const RATE_IMAGE = require('../assets/images/rate-icon.png');

export default class SettingScreen extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            active: 'notification',
            notifications: [
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
                {title: 'Help', url: "http://azurepins.com/FAQ.php"},
                {title: 'Terms and Conditions', url: "http://azurepins.com/terms.php"},
                {title: 'About', url: "http://azurepins.com/about.php"}],
            webModal: false,
            webModalName: "",
            webModalUrl: "",
            webViewLoading: true
        };
    }

    componentDidMount() {
        AsyncStorage.getItem('userId', (err, userId) => {
            api.postRequest("Pin/GetBookmarksPin", JSON.stringify([
                {key: "UserId", value: userId}
            ])).then((response) => {
                if (response.result === "success") {
                    let bookmarks = [];
                    for(let i=0; i<response.bookmarks.length; i++) {
                        let dateTime = new Date(response.bookmarks[i].timeStamp * 1000);
                        let months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
                        let year = dateTime.getFullYear();
                        let month = months[dateTime.getMonth()];
                        let date = dateTime.getDate();
                        let hour = dateTime.getHours();
                        let minute = dateTime.getMinutes();

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
        })
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

    render() {
        let content = (
            <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', margin: 10, padding: 10}}>
                <Text style={{color: Colors.text}}>Nothing in here!</Text>
            </View>
        );
        if (this.state.active === 'notification') {
            if (this.state.notifications && this.state.notifications.length > 0)
                content = (this.state.notifications.map(function(item, key) {
                    return (
                        <View style={{flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#E3E3E3', height: 50, margin: 10, paddingBottom: 10}} key={key}>
                            <View style={{flex: 3, marginRight: 5}}>
                                <Text style={{color: '#666666', fontSize: 12}}>{item.title}</Text>
                                <Text style={{color: '#666666', fontSize: 10}}>{item.subtitle}</Text>
                                <Text style={{color: '#666666', fontSize: 10}}>{item.location}</Text>
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
                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            borderBottomWidth: 1,
                            borderBottomColor: '#E3E3E3',
                            height: 50,
                            margin: 10,
                            paddingBottom: 10
                        }} key={key}>
                            <View style={{flex: 3, marginRight: 5}}>
                                <Text style={{color: '#666666', fontSize: 12}}>{item.title}</Text>
                                <Text style={{color: '#666666', fontSize: 10}}>{item.subtitle}</Text>
                                <Text style={{color: '#666666', fontSize: 10}}>{item.location}</Text>
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
                        </View>
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
                                        <Text style={{color: '#666666'}}>{item.title}</Text>
                                    </TouchableOpacity>
                                </View>
                            );
                        })}
                    </View>

                    <TouchableOpacity style={{
                        justifyContent: 'center',
                        alignItems: 'center',
                        margin: 10,
                        borderTopWidth: 1,
                        borderTopColor: Colors.border
                    }}
                                      onPress={() => {
                                          AsyncStorage.removeItem('userId');
                                          this.props.navigation.navigate('Login');
                                      }}>
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
                <View style={{flexDirection:'row', borderBottomColor: '#E3E3E3', borderBottomWidth: 1, padding: 15, margin: 10}}>
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
                        <TouchableOpacity style={[styles.tabItem, this.state.active === 'notification' && styles.activeBackground]}
                                          onPress={() => this.changeActiveTab('notification')}>
                            <Image source={this.state.active === 'notification' ? require('../assets/images/Notification2.png') : require('../assets/images/Notification.png')}
                                   style={{width: 36, height: 32}} />
                        </TouchableOpacity>
                        <Text style={styles.itemText}>Notification</Text>
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
        borderColor: '#E3E3E3'
    },
    activeBackground: {
        backgroundColor: '#2940B0'
    },
    itemContainer: {
        justifyContent: 'center',
        alignItems: 'center'
    },
    itemText: {
        color: '#666666',
        marginTop: 5,
        fontSize: 12
    },
    content: {
        flex:1,
        margin: 10,
        borderWidth: 1,
        borderColor: '#E3E3E3',
        borderRadius: 20
    }
});