import React, { Component } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native';




export default class Logo extends Component<{}> {

  constructor(props) {
     super(props)
     this.state = {
       username: '',
       password: ''
     }
  }


	render() {
		return (
			<View style={styles.container}>
          <TextInput style={styles.inputBox} 
              underlineColorAndroid='rgba(0,0,0,0)' 
              placeholder="Email"
              placeholderTextColor = "#ffffff"
              selectionColor="#fff"
              keyboardType="email-address"
              onSubmitEditing={ () => this.password.focus() }
              onChangeText={(username) => this.setState({ username: username }) }
              />
          <TextInput style={styles.inputBox} 
              underlineColorAndroid='rgba(0,0,0,0)' 
              placeholder="Password"
              secureTextEntry={true}
              placeholderTextColor = "#ffffff"
              ref={ (input) => this.password = input }
              onChangeText={(password) => this.setState({ password: password })}
              />  
          <TouchableOpacity onPress= { () => this._onSubmit() } style={styles.button}>
              <Text style={styles.buttonText}> {this.props.type} </Text>
          </TouchableOpacity>     
  		</View>
			)
	}


  _onSubmit() {
    console.log(this.props.type);
    this.props.parentReference(this.state);
  }


}



const styles = StyleSheet.create({
  container : {
    flexGrow: 1,
    justifyContent:'center',
    alignItems: 'center'
  },
  inputBox: {
    width:300,
    backgroundColor:'rgba(255, 255,255,0.2)',
    borderRadius: 25,
    paddingHorizontal:16,
    fontSize:16,
    color:'#ffffff',
    marginVertical: 10
  },
  button: {
    width:300,
    backgroundColor:'#1c313a',
     borderRadius: 25,
      marginVertical: 10,
      paddingVertical: 13
  },
  buttonText: {
    fontSize:16,
    fontWeight:'500',
    color:'#ffffff',
    textAlign:'center'
  }
  
});