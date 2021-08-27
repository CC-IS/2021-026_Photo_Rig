const { camera } = require("./camera")
const cam = new camera();
var fs = require('fs');
var gphoto2 = require('gphoto2');
setFocus = focus => cam.setFocus(focus);
takepicture = () => cam.takePicture();

