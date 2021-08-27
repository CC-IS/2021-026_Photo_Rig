const camera = require("./camera")
var fs = require('fs');
var gphoto2 = require('gphoto2');
setFocus = focus => camera.setFocus(focus);
takepicture = () => camera.takePicture();

