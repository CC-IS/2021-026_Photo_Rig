/* This library creates a class which emits the following signals:
*     homed: emitted when the track reaches the home position.
*     moved: emitted once the track reaches the commanded position.
*     leftLimit: emitted if the carriage reaches the far limit switch.
*     ready: emitted once the controller establishes communication with program
*
*  The class has the following member functions:
*     home(): Takes no inputs, starts the homing procedure on the track.
*     move(location): Takes a floating point number between 0 and 16.384, instructs
        the carriage to move to that location in inches.
*     stop(): Takes no inputs, stops any motion of the carriage.
*/

//Include the serialParser library.
const {serialParser} = require('./serialParser.js');
const EventEmitter = require('events');

const address = 1;

const READY = 1;
const HOME = 2;
const HALT = 3;
const MOVE_TO = 4;
const LEFT_LIM = 5;

class LinearTrack extends EventEmitter {
  constructor(conf) {
    // call super to instantiate the EventEmitter class
    super();
    var _this = this;

    //create our serial handler.
    var parser = new serialParser();

    //When we receive various commands back from the controller, emit a signal.
    parser.on(HOME, (data)=> {
      _this.emit('homed');
    });
    parser.on(MOVE_TO, (data)=> {
      _this.emit('moved');
    });
    parser.on(LEFT_LIM, (data)=> {
      _this.emit('leftLimit');
    });
    parser.on(READY, (data)=> {
      _this.emit('ready');
    });

    // Send a ready request once we connect.
    parser.onOpen = ()=> {
      parser.sendPacket([address, READY]);
    };

    //open the serial port with the configuration that we were passed.
    if (conf.name) parser.setup({ name: conf.name, baud: 115200 });
    else if (conf.manufacturer) parser.setup({ manufacturer: conf.manufacturer, baud: 115200 });
  }

  //define the move function.
  move(location){
    if(location >=0 && location < 16.384){
      //We're constrained to 7 bit bytes when sending data, so for convenience,
      // we're limiting the numbers to 2^14
      let integerVal = Math.floor(location * 1000);  //get the value as an integer

      //send the data to the controller.
      parser.sendPacket([address, MOVE_TO, (integerVal >> 7) & 127, intergerVal & 127]);
    }
  }

  //send various commands to the arduino.
  home(){
    parser.sendPacket([address,HOME]);
  }

  stop(){
    parser.sendPacket([address,HALT]);
  }
}

exports.LinearTrack = LinearTrack;
