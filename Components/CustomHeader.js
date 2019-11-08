import React from 'react';
import {ActionSheetIOS, Image, TouchableOpacity, View, Platform} from "react-native";
import ActionSheet from 'react-native-actionsheet';
import {withNavigation} from "react-navigation";

class CustomHeader extends React.Component {
    constructor(props) {
        super(props);

        this.state= {
            optionArray: ['Report', 'Bookmark', 'Copy Link', 'Save', 'Cancel'],
            cancelButtonIndex: 4,
            destructiveButtonIndex: 0
        };
    }
    showActionSheet = () => {
        /*
        if (Platform.osVersion === 'ios') {
            ActionSheetIOS.showActionSheetWithOptions(
                {
                    options: ['Report', 'Bookmark', 'Copy Link', 'Save', 'Cancel'],
                    destructiveButtonIndex: 1,
                    cancelButtonIndex: 0,
                },
                (buttonIndex) => {
                    if (buttonIndex === 1) {
                        // destructive action
                    }
                },
            );
        } else {
            this.ActionSheet.show();
        }
        */

        this.ActionSheet.show();
    };

    resetActionSheet() {
        this.setState({
            optionArray: ['Report', 'Bookmark', 'Copy Link', 'Save', 'Cancel'],
            cancelButtonIndex: 4,
            destructiveButtonIndex: 0
        });
    }

    onActionButtonPressed(index) {
        switch (index) {
            case 'Report':
                this.onReport();
                break;
            case 'Bookmark':
                break;
            case 'Copy Link':
                break;
            case 'Save':
                break;
            case 'Spam':
                this.resetActionSheet();
                break;
            case 'Inappropriate':
                this.resetActionSheet();
                break;
            case 'Cancel':
                this.resetActionSheet();
                break;
            default:
                alert(index);
                break;
        }
    }

    onReport() {
        this.setState({
            optionArray: ['Spam', 'Inappropriate', 'Cancel'],
            cancelButtonIndex: 2,
            destructiveButtonIndex: 0
        });
        this.ActionSheet.show();
    }

    render() {
        return (
            <View style={{flexDirection:'row', justifyContent: 'space-between',borderBottomColor: '#E3E3E3', borderBottomWidth: 1, margin: 20}}>
                <ActionSheet
                    ref={o => (this.ActionSheet = o)}
                    options={this.state.optionArray}
                    //Define cancel button index in the option array
                    //this will take the cancel option in bottom and will highlight it
                    cancelButtonIndex={this.state.cancelButtonIndex}
                    //If you want to highlight any specific option you can use below prop
                    destructiveButtonIndex={this.state.destructiveButtonIndex}
                    onPress={index => {
                        //Clicking on the option will give you the index of the option clicked
                        this.onActionButtonPressed(this.state.optionArray[index]);
                    }}
                />
                <TouchableOpacity style={{margin:10}}
                                  onPress={() => this.showActionSheet()}>
                    <Image
                        source={require('../assets/images/More.png')}
                        style={{ width: 20, height: 19 }}
                    />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => {this.props.navigation.navigate('Setting');}}>
                    <Image
                        source={require('../assets/images/Logo_Text.png')}
                        style={{ width: 129, height: 32 }}
                    />
                </TouchableOpacity>

                <TouchableOpacity style={{margin:10}}
                                  onPress={() => {this.props.navigation.pop();}}>
                    <Image
                        source={require('../assets/images/Cancel.png')}
                        style={{ width: 12, height: 12 }}
                    />
                </TouchableOpacity>
            </View>
        );
    }
}

export default withNavigation(CustomHeader);
