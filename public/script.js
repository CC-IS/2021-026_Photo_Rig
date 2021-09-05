// const { camera } = require("./camera")
// const cam = new camera();
// var fs = require('fs');
// var gphoto2 = require('gphoto2');
// setFocus = focus => cam.setFocus(focus);

takepicture = () => cam.takePicture;
let setFocus = document.querySelector("#setFocus")
let liveview = document.querySelector("#liveView")
let showPictures = document.querySelector("#showPictures")
let focusSetters = document.querySelector(".focusSetters")
setFocus.addEventListener('click', () => {
    focusSetters.classList.toggle('hidden')
    setFocus.classList.toggle('Active')
    showPictures.classList.toggle('Active')
    liveview.classList.toggle('Active')
})
showPictures.addEventListener('click', () => {
    // Show pictures in here
    setFocus.classList.toggle('Active')
    showPictures.classList.toggle('Active')
    liveview.classList.toggle('Active')
})
liveview.addEventListener('click', () => {
    // Show liveview in here
    setFocus.classList.toggle('inActive')
    showPictures.classList.toggle('inActive')
    liveview.classList.toggle('Active')
})