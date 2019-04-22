import React from 'react';
import { Button, View, Text, StyleSheet, TouchableOpacity, Alert, FlatList, ActivityIndicator } from 'react-native';
import { List, ListItem } from "react-native-elements";

import { Collapse, CollapseHeader, CollapseBody } from "accordion-collapse-react-native";

import localDatabase from './../localDatabase/LocalDatabaseManager';
import request from './../services/requests';

class BeaconScan extends React.Component {


	constructor(props) {
    super(props);

    

    this.state = {
    	events:null,
      loading: false
    }

  }

  static navigationOptions = ({ navigation }) => ({
    title: `History, ${navigation.state.params.title}!`,
  });




  FlatListItemSeparator = () => <View style={styles.line} />;


  renderItem = data =>
  	<View>
  		<Collapse>
	      <CollapseHeader>
	        <ListItem
	        	containerStyle={{ borderBottomColor: 'black', borderWidth: 0.5, borderRadius: 3 }}
			      roundAvatar
			      title={data.item.eventType}
	        />
	      </CollapseHeader>
	      <CollapseBody>

				  <TouchableOpacity
				    style={[styles.list, data.item.selectedClass]}      
				    onPress={ () => console.log(data.item) }
				  >
					  <ListItem
					  	containerStyle={{ backgroundColor: '#E8E8E8' }}
				      title={ "\tuuid:"+(data.item.data) }
				    />
					</TouchableOpacity>
				</CollapseBody>
			</Collapse>
		</View>





	render() { 

		let i=0;	

    return (
    	<View style={ styles.container } >
    		<View style={{flexDirection:'row', marginTop:'3%'}} >
    			<FlatList
				    data={this.state.events}
				    ItemSeparatorComponent={this.FlatListItemSeparator}
				    renderItem={item => this.renderItem(item)}
				    keyExtractor={item => (i++).toString()}
				    extraData={this.state}
				   />
    		</View>
      </View>

    );
    
  }


  componentDidMount() {

  	this.print();

  }

  async print() {
    let yourAskedEntitys = null;
    //console.log(this.props.navigation.state.params.title);
  	try {
  		yourAskedEntitys = await localDatabase.read('*', 'Events', 'WHERE username=?', [this.props.navigation.state.params.title]);
  	} catch(e) {
  		console.log("History.js::::"+'Read failed to complete properly');
  	}

    if (yourAskedEntitys === 0) return;
    this.setState({ events : yourAskedEntitys });
  }

}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		flexDirection:'column',
		justifyContent:'center',
		alignItems:'center',
		backgroundColor: 'whitesmoke',
	},
});

export default BeaconScan;