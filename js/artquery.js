function getArtistInfo(db, artist_name){

	let querypromise = new Promise(function(resolve, reject){
		db.query(`SELECT id, crew, country, info, fb, sc, bc, beat, insta, img_url, is_label FROM artists WHERE artist_name = ?`, [artist_name], (error, result, fields) => {
	    	if (error) {
	      		console.error('An error occurred while executing the query');
	      		reject(error);
	    	}

	    	resolve(result);

		});

	});

	return querypromise;

}

function getAllArtists(db){

	let querypromise = new Promise(function(resolve, reject){
		db.query(`SELECT artist_name, img_url FROM artists`, (error, result, fields) => {
	    	if (error) {
	      		console.error('An error occurred while executing the query');
	      		reject(error);
	    	}

	    	resolve(result);

		});

	});

	return querypromise;

}

function getArtistNameByID(db, id){

	let querypromise = new Promise(function(resolve, reject){
		db.query(`SELECT artist_name FROM artists WHERE id = ?`, [id], (error, result, fields) => {
	    	if (error) {
	      		console.error('An error occurred while executing the query');
	      		reject(error);
	    	}

	    	resolve(result);

		});

	});

	return querypromise;

}

function getAllArtistsAthroughD(db){

	let querypromise = new Promise(function(resolve, reject){
		db.query(`SELECT artist_name, img_url FROM artists 
		WHERE artist_name >= "0" and artist_name < "E" 
		ORDER BY artist_name`, (error, result, fields) => {
	    	if (error) {
	      		console.error('An error occurred while executing the query');
	      		reject(error);
	    	}

	    	resolve(result);

		});

	});

	return querypromise;

}

function getAllArtistsEthroughI(db){

	let querypromise = new Promise(function(resolve, reject){
		db.query(`SELECT artist_name, img_url FROM artists 
		WHERE artist_name >= "E" and artist_name < "J" 
		ORDER BY artist_name`, (error, result, fields) => {
	    	if (error) {
	      		console.error('An error occurred while executing the query');
	      		reject(error);
	    	}

	    	resolve(result);

		});

	});

	return querypromise;

}

function getAllArtistsJthroughO(db){

	let querypromise = new Promise(function(resolve, reject){
		db.query(`SELECT artist_name, img_url FROM artists 
		WHERE artist_name >= "J" and artist_name < "P" 
		ORDER BY artist_name`, (error, result, fields) => {
	    	if (error) {
	      		console.error('An error occurred while executing the query');
	      		reject(error);
	    	}

	    	resolve(result);

		});

	});

	return querypromise;

}

function getAllArtistsPthroughT(db){

	let querypromise = new Promise(function(resolve, reject){
		db.query(`SELECT artist_name, img_url FROM artists 
		WHERE artist_name >= "P" and artist_name < "U" 
		ORDER BY artist_name`, (error, result, fields) => {
	    	if (error) {
	      		console.error('An error occurred while executing the query');
	      		reject(error);
	    	}

	    	resolve(result);

		});

	});

	return querypromise;

}

function getAllArtistsUthroughZ(db){

	let querypromise = new Promise(function(resolve, reject){
		db.query(`SELECT artist_name, img_url FROM artists 
		WHERE artist_name >= "U" 
		ORDER BY artist_name`, (error, result, fields) => {
	    	if (error) {
	      		console.error('An error occurred while executing the query');
	      		reject(error);
	    	}

	    	resolve(result);

		});

	});

	return querypromise;

}

function searchArtists(db, search_results){

	let querypromise = new Promise(function(resolve, reject){
		db.query(`SELECT artist_name, img_url FROM artists 
		WHERE artist_name LIKE ?`, [search_results], (error, result, fields) => {
	    	if (error) {
	      		console.error('An error occurred while executing the query');
	      		reject(error);
	    	}

	    	resolve(result);

		});

	});

	return querypromise;

}

function searchArtistsByCrew(db, search_results){

	let querypromise = new Promise(function(resolve, reject){
		db.query(`SELECT artist_name, img_url FROM artists 
		WHERE crew LIKE ?`, [search_results], (error, result, fields) => {
	    	if (error) {
	      		console.error('An error occurred while executing the query');
	      		reject(error);
	    	}

	    	resolve(result);

		});

	});

	return querypromise;

}

