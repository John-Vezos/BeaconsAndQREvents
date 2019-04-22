import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';

class LoadingIcon extends React.Component {


  render() {
  	const {toggle} = this.state;
  	const printLoadingIcon = toggle ? <ActivityIndicator size="small" color="#0000ff" /> : null;

  	return (
  		printLoadingIcon
    );
  }
}


export default LoadingIcon; // Don’t forget to use export default!