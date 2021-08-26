const path = require("path")
const { app, BrowserWindow } = require('electron')
function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            enableRemoteModule: true,
            worldSafeExecuteJavaScript: true,
            contextIsolation: false
        }
    })

    win.loadFile('public/home.html')


}
app.whenReady().then(() => {
    createWindow()
    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
    app.allowRendererProcessReuse = false;
})
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})

var fs = require('fs');
var gphoto2 = require('gphoto2');
var GPhoto = new gphoto2.GPhoto2();
GPhoto.setLogLevel(1);
GPhoto.on('log', function (level, domain, message) {
    console.log(domain, message);
});

GPhoto.list(function (list) {
    if (list.length === 0) {
        console.log("No cameras found");
        return
    };
    var camera = list[0];
    console.log('Found', camera.model);
    console.log('Found', camera);
    // takePicture(camera)
});


function takePicture(camera) {
    camera.takePicture({ download: true }, function (er, data) {
        fs.writeFileSync(__dirname + '/picture.jpg', data);
    });
}