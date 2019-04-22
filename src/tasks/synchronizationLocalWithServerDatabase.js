import React from 'react';
import localDatabase from './../localDatabase/LocalDatabaseManager';
import request from './../services/requests';

import { DeviceEventEmitter, NativeAppEventEmitter, Platform } from 'react-native';

import BackgroundTimer from 'react-native-background-timer';

import NetInfo from "@react-native-community/netinfo";

class synchronizationLocalWithServerDatabase extends React.Component {

  constructor(props) {
    super(props);
  }

	async taskApplication(other, curr_user) {

		let flag = false;
		this.other = other;
		this.busy = false;
    this.curr_username = curr_user.name;
    this.curr_user = curr_user;

		this.listener = async connectionInfo => {
		  console.log("Connection type", connectionInfo.type);
		  console.log("Connection effective type", connectionInfo.effectiveType);
		  
		  if (flag === false && connectionInfo.type !== 'none' && connectionInfo.type !== 'unknown') {
		  	flag = true;
		  	setTimeout( () => {
		  		flag = false;
		  	}, 3000);
		  
		  	this.countTriesForTheSameData = 0;

        try {
          await this.getNewToken();
        } catch(e) {
          console.log('GetNewToken failed in taskApplication');
          console.log(e);
        }
        console.log('::::::::::::::::::::::::::::::::::::::listener');
		  	this.spamFunaction();
		  	
		  } else BackgroundTimer.stopBackgroundTimer();
		};

		const subscription = NetInfo.addEventListener('connectionChange', this.listener);

    console.log('Welcome to spam function!');    
  }


  async initializeForSpamFunction() {

  		this.countTriesForTheSameData = 1;

      try {
        await this.getNewToken();
      } catch(e) {
        console.log('GetNewToken failed in taskApplication');
        console.log(e);
      }

	  	BackgroundTimer.runBackgroundTimer( async () => {
        if (this.curr_username === null) {
          console.log("edw akoma omws:::::::::::::::::::::::::::::::::::initializeForSpamFunction");
          BackgroundTimer.stopBackgroundTimer();
          return;
        }
        console.log('::::::::::::::::::::::::::::::::::::::initializeForSpamFunction');
    		this.spamFunaction();
			}, 30*1000);
  }
  

  async spamFunaction() {

  	if (this.busy === false) this.busy = true;
  	else return;

  	let asyncEntitys = null;
  	let dataEvent = null;

  	BackgroundTimer.stopBackgroundTimer();
  	this.other.setState({ spinner: true });

  	try {
  		asyncEntitys = await localDatabase.read('*', 'Events', 'where sync=? AND username=?', [0, this.curr_username]);
  	} catch(e) {
  		this.other.setState({ spinner: false });
  		this.busy = false;
  		console.log('All entitys is sync!');
      BackgroundTimer.stopBackgroundTimer();
  		return ;
  	}
    
    if (asyncEntitys.length === 0) console.log('All entitys is sync!');
    else {
    	console.log('I found ' + asyncEntitys.length + ' async entity(s)');
	    
	    

	    let result = await this.sendAsyncData(asyncEntitys);
	 
	 		if (this.countTriesForTheSameData === 1) {
        try {
          await this.getNewToken();
        } catch(e) {
          console.log('GetNewToken failed in spamFunaction');
          console.log(e);
        }
      }
	    

	    if (this.countTriesForTheSameData < 3) {
	    	BackgroundTimer.runBackgroundTimer( async () => { 
          if (this.curr_username === null) {
            console.log("edw akoma omws:::::::::::::::::::::::::::::::::::spamFunaction");
            BackgroundTimer.stopBackgroundTimer();
            return;
          }
	    		this.other.setState({ spinner: true });
          console.log('::::::::::::::::::::::::::::::::::::::spamFunaction');
					//code that will be called every 30seconds
					this.spamFunaction();
				}, 30*1000);
	    } else {
	    	BackgroundTimer.stopBackgroundTimer();
	    	console.log('Your tries complete');
	    }
	    
    }
    this.other.setState({ spinner: false });
    this.busy = false;

  }

  getNewToken = () => new Promise(async (resolve, reject) => {

    try {
      const response = await request.sendUserRequest(this.curr_user.refreshToken, 'refresh');

      localDatabase.update('User', 'accessToken=?', 'name=?', [response, this.curr_username]);
      resolve();

    } catch(e) {
      console.log("Failare to getNewToken");
      console.log(e);
      reject();
    }
  })

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
    this.countTriesForTheSameData++;

    resolve();
	})


  stopAllTasks = () => new Promise((resolve, reject) => {
   
    BackgroundTimer.stopBackgroundTimer();

    this.countTriesForTheSameData = 0;

    this.busy = false;
    
    
    this.curr_username = null;
    this.curr_user = null;

    NetInfo.isConnected.removeEventListener(
      'connectionChange',
      this.listener
    );
    this.listener = null;
    resolve();
  })


}

const syncLocaldbWithServerdb = new synchronizationLocalWithServerDatabase();
export default syncLocaldbWithServerdb;