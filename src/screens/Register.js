import React, { Component } from 'react';
import { StyleSheet, Text, View, StatusBar, TouchableOpacity, Alert } from 'react-native';
import Form from '../components/Form';
import request from './../services/requests';
import localDatabase from './../localDatabase/LocalDatabaseManager';


export default class Register extends React.Component {

  constructor() {
    super();
    
    
    
  }

  static navigationOptions = {
    title: 'Register'
  };


	render() {
		return (
			<View style={styles.container}>
        <Form  
          onRef={ref => (this.parentReference = ref)}
          parentReference = {this.parentMethod.bind(this)} 
          type="Signup"/>
				<View style={styles.signupTextCont}>
					<Text style={styles.signupText}>Already have an account?</Text>
					<TouchableOpacity onPress={ () => this.props.navigation.navigate('Login') }><Text style={styles.signupButton}> Sign in</Text></TouchableOpacity>
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

    try {
      await request.sendUserRequest(data, 'user_Register');
      this.props.navigation.navigate('Login');
    } catch(e) {
      console.log(e);
      Alert.alert(
        'Alert:Login!',
        "Username exist, try again with different username!",
        [
          { text: 'OK' },
        ],
        { cancelable: true },
      );
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
