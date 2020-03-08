const fs = require('fs');
const fileUpload = require('express-fileupload');
const request = require('request');
const path = require('path');
const nodemailer = require('nodemailer');

function storeArtistImage(artist_image, artist_name){

	let filepromise = new Promise(function(resolve, reject){
        artist_image.mv(`..public/Images/Logos/${artist_name}.jpg`, function(err) {
            if (err){
                console.error('File couldnt be uploaded');
                reject(err);
            }
            resolve("File Stored!");
          });
	});

	return filepromise;
}

function emailArtistForm(artist_name, crew, country, info, link, artist_img){

	let filepromise = new Promise(function(resolve, reject){
        const output = 
            `Artist Self-Submission!
        
            Artist Name: ${artist_name}
            Crew: ${crew}
            Country: ${country}
            Artist Info: ${info}
            Artist Link: ${link}`;
        
            let transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                  user: process.env.EMAIL, 
                  pass: process.env.EMAIL_PASSWORD
                }
            });
        
            let mailOptions = {
                from: process.env.EMAIL,
                to: process.env.EMAIL,
                subject: 'Artist Self-Submission',
                text: output,
                attachments: [
                  {
                      filename: `${artist_name}.jpg`,
                      path: `..public/Images/Logos/${artist_name}.jpg` // stream this file
                  }
                ]
            };
        
            transporter.sendMail(mailOptions, (error, info) => {
                if (error){
                    console.error('Email could not be sent');
                    reject(error);
                }
                console.log("Email sent: %s", info.messageId);
                resolve("Email Sent!");
              });        
	});

	return filepromise;
}

module.exports = {
    storeArtistImage,
    emailArtistForm
};