import React from 'react';
import { Button, View, Text, StyleSheet, TouchableOpacity, Alert, FlatList, ActivityIndicator } from 'react-native';
import { List, ListItem } from "react-native-elements";
import { BleManager } from 'react-native-ble-plx';
import permissionBLE from './../../services/permissionForBluetoothLowEnergy';
import enableGPS from './../../services/GPSEnabler';
import beaconAction from './../../services/BeaconActions';
import localDatabase from './../../localDatabase/LocalDatabaseManager';
import request from './../../services/requests';
import gpsLocation from './../../services/geolocation';
//import syncLocaldbWithServerdb from './../../tasks/synchronizationLocalWithServerDatabase';


import { Collapse, CollapseHeader, CollapseBody } from "accordion-collapse-react-native";


  //-------------------------- Bluetooth ----------------------------------------------------
  //								src/services/
  //														/*permissionForBluetoothLowEnergy.js
  //														/*BeaconActions.js
  

	//-------------------------- GPS - GPS ----------------------------------------------------
	//								src/services/
	//														/*GPSEnabler.js





class BeaconScan extends React.Component {

	constructor(props) {
    super(props);

    this.textAllBeacons = (<Text> Something went wrong! </Text>);

    this.state = {
    	toggle:false,
    	allBeacons : [],
    	record:null,
    	//syncTriggered:false,
      loading: false
    }

    // dropTable#
    /**
    localDatabase.dropTable("Events");
 		localDatabase.createTableEvents();
 		**/
  }
	

  static navigationOptions = ({ navigation }) => ({
    title: `BeaconScan ${navigation.state.params.title}!`,
  });


  async _onPress() {
  	const newState = !this.state.toggle;
  	this.setState({ toggle:newState })
  	if (this.state.toggle) {
  		beaconAction.search();
  		this.setState({ allBeacons : [] });
  	} else {

      this.setState({loading : true });

  		beaconAction.stopSearch();
  		//beaconAction.printBeacons();

  		this.textAllBeacons = await beaconAction.getAllBeacons();

  		this.setState({ allBeacons : this.textAllBeacons });

      setTimeout( () => {
        this.setState({loading : false });
      }, 3000);
  		
  	}
  }

  

  FlatListItemSeparator = () => <View style={styles.line} />;


  renderItem = data =>
  	<View>
  		<Collapse>
	      <CollapseHeader>
	        <ListItem
	        	containerStyle={{ borderBottomColor: 'black', borderWidth: 0.5, borderRadius: 3 }}
			      roundAvatar
			      title={data.item.protocol}
	        />
	      </CollapseHeader>
	      <CollapseBody>

				  <TouchableOpacity
				    style={[styles.list, data.item.selectedClass]}      
				    onPress={ () => this.onSendBeacon(data.item) }
				  >
					  <ListItem
					  	containerStyle={{ backgroundColor: '#E8E8E8' }}
				      title={ "\tuuid:***"+(data.item.uuid).substring((data.item.uuid).length - 3)+
			      					"\n\tdistance:"+(data.item.distance).toPrecision(4)+
			      					"\n\trssi:"+data.item.rssi
			      				}
				    />
					</TouchableOpacity>
				</CollapseBody>
			</Collapse>
		</View>


 	render() {
 		const {toggle} = this.state;
 		const textValue = toggle ? "Start Scan" : "Stop Scan";
 		const buttonColor = toggle ? "blue" : "red";
 		
 		let i=0;
 		
 		
    return (
    	<View style={ styles.container } >
    		<View style={{flexDirection:'row', marginTop:'10%'}} >
    			<FlatList
				    data={this.state.allBeacons}
				    ItemSeparatorComponent={this.FlatListItemSeparator}
				    renderItem={item => this.renderItem(item)}
				    keyExtractor={item => (i++).toString()}
				    extraData={this.state}
				   />
    		</View>
	      <View style={{flexDirection:'row'}} >
	      	<TouchableOpacity
	      		onPress={ () => this._onPress() }
	      		style={{backgroundColor:buttonColor, justifyContent:'center', borderColor:'white', borderWidth:1, borederRadius: 12, color: 'red', fontSize: 24, fontWeight: 'bold', overflow: 'hidden', padding: 12, textAlign: 'center'}}>
	      		<Text style={{color:"white", textAlign:'center', fontSize:16}}>{textValue}</Text>
	      	</TouchableOpacity>
	      </View>
        <View>
          <Text> { this.state.record !== null ? 'Success: ' + this.state.record[0].data +' '+this.state.record[0].id +this.state.record[0].created_at + ' ' + this.state.record[0].sync : 'Waiting...' } </Text>
          { this.state.loading ? <ActivityIndicator size="small" color="#0000ff" /> : null }
        </View>
      </View>

    );
    
  }
  

  

