import React from 'react';
import Geolocation from 'react-native-geolocation-service';



class geolocation extends React.Component {

	getCurrPosition = () => new Promise((resolve, reject) => {

		Geolocation.getCurrentPosition(
	    (position) => {
	    		resolve(position.coords);
	        console.log(position.coords);
	    },
	    (error) => {
	        // See error code charts below.
	        console.log("getCurrPosition::::"+error.code, error.message);
	        reject(error);
	    },
	    { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
	  );
	})
	
}

const gpsLocation = new geolocation();
export default gpsLocation;