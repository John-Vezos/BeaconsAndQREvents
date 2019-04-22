import React from 'react';
import { openDatabase } from 'react-native-sqlite-storage';


let SQLite = require('react-native-sqlite-storage');


class LocalDatabaseManager extends React.Component {

	constructor() {
		super();
		this.praktikh_db = null;
    
		this.createTableEvents();
    this.createTableUser();
	}

  createTableUser() {
    this.praktikh_db.transaction((tx) => {
      tx.executeSql ('CREATE TABLE IF NOT EXISTS User'
                      +'( '
                        + 'name TEXT UNIQUE, '
                        + 'accessToken TEXT, '
                        + 'refreshToken TEXT, '
                        + 'created_at DATETIME DEFAULT CURRENT_TIMESTAMP '
                      + '); ', []
                    );
    }, (error) => { console.log("createTableUser::::"+error) }, () => { console.log("Table user has been created!") });
  }

	createTableEvents() {
		this.praktikh_db = SQLite.openDatabase({name: 'praktikh_db.db', createFromLocation : 1 }, this.openCB, this.errorCB);
   	this.praktikh_db.transaction((tx) => {
     	tx.executeSql ('CREATE TABLE IF NOT EXISTS Events'
     									+'( '
								    		+ 'id INTEGER PRIMARY KEY AUTOINCREMENT,'
								     		+ 'eventType TEXT, '
								     		+ 'data TEXT, '
								     		+ 'speed INTEGER, '
								    		+ 'heading INTEGER, '
								     		+ 'accuracy FLOAT, '
								     		+ 'altitude FLOAT, '
								     		+ 'longitude FLOAT, '
								     		+ 'latitude FLOAT, '
                        + 'username TEXT, ' 
                        + 'sync INTEGER DEFAULT 0, '
								     		+ 'created_at DATETIME DEFAULT CURRENT_TIMESTAMP '
								    	+ '); ', []
									  );
    }, (error) => { console.log("createTableEvents::::"+error) }, () => { console.log("Table has been created!") });
	}


	errorCB(err) {
    console.log("SQL Error: " + err);
  }

  successCB() {
    console.log("SQL executed fine");
  }

  openCB() {
    console.log("Database OPENED");
  }


  getDB() {
  	this.praktikh_db;
  }

  async getTableSize(tableName) {
    try {
      let yourAskedEntitys = await this.read('*', tableName, '', []);
      if (yourAskedEntitys === null) this.EventsSize = 0;
      else this.EventsSize = yourAskedEntitys.length;
    } catch(e) {
      console.log("getTableSize::::"+'Probably, the table has not initialized yet '+ e);
      return null;
    }
    if (this.EventsSize === null) {
      console.log("getTableSize::::"+'Something went wrong with the size of table!');
      return null;
    }
    return this.EventsSize;
  }

  // CRUD -> Create, Read, Update, Delete-Destroy

  read = (characteristics, table, where, values) => new Promise((resolve, reject) => {
    let allEntitys = [];
    this.praktikh_db.transaction((tx) => {
      tx.executeSql(`SELECT ${characteristics} FROM ${table} ${where}`, values, (tx, results) => {
        console.log("read::::"+"Query completed");
        
        if (results === null || results.rows === null) reject(null);

        // Get rows with Web SQL Database spec compliance.
        var len = results.rows.length;

        for (let i = 0; i < len; i++) {
          let row = results.rows.item(i);
          console.log(results.rows.item(i));
          allEntitys.push(row);
        }
        if (allEntitys.length === 0) resolve(0);
        else resolve(allEntitys);
      });
    });   
  })
  
  create = (table, characteristics, questionMarks, values) => new Promise((resolve, reject) =>{
  	this.praktikh_db.transaction((tx) => {
  		tx.executeSql(`INSERT INTO ${table} (${characteristics}) VALUES (${questionMarks})`, values, () => this.queryOnSucces('Insert in '+table, (this.EventsSize++)), () => this.queryOnFail('Insert in '+ table));
    });
    resolve();
  })


  update(table, characteristics, whereCharacteristics, values) {
  	this.praktikh_db.transaction((tx) => {
	  	//'UPDATE table_user set user_name=?, user_contact=? , user_address=? where user_id=?', [user_name, user_contact, user_address, input_user_id]
	  	tx.executeSql(`UPDATE ${table} set ${characteristics} where ${whereCharacteristics}`, values, () => this.queryOnSucces('Update in '+table, 0), () => this.queryOnFail('Update in '+table));
  	});
  }

  delete = (table, whereCharacteristics, values)  => new Promise((resolve, reject) => {
  	this.praktikh_db.transaction((tx) => {
  		//'DELETE FROM  table_user where user_id=?', [input_user_id]
  		tx.executeSql(`DELETE FROM  ${table} where ${whereCharacteristics}`, values, () => this.queryOnSucces('Delete in '+table, (this.EventsSize--)), () => this.queryOnFail('Delete in '+table));
  	});
    resolve();
  })

  dropTable(table) {
  	this.praktikh_db.transaction((tx) => {
			tx.executeSql(`DROP TABLE IF EXISTS ${table}`, []);
		});
	}

	queryOnSucces(actionWithTableString, nothing) {
		console.log("LocalDatabaseManager.js::::"+actionWithTableString+' in localDatabase::Completed');
	}
	queryOnFail(actionWithTableString) {
		console.log("LocalDatabaseManager.js::::"+actionWithTableString+' in localDatabase::Failed')
	}

}

const localDatabase = new LocalDatabaseManager();
export default localDatabase;

