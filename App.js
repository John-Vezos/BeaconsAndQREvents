/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from "react";
import Routes from "./Routes";
import localDatabase from './src/localDatabase/LocalDatabaseManager';

class App extends React.Component {

	constructor(props) {
    super(props);
    /*
    localDatabase.dropTable('Events');
	  localDatabase.dropTable('User');
	  localDatabase.createTableEvents();
	  localDatabase.createTableUser();
	  */
  }


	render() {
		return (
			<Routes/>
		);
	}

}

	

export default App;