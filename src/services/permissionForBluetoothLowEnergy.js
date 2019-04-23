import React from 'react';
import { PermissionsAndroid, Alert } from 'react-native';
import { BleManager } from 'react-native-ble-plx';
import beaconAction from './BeaconActions';

class permissionForBluetoothLowEnergy extends React.Component {

//Bluetooth Low Energy require permission for your location.

	constructor() {
    super();
    this.manager = new BleManager();
    this.bluetoothOnStateChange = null;
    this.nav = null;
  }


	async requestLocationPermission() {
	  try {
	    const granted = await PermissionsAndroid.request(
	      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
	      {
	        title: 'Permission',
	        message:
	          'This action needs access to your GPS Location ',
	        buttonNegative: 'Cancel',
	        buttonPositive: 'OK'
	      }
	    )
	    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
	      
	    } else {
	    	
	    }
	  } catch (err) {
	    alert(err+"\nCatch");
	  }
	}

	async checkAndOpenBluetooth() {
		this.bluetoothOnStateChange = await this.manager.onStateChange((state) => {
	      if (state === 'PoweredOff') {
	       	this.setAlertForBeaconScan();
	      } else {
	      	beaconAction.search();
	      }
	    }, true);  

	}


	async setAlertForBeaconScan() {

		await Alert.alert(
      'Alert!',
      'This page require your bluetooth, press Agree to continue\nDecline to go Home page!',
      [
        {
          text: 'Decline, BACK',
          onPress: () => this.nav.navigate('Home'),
          style: 'cancel',
        },
        {text: 'Agree', onPress: async () => await this.manager.enable() },
      ],
      {cancelable: false},
    );

  }



  destroyBluetoothOnStateChange() {
  	this.bluetoothOnStateChange.remove();
  	this.manager.disable();
  }

  setOtherNavigation(other) {
  	this.nav = other;
  }

}


const permissionBLE = new permissionForBluetoothLowEnergy();
export default permissionBLE;