const { camera } = require("./camera")
var fs = require('fs');
var gphoto2 = require('gphoto2');
let setFocusE = document.querySelector("#setupFocus")
let liveview = document.querySelector("#liveView")
let showPictures = document.querySelector("#showPictures")
let focusSetters = document.querySelector(".focusSetters")
let serialE = document.querySelector('#serial')
let confirmNearPointFocus = document.querySelector('#configmNearPointFocus');
const cam = new camera(serialE);
let buttons = document.querySelectorAll('.focusSelection')
let startButton = document.querySelector('#start');
confirmNearPointFocus.addEventListener('click', () => {
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].setAttribute('current', 'F')
        cam.goToNeutral();
        serialE.innerText = 'Now please set the far point';
        startButton.classList.toggle('hidden');
    }
})
setFocusE.addEventListener('click', () => {
    focusSetters.classList.toggle('hidden')
    serialE.innerText = 'Please set the near point of focus first:'

    // change status to enable and others to diable
})
showPictures.addEventListener('click', () => {
    // Show pictures in here
    //change status
})
liveview.addEventListener('click', () => {
    // Show liveview in here
    // change status
})

function takepicture(a, b, c) {
    cam.takePicture(a, b, c);
}
function setupFocus(focus, nOrf) {
    cam.setupFocus(focus, nOrf)
}

function start() {
    cam.start()
}
window.onload = function () {
    cam.updateLiveView();
}