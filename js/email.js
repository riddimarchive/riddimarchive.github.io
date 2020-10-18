const fs = require('fs');
const fileUpload = require('express-fileupload');
const request = require('request');
const path = require('path');
const nodemailer = require('nodemailer');

function storeArtistImage(artist_image, artist_name){

	let filepromise = new Promise(function(resolve, reject){
        artist_image.mv(`public/Images/Logos/${artist_name}.jpg`, function(err) {
            if (err){
                console.error('File couldnt be uploaded');
                reject(err);
            }
            console.log("file moved");
            resolve("File Stored!");
          });
	});

	return filepromise;
}

function storeArtistVerifyImage(proof_img, artist_name){

	let filepromise = new Promise(function(resolve, reject){
        proof_img.mv(`public/Images/Logos/${artist_name}proof.jpg`, function(err) {
            if (err){
                console.error('File couldnt be uploaded');
                reject(err);
            }
            console.log("file moved");
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
                  path: `public/Images/Logos/${artist_name}.jpg` // stream this file
              }
            ]
        };

        console.log("sending email");
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

function emailArtistVerify(username, artist_name, img_url){

	let filepromise = new Promise(function(resolve, reject){
        const output = 
            `Artist Account Create!

            Username: ${username}
            Artist Name: ${artist_name}
            IMG URL: ${img_url}`;
        
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
                  filename: `${artist_name}proof.jpg`,
                  path: `public/Images/Logos/${artist_name}proof.jpg` // stream this file
              }
            ]
        };

        console.log("sending email");
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

function standardEmail(reason, info){
    let emailpromise = new Promise(function(resolve, reject){
        const output = 
            `${reason}!
            
            Info: ${info}`;

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
                subject: `${reason}`,
                text: output,
            };

            console.log("sending email");
            transporter.sendMail(mailOptions, (error, info) => {
            if (error){
                console.error('Email could not be sent');
                reject(error);
            }
            console.log("Email sent: %s", info.messageId);
            resolve("Email Sent!");
          }); 
    });

    return emailpromise;
}


function userPassEmail(theemail, reason, info){
    let emailpromise = new Promise(function(resolve, reject){
        const output = 
            `${reason}!
            ${info}`;

            let transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                  user: process.env.EMAIL, 
                  pass: process.env.EMAIL_PASSWORD
                }
            });

            let mailOptions = {
                from: process.env.EMAIL,
                to: theemail,
                subject: `${reason}`,
                text: output,
            };

            console.log("sending email");
            transporter.sendMail(mailOptions, (error, info) => {
            if (error){
                console.error('Email could not be sent');
                reject(error);
            }
            console.log("Email sent: %s", info.messageId);
            resolve("Email Sent!");
          }); 
    });

    return emailpromise;
}

module.exports = {
    storeArtistImage,
    storeArtistVerifyImage,
    emailArtistForm,
    emailArtistVerify,
    standardEmail,
    userPassEmail
};