import React from 'react';
import {
  ActivityIndicator,
  AsyncStorage,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import localDatabase from './../localDatabase/LocalDatabaseManager';
import sync from './../tasks/syncDatabases';

class AuthLoadingScreen extends React.Component {

  constructor(props) {
    super(props);

    this._bootstrapAsync();
  }

  // Fetch the token from storage then navigate to our appropriate place
  _bootstrapAsync = async () => {
    let users = null;
    let curr_user = null;

    try {
      users = await localDatabase.read('*', 'User', '', []);
      // you are here from Logout action.
      if (users === 0) {
        this.props.navigation.navigate('Login');
        return;
      }
      
      curr_user = users[0];
    } catch(e) {
      this.props.navigation.navigate('Login');
      return;
    }

    

    sync.setCurrUser(curr_user);

    try {
      await sync.getNewToken();
    } catch(e) {
      console.log('GetNewToken failed in _bootstrapAsync\n\tYou cannot send request in Global Database but you can use the application!');
      console.log(e);
    }


    this.props.navigation.navigate('Home', { title: curr_user.name });
    
  };

  // Render any loading content that you like here
  render() {
    return (
      <View>
        <ActivityIndicator />
        <StatusBar barStyle="default" />
      </View>
    );
  }
}

export default AuthLoadingScreen;