import React from 'react';
import localDatabase from './../localDatabase/LocalDatabaseManager';
import request from './../services/requests';

import BackgroundTimer from 'react-native-background-timer';



import Home from './../screens/Home';

class syncDatabases extends React.Component {

	constructor(props) {
		super(props);
		
		this.curr_user = null;
		this.asyncEntitys = null;
		this.home = null;
	}


	setCurrUser( currUser ) {
		this.curr_user = currUser;
	}

	setThisForSpinner( other ) {
		this.home = other;
	}

	async basicTask() {

		try {
			this.asyncEntitys = await localDatabase.read('*', 'Events', 'WHERE sync=? AND username=?', [0, this.curr_user.name]);
		} catch(e) {
			console.log('Read async entitys from Event table failed!');
			return;
		}

		if (this.asyncEntitys === null || this.asyncEntitys === 0) {
			console.log('All entitys for user ==== ' + this.curr_user.name + 'is sync!');
			return;
		}

		this.home.setState({ spinner: true });
		try {
			await this.sendAsyncData(this.asyncEntitys);
		} catch(e) {
			console.log('send async data failed!');
		}
		this.home.setState({ spinner: false});

	}

	sendAsyncData = (asyncEntitys) => new Promise((resolve, reject) => {

    for (let i=0; i < asyncEntitys.length; i++) {
    	
    	let tokens = asyncEntitys[i].data.split('|');

    	if (tokens.length === 1) dataEvent = { 'QRData': asyncEntitys[i].data };
    	else if (tokens.length === 2) dataEvent = { 'uuid': tokens[0], 'distance': tokens[1] };
    	else dataEvent = { 'uuid': tokens[0], 'major': tokens[1], 'minor': tokens[2] };
    	let data = { 'uuid': asyncEntitys[i].uuid, 'distance': asyncEntitys[i].distance, 'speed': asyncEntitys[i].speed, 'heading': asyncEntitys[i].heading, 'accuracy': asyncEntitys[i].accuracy, 'altitude': asyncEntitys[i].altitude, 'longitude': asyncEntitys[i].longitude, 'latitude': asyncEntitys[i].latitude };
    	data = Object.assign({}, data, dataEvent );
    	request.sendRequest(data, 'create_'+asyncEntitys[i].eventType, asyncEntitys[i].id);	
    }

    resolve();
	})



	getNewToken = () => new Promise( async (resolve, reject) => {

    try {
      const response = await request.sendUserRequest(this.curr_user.refreshToken, 'refresh');

      localDatabase.update('User', 'accessToken=?', 'name=?', [response, this.curr_user.name]);
      resolve();

    } catch(e) {
      console.log("Get new token Failed!");
      reject();
    }
  })



}
const sync = new syncDatabases();
export default sync;