  componentWillMount() {  
    
  }

  async onSendBeacon(item) {

  	let pos = null;
  	let datas = null;
  	
  	try {
  		pos = await gpsLocation.getCurrPosition();	
  	} catch (e) {
  		console.log(e);
  	}

  	try {
  		datas = await request.createData(item, pos);
  	} catch(e) {
  		console.log('Catch -->');
  		console.log(e);
  		console.log('Error: data could not initialized!');
  		return ;
  	}
 
    try {
      const users = await localDatabase.read('*', 'User', '', []);
      if (users === 0) return;
      const curr_user = users[0];

      datas.localData.unshift(curr_user.name);

    } catch (e) {
      console.log('onSendBeacon BEACON read User failed');
      console.log(e);
    }

  	try {
  		localDatabase.create('Events', 'username, data, eventType'+datas.positionValues, '?, ?, ?'+datas.posQuestionMarks, datas.localData);
  	} catch(e) {
  		console.log("BeaconScan.js::::"+'Something went wrong with create localDatabase!');
  		return ;
  	}

  	const EventLength = await localDatabase.getTableSize('Events');
  	if (EventLength === null) console.log("BeaconScan.js::::"+'Something went wrong with the size of localdatabase');
  	else request.sendRequest(datas.data, 'create_'+item.protocol, EventLength);

     
    

  }

  async print() {
    let yourAskedEntitys = null;
  	try {
  		yourAskedEntitys = await localDatabase.read('*', 'Events', '', []);
  	} catch(e) {
  		console.log("BeaconScan.js::::"+'Read failed to complete properly');
  	}

    if (yourAskedEntitys === 0) return;
    this.setState({ record : yourAskedEntitys });

  	const len = await localDatabase.getTableSize('Events');
  	console.log("BeaconScan.js::::"+"TableSize === "+len);
  }

  componentDidMount() {
  	console.log("BeaconScan.js::::"+"Welcome my friend, let's play with your fortune. let the game begins!");

  	this.print();
  	

  	permissionBLE.requestLocationPermission();
  	permissionBLE.setOtherNavigation(this.props.navigation);
    
    new Promise(function(resolve, reject) {

		  setTimeout(() => resolve(2), 1000); 

		}).then(function(result) { 

		  permissionBLE.checkAndOpenBluetooth();
		  return "";

		}).then(function(result) {

		  enableGPS.forAndroid();
		  return "";
		});
  }
  
	componentWillUnmount() {
		this.tiggeredTask = null;
		permissionBLE.destroyBluetoothOnStateChange();
		
		beaconAction.stopSearch();

		// User was sending a request when he left from this screen.
		clearTimeout(this.timerForRequestResponse);

		const currStateGPS = enableGPS.getStateGPS();
		if (currStateGPS === "already-enabled" || currStateGPS  === "enabled" ) {
			Alert.alert(
	      'Alert:GPS!',
	      "Don't forget to close your GPS!",
	      [
	        { text: 'OK' },
	      ],
	      { cancelable: true },
	    );
		}

	}

}




const styles = StyleSheet.create({
	container: {
		flex: 1,
		flexDirection:'column',
		justifyContent:'center',
		alignItems:'center',
		backgroundColor: 'whitesmoke',
		marginBottom:'8%'
	},
});

export default BeaconScan;