function addArtist(db, artist_name, crew, country, info, face, sound, band, beat, insta, img){

	let querypromise = new Promise(function(resolve, reject){
		db.query(`INSERT INTO artists (artist_name, crew, country, info, fb, sc, bc, beat, insta, img_url) 
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [artist_name, crew, country, info, face, sound, band, beat, insta, img], (error, result, fields) => {
	    	if (error) {
	      		console.error('An error occurred while executing the query');
	      		reject(error);
	    	}

	    	resolve(result);

		});


	});

	return querypromise;
}

function deleteArtist(db, artist_name){

	let querypromise = new Promise(function(resolve, reject){
		db.query(`DELETE FROM artists WHERE artist_name = ? LIMIT 1`, [artist_name], (error, result, fields) => {
	    	if (error) {
	      		console.error('An error occurred while executing the query');
	      		reject(error);
	    	}

	    	resolve(result);

		});

	});

	return querypromise;
}

function editImg(db, artist_id, img_url){

	let querypromise = new Promise(function(resolve, reject){
		db.query(`UPDATE artists SET img_url = ? WHERE id = ?`, [img_url, artist_id], (error, result, fields) => {
	    	if (error) {
	      		console.error('An error occurred while executing the query');
	      		reject(error);
	    	}

	    	resolve(result);

		});

	});

	return querypromise;
}

function editArtistName(db, artist_id, artist_name){

	let querypromise = new Promise(function(resolve, reject){
		db.query(`UPDATE artists SET artist_name = ? WHERE id = ?`, [artist_name, artist_id], (error, result, fields) => {
	    	if (error) {
	      		console.error('An error occurred while executing the query');
	      		reject(error);
	    	}

	    	resolve(result);

		});

	});

	return querypromise;
}

function editCrew(db, artist_id, crew){

	let querypromise = new Promise(function(resolve, reject){
		db.query(`UPDATE artists SET crew = ? WHERE id = ?`, [crew, artist_id], (error, result, fields) => {
	    	if (error) {
	      		console.error('An error occurred while executing the query');
	      		reject(error);
	    	}

	    	resolve(result);

		});

	});

	return querypromise;
}

function editCountry(db, artist_id, country){

	let querypromise = new Promise(function(resolve, reject){
		db.query(`UPDATE artists SET country = ? WHERE id = ?`, [country, artist_id], (error, result, fields) => {
	    	if (error) {
	      		console.error('An error occurred while executing the query');
	      		reject(error);
	    	}

	    	resolve(result);

		});

	});

	return querypromise;
}

function editInfo(db, artist_id, info){

	let querypromise = new Promise(function(resolve, reject){
		db.query(`UPDATE artists SET info = ? WHERE id = ?`, [info, artist_id], (error, result, fields) => {
	    	if (error) {
	      		console.error('An error occurred while executing the query');
	      		reject(error);
	    	}

	    	resolve(result);

		});

	});

	return querypromise;
}

function editFB(db, artist_id, fb){

	let querypromise = new Promise(function(resolve, reject){
		db.query(`UPDATE artists SET fb = ? WHERE id = ?`, [fb, artist_id], (error, result, fields) => {
	    	if (error) {
	      		console.error('An error occurred while executing the query');
	      		reject(error);
	    	}

	    	resolve(result);

		});

	});

	return querypromise;
}

function editSC(db, artist_id, sc){

	let querypromise = new Promise(function(resolve, reject){
		db.query(`UPDATE artists SET sc = ? WHERE id = ?`, [sc, artist_id], (error, result, fields) => {
	    	if (error) {
	      		console.error('An error occurred while executing the query');
	      		reject(error);
	    	}

	    	resolve(result);

		});

	});

	return querypromise;
}

function editBC(db, artist_id, bc){

	let querypromise = new Promise(function(resolve, reject){
		db.query(`UPDATE artists SET bc = ? WHERE id = ?`, [bc, artist_id], (error, result, fields) => {
	    	if (error) {
	      		console.error('An error occurred while executing the query');
	      		reject(error);
	    	}

	    	resolve(result);

		});

	});

	return querypromise;
}

function editBeat(db, artist_id, beat){

	let querypromise = new Promise(function(resolve, reject){
		db.query(`UPDATE artists SET beat = ? WHERE id = ?`, [beat, artist_id], (error, result, fields) => {
	    	if (error) {
	      		console.error('An error occurred while executing the query');
	      		reject(error);
	    	}

	    	resolve(result);

		});

	});

	return querypromise;
}

function editInsta(db, artist_id, insta){

	let querypromise = new Promise(function(resolve, reject){
		db.query(`UPDATE artists SET insta = ? WHERE id = ?`, [insta, artist_id], (error, result, fields) => {
	    	if (error) {
	      		console.error('An error occurred while executing the query');
	      		reject(error);
	    	}

	    	resolve(result);

		});

	});

	return querypromise;
}

function deleteCrew(db, artist_id){

	let querypromise = new Promise(function(resolve, reject){
		db.query(`UPDATE artists SET crew = "" WHERE id = ?`, [artist_id], (error, result, fields) => {
	    	if (error) {
	      		console.error('An error occurred while executing the query');
	      		reject(error);
	    	}

	    	resolve(result);

		});

	});

	return querypromise;
}

function deleteCountry(db, artist_id){

	let querypromise = new Promise(function(resolve, reject){
		db.query(`UPDATE artists SET country = "" WHERE id = ?`, [artist_id], (error, result, fields) => {
	    	if (error) {
	      		console.error('An error occurred while executing the query');
	      		reject(error);
	    	}

	    	resolve(result);

		});

	});

	return querypromise;
}

function deleteInfo(db, artist_id){

	let querypromise = new Promise(function(resolve, reject){
		db.query(`UPDATE artists SET info = "" WHERE id = ?`, [artist_id], (error, result, fields) => {
	    	if (error) {
	      		console.error('An error occurred while executing the query');
	      		reject(error);
	    	}

	    	resolve(result);

		});

	});

	return querypromise;
}


function deleteFB(db, artist_id){

	let querypromise = new Promise(function(resolve, reject){
		db.query(`UPDATE artists SET fb = "" WHERE id = ?`, [artist_id], (error, result, fields) => {
	    	if (error) {
	      		console.error('An error occurred while executing the query');
	      		reject(error);
	    	}

	    	resolve(result);

		});

	});

	return querypromise;
}

function deleteSC(db, artist_id){

	let querypromise = new Promise(function(resolve, reject){
		db.query(`UPDATE artists SET sc = "" WHERE id = ?`, [artist_id], (error, result, fields) => {
	    	if (error) {
	      		console.error('An error occurred while executing the query');
	      		reject(error);
	    	}

	    	resolve(result);

		});

	});

	return querypromise;
}


function deleteBC(db, artist_id){

	let querypromise = new Promise(function(resolve, reject){
		db.query(`UPDATE artists SET bc = "" WHERE id = ?`, [artist_id], (error, result, fields) => {
	    	if (error) {
	      		console.error('An error occurred while executing the query');
	      		reject(error);
	    	}

	    	resolve(result);

		});

	});

	return querypromise;
}


function deleteBeat(db, artist_id){

	let querypromise = new Promise(function(resolve, reject){
		db.query(`UPDATE artists SET beat = "" WHERE id = ?`, [artist_id], (error, result, fields) => {
	    	if (error) {
	      		console.error('An error occurred while executing the query');
	      		reject(error);
	    	}

	    	resolve(result);

		});

	});

	return querypromise;
}


function deleteInsta(db, artist_id){

	let querypromise = new Promise(function(resolve, reject){
		db.query(`UPDATE artists SET insta = "" WHERE id = ?`, [artist_id], (error, result, fields) => {
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
	getArtistInfo,
	getAllArtists,
	getArtistNameByID,
	getAllArtistsAthroughD,
	getAllArtistsEthroughI,
	getAllArtistsJthroughO,
	getAllArtistsPthroughT,
	getAllArtistsUthroughZ,
	searchArtists,
	searchArtistsByCrew,
	addArtist,
	deleteArtist,
	editImg,
	editArtistName,
	editCrew,
	editCountry,
	editInfo,
	editFB,
	editSC,
	editBC,
	editBeat,
	editInsta,
	deleteCrew,
	deleteCountry,
	deleteInfo,
	deleteFB,
	deleteSC,
	deleteBC,
	deleteBeat,
	deleteInsta
};