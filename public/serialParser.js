/* This library was originally written such that either ChromeOS native serial
*  or NodeJS serialport could be used, which is why a separate 'Serial' class is used
*  This is largely not applicable any longer, and this could be rewritten more succintly
*/

const com = require('serialport');

const START_FLAG = 128;
const STOP_FLAG = 0;
const REPORT = 126;
const BROADCAST = 127;

var Serial = function (delim = '\r\n') {

  const parser = new com.parsers.Delimiter({ delimiter: delim });

  var _this = this;
  let ser = null;
  _this.isOpen = false;
  _this.onOpen = () => {};

  _this.onMessage = () => {console.log('test');};

  _this.onPortNotFound = function (ports) {
    console.log('Port not found');
  };

  _this.write = (str)=> {
    if (_this.isOpen) ser.write(str);
  };

  _this.send = (arr) => {
    if (_this.isOpen) ser.write(Buffer.from(arr));
  };

  var openByName = (portName, baud) => {
    console.log('Opening serialport ' + portName);
    ser = new com(portName, {
      baudRate: baud,
    });

    ser.pipe(parser);

    parser.on('data', function (data) {
      _this.onMessage(data);
    });

    ser.on('open', function () {
      _this.isOpen = true;
      _this.onOpen();
    });

    ser.on('error', function () {
      console.log('Error from SerialPort');
    });
  };

  _this.open = (props) => {
    var name = null;
    com.list().then((ports)=> {
      ports.forEach(function (port) {
        //console.log(port);
        if (port.comName.includes(props.name) ||
            (port.manufacturer && props.manufacturer &&
            port.manufacturer.toLowerCase() == props.manufacturer.toLowerCase()) ||
            (port.serialNumber && port.serialNumber == props.serialNumber)
          ) name = port.comName;
      });

      if (!name) _this.onPortNotFound(ports);
      else openByName(name, props.baud);
    });
  };

};

exports.serialParser = function () {
  var _this = this;
  var serial = new Serial(Buffer.from([START_FLAG + STOP_FLAG]));

  _this.serial = serial;

  var errCheck = (data)=> {
    let tot = 0;
    for (let i = 0; i < data.length - 1; i++) {
      tot += data[i];
    }

    return ((tot & 0b01111111) == data[data.length - 1]);
  };

  _this.sendPacket = (arr, print)=> {
    arr[0] |= 0b10000000;
    arr.push(arr.reduce((acc, val)=>acc + val, 0) & 0b01111111);
    arr.push(START_FLAG + STOP_FLAG);
    // console.log('----------------- Sent ---------------');
    if (print) console.log(arr);
    serial.send(arr, print);
  };

  var commandCB = [];

  _this.on = (cmd, cb)=> {
    commandCB[cmd] = cb;
  };

  serial.onMessage = (data)=> {
    if (errCheck(data)) {
      let addr = data[0] & 0b01111111;
      let cmd = data[1];

      if (commandCB[cmd]) commandCB[cmd](data.slice(2));
    } else {
      var str = data.toString().substr(1);
      if (str.toLowerCase().includes('error')) console.error(str);
      else console.log(str);
    }
  };

  _this.onOpen = ()=> {};

  serial.onOpen = () => {
    _this.onOpen();

  };

  _this.setup = (opts)=> {
    serial.open(opts);
  };

};
