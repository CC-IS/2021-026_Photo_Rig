const { exec } = require("child_process");
var gphoto2 = require('gphoto2');
const { spawn } = require('child_process');
var fs = require('fs');


class camera {

    constructor() {
        this.GPhoto = new gphoto2.GPhoto2();
        this.GPhoto.setLogLevel(1);
        this.initCam()
    }
    /**
     * Initializes the camera as a device and prepares for taking pictures and setting focus etc.
     */
    initCam() {
        this.GPhoto.list(function (list) {
            if (list.length === 0) {
                console.log("No cameras found");
                return
            };
            this.camera = list[0];
            console.log('Found', this.camera.model);
        });
    }
    /**
     * Takes a pictures, names it, and saves it to the foldername specified.
     * @param {number} position the number correspondind to the position in rig 
     * @param {number} focus the +ve or -ve focus number from the point chosen to be the startpoint
     * @param {String} folderName the foldername to save in in the main directory  
     */
    takepicture(position, focus, folderName) {
        this.camera && this.camera.takePicture({ download: true }, function (er, data) {
            er && console.error(er);
            let operationNumber = 0
            // if (!fs.existsSync(__dirname + `/${folderName}`)) {
            //     operationNumber++
            // }
            fs.writeFileSync(__dirname + `/${folderName}` `/${position}-${focus}.jpg`, data);
        });
    }
    /**
     * 
     * @param {String} focus the step to give to the focus motor "Near 1", "Far 3" ... 
     */
    setFocus(focus) {
        this.camera.setConfigValue("viewfinder", 1, function (er) {
            er && console.log(er);
        })
        this.camera.setConfigValue("manualfocusdrive", focus, function (er) {
            er && console.log(er)
        })
    }
    /**
     * connects the camera as a webcam in order to view the liveview in the brower.
     */
    connectCameraDev() {
        this.process = exec(`gphoto2 --stdout --capture-movie | ffmpeg -i - -vcodec rawvideo -pix_fmt yuv420p -threads 0 -f v4l2 /dev/video0`, (error, stdout, stderr) => {
            if (error) {
                console.log(`error: ${error.message}`);
                return;
            }
            if (stderr) {
                console.log(`stderr: ${stderr}`);
                return;
            }
        });
    }
    /**
     * Connects the html element to the webcam
     */
    displayVideo() {
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
    /**
     * Stops using the camera as webcam and initializes it as ordinary camera.
     */
    stopVideo() {
        exec("killall gphoto2", () => {
            this.initCam()
        })
    }

}

exports.camera = camera;