function getPassReset(db, username){

	let querypromise = new Promise(function(resolve, reject){
		db.query(`SELECT * FROM passresets WHERE username = ?`, [username], (error, result, fields) => {
	    	if (error) {
	      		console.error('An error occurred while executing the query');
	      		reject(error);
	    	}

	    	resolve(result);

		});

	});
	return querypromise;
}

function addPassReset(db, exp_time, username){

	let querypromise = new Promise(function(resolve, reject){
		db.query(`INSERT INTO passresets (exp_time, username) 
		VALUES (?, ?)`, [exp_time, username], (error, result, fields) => {
	    	if (error) {
	      		console.error('An error occurred while executing the query');
	      		reject(error);
	    	}

	    	resolve(result);

		});

	});
	return querypromise;
}

function getCurrentTimestamp(db){

	let querypromise = new Promise(function(resolve, reject){
		db.query(`SELECT CURRENT_TIMESTAMP()curr`, (error, result, fields) => {
	    	if (error) {
	      		console.error('An error occurred while executing the query');
	      		reject(error);
	    	}

	    	resolve(result);

		});

	});
	return querypromise;
}

function returnTimeDiff(db, new_time, old_time){

	let querypromise = new Promise(function(resolve, reject){
		db.query(`SELECT TIME_TO_SEC(TIMEDIFF(?, ?))diff`, [new_time, old_time], (error, result, fields) => {
	    	if (error) {
	      		console.error('An error occurred while executing the query');
	      		reject(error);
	    	}

	    	resolve(result);

		});

	});
	return querypromise;
}

function deletePreviousLink(db, username){

	let querypromise = new Promise(function(resolve, reject){
		db.query(`DELETE FROM passresets WHERE username = ?`, [username], (error, result, fields) => {
	    	if (error) {
	      		console.error('An error occurred while executing the query');
	      		reject(error);
	    	}
	    	resolve(result);

		});

	});
	return querypromise;
}



module.exports = {
	getPassReset,
	addPassReset,
	getCurrentTimestamp,
	returnTimeDiff,
	deletePreviousLink
};