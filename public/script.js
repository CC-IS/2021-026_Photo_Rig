const { camera } = require("./camera")
var fs = require('fs');
var gphoto2 = require('gphoto2');
const EventEmitter = require('events');

let setFocusE = document.querySelector("#setupFocus")
let liveview = document.querySelector("#liveView")
let showPictures = document.querySelector("#showPictures")
let focusSetters = document.querySelector(".focusSetters")
let serialE = document.querySelector('#serial')
let confirmNearPointFocus = document.querySelector('#configmNearPointFocus');
let buttons = document.querySelectorAll('.focusSelection')
let startButton = document.querySelector('#start');
var video = document.querySelector("#videoElement");
var preview = document.querySelector("#preview");



const emitter = new EventEmitter();
const cam = new camera(serialE, emitter);

/**
 * Initializes the preview video.
 */
window.onload = function () {
    cam.camera && cam.displayVideo()
    // preview video => cam.displayVideo()
    // preview image => cam.camera && cam.updateLiveView();
}

function signalStop() {
    emitter.emit('stop')
}
function signalPause(button) {
    emitter.emit('pause')
    button.innerText = 'CONTINUE';
    button.setAttribute('onlick', "signalContinue(this)");
}
function signalContinue(button) {
    if (!cam.camera) {
        cam.stopVideo();
        cam.initCam();
    }

    emitter.emit('continue')
    button.innerText = 'PAUSE';
    button.setAttribute('onlick', "signalPause(this)");
}

function setupFocus(focus, nOrf) {
    cam.setupFocus(focus, nOrf)
}

function start(Steps) {
    cam.start(Steps)
}

/**
 * Stops video preview, initiates camera, shows focus setting buttons.
 */
setFocusE.addEventListener('click', () => {
    cam.stopVideo();
    video.classList.toggle('hidden')
    preview.classList.toggle('hidden')
    focusSetters.classList.toggle('hidden')
    serialE.innerText = 'Please set the near point of focus first:'
})

confirmNearPointFocus.addEventListener('click', () => {
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].setAttribute('current', 'F')
    }
    //show start button
    startButton.classList.toggle('hidden');
    //hide confirming near point focus.
    confirmNearPointFocus.classList.toggle('hidden')
    serialE.innerText = 'Now please set the far point';
    cam.goToNeutral();

})
showPictures.addEventListener('click', () => {
    // Show pictures in here
    //change status
})
liveview.addEventListener('click', () => {
    signalPause(document.querySelector('.toggler'))
    cam.displayVideo();
    // Show liveview in here
    // change status
})
