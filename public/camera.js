const { exec } = require("child_process");
var gphoto2 = require('gphoto2');
const { spawn } = require('child_process');
var fs = require('fs');

const path = require("path");


class camera {

    /**
     * 
     * @param {HTML element in-browser used as serial. 
     * @param {EventEmitter} emitter The instance of event emitted to connect to the camera instance. 
     */
    constructor(serial, emitter) {
        this.serial = serial;
        this.emitter = emitter
        let _this = this;
        this.GPhoto = new gphoto2.GPhoto2();
        this.GPhoto.setLogLevel(1);
        this.initCam()
        this.serial.innerText = `${this.camera}`
        document.querySelector('#pause').addEventListener('click', () => {
            this.emitter.emit('pause');
        })
        this.F = 0;
        this.N = 0;
        this.stop = false;
    }
    /**
     * Updates the text in the serial element in HTML brower
     * @param {String} text The text to be displayed. 
     */
    updateSerial(text) {
        this.serial.innerText = text;
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
     * @param {function} callback The callback function after taking a picture. Default is empty.
     */
    async takepicture(position, focus, folderName, callback = {}) {
        this.camera && this.camera.takePicture({ download: true }, function (er, data) {
            er && console.error(er);
            let operationNumber = 0
            fs.writeFileSync(path.join(__dirname, folderName, `${position}-${focus}.jpg`), data);

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
     * Setting up the Near and far focus points.
     * @param {String} focus the focus move
     * @param {String} nOrf N for near, F for far, for setting up the focus points
     */
    setupFocus(focus, nOrf) {

        let step = focus[focus.length - 1]
        this.updateLiveView();
        if (nOrf === 'N') {
            this.updateSerial(`Updating serial with this.N + ${Number(step)}`)
            if (focus[0] == 'N') {
                this.N += Number(step)
            }
            if (focus[0] == 'F') {
                this.N -= Number(step)
            }
        }
        else if (nOrf === 'F') {
            this.updateSerial(`Updating serial with this.N + ${step}`)

            if (focus[0] == 'F') {
                this.F += Number(step)
            }
            if (focus[0] == 'N') {
                this.F -= Number(step)
            }
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
     * Returns to neutral point.
     */
    goToNeutral() {
        for (let i = 0; i < this.N; i++) {
            this.setFocus('Far 1')
        }
    }

    /**
     * Connects the html element to the webcam
     */
    displayVideo() {
        this.connectCameraDev();
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
     */
    start(steps) {
        this.updateSerial(`Starting the process with n=${this.N}
f = ${this.F}`)
        let n = this.N;
        let f = this.F
        let position = 0;
        const focusSpan = n + f;
        let currentFocus = 0;
        let _this = this;
        _this.emitter.on('stop', () => {
            _this.stop = true;
        })

        for (let i = 0; i < n; i++) {
            _this.updateSerial('Resetting to N')
            _this.setFocus('Near 1')
        }
        while (position < steps && _this.stop == false) {
            _this.emitter.on('pause', () => {
                let timeOut = setTimeout(() => {
                    _this.emitter.on('continue', () => {
                        clearTimeout(timeOut);
                    })
                    console.log('waited for so long, now proceeding');
                }, 90000000);
            })
            if (position % 2 == 0) {
                for (let focus = 0; focus < focusSpan; focus++) {
                    _this.takepicture(position, focus, 'Pictures', _this.setFocus('Far 1'))
                }
            }
            else {
                for (let focus = focusSpan; focus > 0; focus--) {

                    _this.takepicture(position, focus, 'Pictures', _this.setFocus('Near 1'))

                }
            }
            // arduino.emit(move)
            position++;
        }
        if (confirm('Job completed, do you want to refresh page?') === true) {
            location.reload();
        }


    }
    /**
     * Updates the Live view by capturing a preview image and updating the preview image in brower.
     */
    updateLiveView() {
        this.camera.takePicture({
            preview: true,
            targetPath: '/tmp/tmp.XXXXXX'
        }, function (er, tmpname) {
            let pathpreview = path.join(__dirname, "previews")
            fs.renameSync(tmpname, pathpreview + '/picture.jpg');
        });
        var timestamp = new Date().getTime();
        var img = document.getElementById("preview");
        img.src = "./previews/picture.jpg?t=" + timestamp;
    }
}

exports.camera = camera;