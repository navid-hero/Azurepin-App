import React from 'react';
import {AsyncStorage, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {Colors} from "../Components/Colors";

export default class SettingScreen extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            active: 'notification',
            notifications: [
                    {title: 'GooOoooOoooOoooAL', subtitle: 'FEBRUARY 22, 2019 5:32 PM', location: 'Manchester, UK', rate: 3, active: true},
                    {title: 'Was a Foul!', subtitle: 'FEBRUARY 22, 2019 5:33 PM', location: 'Manchester, UK', rate: 2, active: true},
                    {title: 'New Zealand', subtitle: 'FEBRUARY 22, 2019 7:16 PM', location: 'Hamilton, New Zealand', rate: 5, active: false},
                ],
            bookmarks: [
                {title: 'GooOoooOoooOoooAL', subtitle: 'FEBRUARY 22, 2019 5:32 PM', location: 'Manchester, UK', rate: 3, active: true},
                {title: 'Was a Foul!', subtitle: 'FEBRUARY 22, 2019 5:33 PM', location: 'Manchester, UK', rate: 2, active: true},
                {title: 'New Zealand', subtitle: 'FEBRUARY 22, 2019 7:16 PM', location: 'Hamilton, New Zealand', rate: 5, active: false},
            ],
            ads: [],
            settings: [{title: 'Help'}, {title: 'Terms and Conditions'}, {title: 'About'}],
            termsModal: false,
        };
    }

    changeActiveTab(tab) {
        this.setState({active: tab});
    }

    render() {
        let content = (<Text style={{color: '#666666'}}>Comming Soon...</Text>);
        if (this.state.active === 'notification')
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
        else if (this.state.active === 'bookmark')
            content = (this.state.bookmarks.map(function(item, key) {
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
                            <Image source={require('../assets/images/Icon.png')}
                                   style={{width: 14, height: 18, margin: 5}} />
                        </View>
                    </View>
                );
            }));
        else if (this.state.active === 'ad')
            content = (<Text style={{color: '#666666'}}>Ads</Text>);
        else if (this.state.active === 'setting')
            content = (
                <View style={{flex: 1, justifyContent: 'space-between'}}>
                    <View>
                        <View style={{flexDirection: 'row', margin: 10}}>
                            <Image source={require('../assets/images/Path-40.png')} style={{width: 6, height: 12, margin: 10}}/>
                            <TouchableOpacity onPress={() => {}}>
                                <Text style={{color: '#666666'}}>Help</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={{flexDirection: 'row', margin: 10}}>
                            <Image source={require('../assets/images/Path-40.png')} style={{width: 6, height: 12, margin: 10}}/>
                            <TouchableOpacity onPress={() => {this.setState({termsModal: true})}}>
                                <Text style={{color: '#666666'}}>Terms and Conditions</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={{flexDirection: 'row', margin: 10}}>
                            <Image source={require('../assets/images/Path-40.png')} style={{width: 6, height: 12, margin: 10}}/>
                            <TouchableOpacity>
                                <Text style={{color: '#666666'}}>Abuot</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity style={{justifyContent: 'center', alignItems: 'center', margin: 10, borderTopWidth: 1, borderTopColor: Colors.border}}
                                      onPress={() => {AsyncStorage.removeItem('userId'); this.props.navigation.navigate('Login');}}>
                        <Text style={{color: Colors.danger, padding: 10}}>Log out of Azurepin</Text>
                    </TouchableOpacity>
                </View>
            );

        return (
            <View style={{flex:1}}>
                <Modal
                    animationType="slide"
                    transparent={false}
                    visible={this.state.termsModal}
                >
                    <ScrollView style={{flex: 1}}>
                        <View style={{borderBottomWidth: 1, borderBottomColor: Colors.border, margin: 10, justifyContent: 'flex-end', alignItems: 'flex-end'}}>
                            <TouchableOpacity style={{padding: 10}} onPress={() => {this.setState({termsModal: false})}}>
                                <Image source={require('../assets/images/Cancel.png')} style={{width: 12, height: 12}} />
                            </TouchableOpacity>
                        </View>
                        {/*<WebView source={{uri: 'http://azurepins.com/terms.php'}} style={{marginTop: 5}} />*/}
                    </ScrollView>
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
        borderRadius: 20,
        alignItems: 'flex-start'
    }
});