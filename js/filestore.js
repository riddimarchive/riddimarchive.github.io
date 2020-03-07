const fs = require('fs');
const fileUpload = require('express-fileupload');
const request = require('request');
const path = require('path');

function storeArtistImage(artist_image, artist_name){

	let filepromise = new Promise(function(resolve, reject){
        artist_image.mv(`public/Images/Logos/${artist_name}.jpg`, function(err) {
            if (err){
                console.error('File couldnt be uploaded');
                reject(error);
            }
            resolve("File Stored!");
          });
	});

	return filepromise;
}

module.exports = {
	storeArtistImage
};