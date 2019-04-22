import React, { Component } from 'react';
import { StyleSheet, Text, View, StatusBar, TouchableOpacity, Alert } from 'react-native';
import Form from '../components/Form';
import request from './../services/requests';
import localDatabase from './../localDatabase/LocalDatabaseManager';


export default class Login extends React.Component {
  
  constructor() {
    super();
    this.curr_username = '';
    this.curr_password = '';
  }

  static navigationOptions = {
    title: 'Login'
  };


	render() {
		return (
			<View style={styles.container}>
				<Form 
          onRef={ref => (this.parentReference = ref)}
          parentReference = {this.parentMethod.bind(this)} 
          type="Login"
        />
				<View style={styles.signupTextCont}>
					<Text style={styles.signupText}>Don't have an account yet?</Text>
					<TouchableOpacity onPress={ () => this.props.navigation.navigate('Register') }><Text style={styles.signupButton}>Signup</Text></TouchableOpacity>
				</View>
			</View>	
		)
	}

  async parentMethod(data) {
    this.curr_username = data.username;
    this.curr_password = data.password;

    if (data.username === '' || data.password === '') {
      Alert.alert(
        'Alert:Login!',
        "Username and password is required fields!",
        [
          { text: 'OK' },
        ],
        { cancelable: true },
      );
      return;
    }

    let previous_user = '';
    try {
      const UserLength = await localDatabase.getTableSize('User');
      if (UserLength != null) {
        try {
          previous_user = await localDatabase.read('*', 'User', '', []);
          if (previous_user != 0) previous_user = previous_user[0];
        } catch(e) {
          console.log('Probably User size === 0');
          console.log(e);
        }
        
      }
    } catch(e) {
      console.log(e);
      console.log('Get size of Table User failed!');
    }


    try {
      const response = await request.sendUserRequest(data, "user_Login");
      tokens = JSON.parse(response);

      if (previous_user === '') localDatabase.create('User', 'name, accessToken, refreshToken', '?, ?, ?', [data.username, tokens.accessToken, tokens.refreshToken]);
      else localDatabase.update('User', 'name=?, accessToken=?, refreshToken=?', 'name=?', [data.username, tokens.accessToken, tokens.refreshToken, previous_user.name]);

      this.props.navigation.navigate('Home', { title: data.username });

    } catch(e) {
      console.log('The problems:\n\t 1. request failed!\n\t2.localDatabase.create or update\n\t3.Navigate to home failed!');
    } 

  }

}

const styles = StyleSheet.create({
  container : {
    backgroundColor:'#455a64',
    flex: 1,
    alignItems:'center',
    justifyContent :'center'
  },
  signupTextCont : {
  	flexGrow: 1,
    alignItems:'flex-end',
    justifyContent :'center',
    paddingVertical:16,
    flexDirection:'row'
  },
  signupText: {
  	color:'rgba(255,255,255,0.6)',
  	fontSize:16
  },
  signupButton: {
  	color:'#ffffff',
  	fontSize:16,
  	fontWeight:'500'
  }
});
