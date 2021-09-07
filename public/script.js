const { camera } = require("./camera")
var fs = require('fs');
var gphoto2 = require('gphoto2');


let setFocusE = document.querySelector("#setupFocus")
let liveview = document.querySelector("#liveView")
let showPictures = document.querySelector("#showPictures")
let focusSetters = document.querySelector(".focusSetters")
let serialE = document.querySelector('#serial')

const cam = new camera(serialE);

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
function setupFocus(focus) {
    cam.setupFocus(focus)
}

function start() {
    cam.start()
}