const { exec } = require("child_process");
var gphoto2 = require('gphoto2');
const { spawn } = require('child_process');
var fs = require('fs');
const EventEmitter = require('events');

const emitter = new EventEmitter();

class camera {

    constructor(serial) {
        this.serial = serial;
        this.emitter = new EventEmitter();
        let _this = this;
        this.GPhoto = new gphoto2.GPhoto2();
        this.GPhoto.setLogLevel(1);
        this.initCam()
        console.log(this.camera);
        this.serial.innerText = `${this.camera}`
        document.querySelector('#pause').addEventListener('click', () => {
            this.emitter.emit('pause');
        })
        this.F = 0;
        this.N = 0;
    }

    /**
     * Initializes the camera as a device and prepares for taking pictures and setting focus etc.
     */
    initCam() {
        let _this = this;
        this.GPhoto.list(function (list) {
            if (list.length === 0) {
                _this.serial.innerText = 'No Cameras Found';
                console.log("No cameras found");
                return
            };
            _this.camera = list[0];
            _this.serial.innerText = `Found ${_this.camera.model}`
            console.log('Found', _this.camera.model);
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
            fs.writeFileSync(__dirname + `/${folderName}` `/${position}-${focus}.jpg`, data);
        });
        !this.camera && console.log('Camera is undefined.')
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
     * 
     * @param {String} focus the focus move 
     */
    setupFocus(focus) {
        if (focus[0] == 'N') {
            this.N += Number(focus[-1])
        }
        if (focus[0] == 'F') {
            this.F += Number(focus[-1])
        }
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
    /**
     * Starts taking picutres and moving on the rig
     * @param {Number} steps the number of steps the camera has to move 
     * @param {Number} n the near point of the focus represented in a +ve number 
     * @param {Number} f the far point of the focus represented in a +ve number
     */
    start(steps) {
        n = this.N;
        f = this.F
        let position = 0;
        const focusSpan = n + f;
        let currentFocus = 0;
        let _this = this;
        for (let i = 0; i < n; i++) {
            this.setFocus('Near 1')
        }
        while (position < steps) {
            if (position % 2) {
                for (let focus = 0; focus < focusSpan; focus++) {
                    _this.takePicture(position, focus, 'Pictures')
                    _this.setFocus('Far 1')
                }
            }
            else {
                for (let focus = focusSpan; focus > 0; focus--) {
                    _this.takePicture(position, focus, 'Pictures')
                    _this.setFocus('Near 1')
                }
            }
            // arduino.emit(move)
            position++;
        }

    }

    takeArrPictures(number, direction) {
        this.takepicture("")
    }

}

exports.camera = camera;