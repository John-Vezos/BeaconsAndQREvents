import React from 'react';

import Beacons from 'react-native-beacons-manager';
import { DeviceEventEmitter, Alert, Text } from 'react-native';

class BeaconActions extends React.Component {

	constructor() {
    super();
    this.allBeacons = null;
  }

	async search() {

  	// Tells the library to detect iBeacons
		Beacons.detectIBeacons();


    // Start detecting all iBeacons in the nearby
		try {
		  await Beacons.startRangingBeaconsInRegion('REGION1');
		  console.log('Beacons ranging started succesfully!');
		} catch (err) {
		  console.log('Beacons ranging not started, error: ${error}');
		}

		// Print a log of the detected iBeacons (1 per second)
		DeviceEventEmitter.addListener('beaconsDidRange', (data) => {		  
		  this.addBeacons(data.beacons);
		})
	}

	addBeacons(newBeacons) {
		this.allBeacons = newBeacons;
	}

	

 	getAllBeacons() {
		return this.allBeacons;
	}



	async printBeacons() {
		
		if (this.allBeacons === null) return;

		await console.log('\n');
		for (let i=0; i < this.allBeacons.length; i++) {
			await console.log(i+'::'+JSON.stringify(this.allBeacons[i]));
			await console.log(":::::"+("instanceId" in this.allBeacons[i]));
		}
		await console.log('\n');
		

		await console.log("length => " + this.allBeacons.length);
		
	}

	async stopSearch() {

		await Beacons.stopRangingBeaconsInRegion('REGION1');

	}

}

const beaconAction = new BeaconActions();
export default beaconAction;