var fs = require('fs');
var gphoto2 = require('gphoto2');
var GPhoto = new gphoto2.GPhoto2();
var camera = null;
GPhoto.setLogLevel(1);
displayVideo();
GPhoto.on('log', function (level, domain, message) {
    console.log(domain, message);
});

GPhoto.list(function (list) {
    if (list.length === 0) {
        console.log("No cameras found");
        return
    };
    camera = list[0];
    console.log('Found', camera.model);
    takepicture()
});


function takepicture() {
    camera && camera.takePicture({ download: true }, function (er, data) {
        fs.writeFileSync(__dirname + '/picture.jpg', data);
    });
}

function setFocus(focus) {
    camera.setConfigValue("manualfocusdrive", focus, function (er) {
        er && console.log(er)
    })
}
function displayVideo() {
    var video = document.querySelector("#videoElement");

    if (navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(function (stream) {
                video.srcObject = stream;
            })
            .catch(function (err0r) {
                console.log("Something went wrong!");
            });
    }
}