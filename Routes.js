import React, { Component } from "react";
import { createStackNavigator, createAppContainer, createSwitchNavigator } from "react-navigation";
import Home from "./src/screens/Home";
import QRScan from './src/screens/QRScan/QRScan';
import BeaconScan from './src/screens/BeaconScan/BeaconScan';
import Login from './src/screens/Login';
import Register from './src/screens/Register';
import AuthLoadingScreen from './src/screens/AuthLoadingScreen';
import History from './src/screens/History';

const AuthenticationNavigator = createStackNavigator({
  Login: Login,
  Register: Register,
});

const mainApp = createStackNavigator({
  Home: Home,
  QRScan: QRScan,
  BeaconScan: BeaconScan,
  History: History
});


const App = createAppContainer(createSwitchNavigator(
  {
    AuthLoading: AuthLoadingScreen,
    App: mainApp,
    Auth: AuthenticationNavigator,
  },
  {
    initialRouteName: 'AuthLoading',
  }
));
export default App;