import React from 'react';
import {Platform, Linking} from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';

import localDatabase from './../../localDatabase/LocalDatabaseManager';
import request from './../../services/requests';
import gpsLocation from './../../services/geolocation';
//import syncLocaldbWithServerdb from './../../tasks/synchronizationLocalWithServerDatabase';


class QRScan extends React.Component {


  static navigationOptions = ({ navigation }) => ({
    title: `QRScan ${navigation.state.params.title}!`,
  });


 	render() {
    return (
      <QRCodeScanner
        onRead={this.onSuccess.bind(this)}
        reactivate = {true}
        reactivateTimeout = {5000}
      />
    );
  }

  state = {
    syncTriggered:false
  }

  async onSuccess(e) {
    console.log("FoundQR"+e.data);
    

    let pos = null;
    

    let data = null;
    let positionValues = '';
    let posQuestionMarks = '';
    let localData = [];
    let posValues = {};

    

    try {
      pos = await gpsLocation.getCurrPosition();  
    } catch (e) {
      console.log(e);
    }

    if (pos === null) console.log("createData::::"+"unFound pos");
    else {
      positionValues = ', speed, heading, accuracy, altitude, longitude, latitude';
      posQuestionMarks = ', ?, ?, ?, ?, ?, ?'
      localData.push(pos.speed, pos.heading, pos.accuracy, pos.altitude, pos.longitude, pos.latitude);
      posValues = { 'speed': pos.speed, 'heading': pos.heading, 'accuracy': pos.accuracy, 'altitude': pos.altitude, 'longitude': pos.longitude, 'latitude': pos.latitude };
      console.log("createData::::");
      console.log(pos);
    } 
 

    localData.unshift(e.data, 'QRScan');

    data = { 'QRData': e.data };
    data = Object.assign({}, data, posValues );

  
    try {
      const users = await localDatabase.read('*', 'User', '', []);
      if (users === 0) return;
      const curr_user = users[0];
      localData.unshift(curr_user.name);
    } catch (e) {
      console.log('onSucces QRScan read User failed');
      console.log(e);
    }


    try {
      localDatabase.create('Events', 'username, data, eventType'+positionValues, '?, ?, ?'+posQuestionMarks, localData);
    } catch(e) {
      console.log("BeaconScan.js::::"+'Something went wrong with create localDatabase!');
      return ;
    }

    const EventLength = await localDatabase.getTableSize('Events');
    if (EventLength === null) console.log("BeaconScan.js::::"+'Something went wrong with the size of localdatabase');
    else request.sendRequest(data, 'create_QRScan', EventLength);


    //syncLocaldbWithServerdb.initializeForSpamFunction();


    Linking
      .openURL(e.data)
      .catch(err => console.error('An error occured', err));
      
  }

}

export default QRScan;