import React from 'react';
import {createAppContainer, NavigationActions, StackActions} from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import SplashScreen from "./Screens/SplashScreen";
import LoginScreen from "./Screens/LoginScreen";
import CheckPasswordScreen from "./Screens/CheckPasswordScreen";
import HomeScreen from "./Screens/HomeScreen";
import DropPinScreen from "./Screens/DropPinScreen";
import PlayScreen from "./Screens/PlayScreen";
import PlayHalfScreen from "./Screens/PlayHalfScreen";
import DetailScreen from "./Screens/DetailScreen";
import SettingScreen from "./Screens/SettingScreen";
import CustomHeader from "./Components/CustomHeader";

const MainNavigator = createStackNavigator({
    Splash: {screen: SplashScreen, navigationOptions: {headerShown: false}},
    Login: {screen: LoginScreen, navigationOptions: {headerShown: false}},
    CheckPassword: {screen: CheckPasswordScreen, navigationOptions: {headerShown: false}},
    Home: {screen: HomeScreen, navigationOptions: {headerShown: false}},
    DropPin: {screen: DropPinScreen, navigationOptions: {headerShown: false}},
    Play: {screen: PlayScreen, navigationOptions: ({navigation}) => ({header: null})},
    PlayHalf: {screen: PlayHalfScreen, navigationOptions: ({navigation}) => ({header: null})},
    Detail: {screen: DetailScreen, navigationOptions: ({navigation}) => ({header: null})},
    Setting: {screen: SettingScreen, navigationOptions: ({navigation}) => ({header: null})},
}, { initialRouteName: "Home" });

export default createAppContainer(MainNavigator);