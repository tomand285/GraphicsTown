/*
	This is a Node.js program for converting all image files in the current dir into one file called textues.js to hold base64 data
	This basic version only works for png and jpg files right now!!!
	It also turns everything in the current dir into base64 then selects from the list
*/


var fs = require('fs');
 
 
if (process.argv.length != 2) {
    console.log("Usage: Node " + __filename);
    process.exit(-1);
}
 
var path = ".";
var imgList;

function base64_encode(file){
	var bitmap = fs.readFileSync(file);
	return new Buffer(bitmap).toString('base64');
}
 
fs.readdir(path, function(err, items) {
	imgList = new Array(items.length);
	console.log("Reading Directory...");
    for (var i=0; i<items.length; i++) {
    	imgList[i] = new Object();
    	imgList[i].fullName = items[i];
    	imgList[i].name = items[i].split('.')[0];
    	imgList[i].ext = (items[i].split('.')[1]).toLowerCase();
    	imgList[i].base64 = base64_encode(items[i]);
    }
});

var stream = fs.createWriteStream("textures.js");

stream.once('open', (fd) => {
	console.log("Writing to file...");
	stream.write("var LoadedImageFiles = LoadedImageFiles || {};\n");
	for(var i=0; i<imgList.length; i++){
		if(imgList[i].ext == "jpg")
			stream.write("LoadedImageFiles[\""+imgList[i].fullName+"\"] = \"data:image/jpeg;base64,"+imgList[i].base64+"\"\n");
		else if(imgList[i].ext == "png")
			stream.write("LoadedImageFiles[\""+imgList[i].fullName+"\"] = \"data:image/png;base64,"+imgList[i].base64+"\"\n");
		else if(imgList[i].ext == "gif")
			stream.write("LoadedImageFiles[\""+imgList[i].fullName+"\"] = \"data:image/png;base64,"+imgList[i].base64+"\"\n");
	}
	stream.end();
	console.log("textures.js is ready");
});