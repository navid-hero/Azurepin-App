import React from 'react';
import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import SplashScreen from "./Screens/SplashScreen";
import LoginScreen from "./Screens/LoginScreen";
import CheckPasswordScreen from "./Screens/CheckPasswordScreen";
import HomeScreen from "./Screens/HomeScreen";

const MainNavigator = createStackNavigator({
    Splash: {screen: SplashScreen, navigationOptions: () => ({headerShown: false})},
    Login: {screen: LoginScreen, navigationOptions: () => ({headerShown: false})},
    CheckPassword: {screen: CheckPasswordScreen, navigationOptions: () => ({headerShown: false})},
    Home: {screen: HomeScreen, navigationOptions: () => ({headerShown: false})},
});

export default createAppContainer(MainNavigator);


