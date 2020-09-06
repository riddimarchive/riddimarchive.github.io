var cmd = require('node-cmd');

process.on("message", message =>{
    const jsonResponse = getDownload(message.url);
    process.send(jsonResponse);
    process.exit();
});

function getDownload(url){
    return {"result":  url}
}