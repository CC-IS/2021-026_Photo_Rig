const { camera } = require("./camera")
const cam = new camera();
var fs = require('fs');
var gphoto2 = require('gphoto2');
function setFocus(focus) {
    cam.setFocus(focus);
}

takepicture = () => cam.takePicture;
let setFocusE = document.querySelector("#setFocus")
let liveview = document.querySelector("#liveView")
let showPictures = document.querySelector("#showPictures")
let focusSetters = document.querySelector(".focusSetters")
setFocusE.addEventListener('click', () => {
    focusSetters.classList.toggle('hidden')
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