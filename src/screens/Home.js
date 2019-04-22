import React from 'react';
import { Button, View, Text, BackHandler } from 'react-native';
//import syncLocaldbWithServerdb from './../tasks/synchronizationLocalWithServerDatabase';
import Spinner from 'react-native-loading-spinner-overlay';
import { createStackNavigator, createAppContainer, createSwitchNavigator } from "react-navigation";
import localDatabase from './../localDatabase/LocalDatabaseManager';
import BackgroundTimer from 'react-native-background-timer';

import NetInfo from "@react-native-community/netinfo";

import sync from './../tasks/syncDatabases';

class Home extends React.Component {

  constructor(props) {
    super(props);
    
    this.state = {
      spinner: false,
    };

    this.netStateOnChange = false;
    
     sync.setThisForSpinner(this);
  }

  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state;
    return {
      title: `Welcome ${navigation.state.params.title}!`,
      headerRight: (
        <Button
          onPress={ () => params.Logout(navigation) }
          title="Logout"
          color="gray"
        />
      ),
    };
  };

  async _onLogout(nav) {
    
    try {
      //'DELETE FROM  table_user where user_id=?', [input_user_id]
      await localDatabase.delete('User', 'name=?', [nav.state.params.title]);
      try {
        //await syncLocaldbWithServerdb.stopAllTasks();
        nav.navigate('AuthLoading');
      } catch(e) {
        console.log('Something went wrong with stopAll tasks');
        console.log(e);
      }
    } catch(e) {
      console.log('Something went wrong with the logout!\n Try again!');
      console.log(e);
    }
    
  }

  render() {
    return (
      <View style={{ flex: 1, alignItems:'center', justifyContent:'center' }}>
        <Spinner
          visible={this.state.spinner}
          textContent={'Synchronazing...'}
        />

        <Button title="Scan QR code"
          onPress={ () => this.props.navigation.navigate('QRScan', { title: this.props.navigation.state.params.title }) }
        />

        <Button title="Scan Beacon"
          onPress={ ()=> this.props.navigation.navigate('BeaconScan', { title: this.props.navigation.state.params.title }) }
        />

        <Button title="History"
          onPress={ ()=> this.props.navigation.navigate('History', { title: this.props.navigation.state.params.title }) }
        />
      </View>
    );
  }
  

  componentDidMount() {
    //------------------------------------------------------------------------------------
   
    this.listener = async connectionInfo => {
      console.log("Connection type", connectionInfo.type);
      console.log("Connection effective type", connectionInfo.effectiveType);
      
      if (this.netStateOnChange === false && connectionInfo.type !== 'none' && connectionInfo.type !== 'unknown') {
        this.netStateOnChange = true;
        setTimeout( () => {
          this.netStateOnChange = false;
        }, 3000);
      
        sync.basicTask();        
      } 
    };


    BackgroundTimer.runBackgroundTimer( async () => { 
      //code that will be called every 
      try {
        await sync.getNewToken();
      } catch(e) {
        console.log('GetNewToken failed in runBackgroundTimer');
      }
    }, 
    2700000);



    NetInfo.addEventListener('connectionChange', this.listener);

    //------------------------------------------------------------------------------------
    
    this.props.navigation.setParams({ Logout: this._onLogout });
    
    this.backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      this.goBack(); // works best when the goBack is async
      return true;
    });
  }

  async goBack() {
    await this.props.navigation.popToTop();
    return true;
  }

  componentWillUnmount() {

    this.backHandler.remove();

    NetInfo.removeEventListener(
      'connectionChange',
      this.listener,
    );
    BackgroundTimer.stopBackgroundTimer();
  }

}

export default Home;