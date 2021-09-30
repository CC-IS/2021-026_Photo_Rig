#include "linAct.h"
#include "serialParser.h"

#define READY 1
#define HOME 2
#define HALT 3
#define MOVE_TO 4
#define LEFT_LIM 5

serialParser parser(Serial);

void setup() {
  Serial.begin(115200);

  parser.on(READY, [](unsigned char * input, int size){
    parser.sendPacket(REPORT,READY);
  });

  parser.on(HOME, [](unsigned char * input, int size){
    actuator.home([](){
      parser.sendPacket(REPORT,HOME);  
    });
  });

  parser.on(HALT, [](unsigned char * input, int size){
    actuator.stop();
  });

  parser.on(MOVE_TO, [](unsigned char * input, int size){
    float location = ((input[2] << 7) + input[3]) / 1000.; // This gives a number 0 to 16.384, which is used as a position, in inches.

    //actuator.to() takes three inputs: a location, a time to get there, and a callback function, on arrival.
    actuator.to(10,2, [](){
      parser.sendPacket(REPORT,MOVE_TO); 
    });
  });

  // set up the actuator (pulse, direction, enable, left limit, right limit pin numbers)
  actuator.setup(5,6,7,8,9);

  // if we see the left limit switch, stop and tell the computer.
  actuator.leftLimit.setCallback([](int state){
    actuator.stop();
    parser.sendPacket(REPORT,LEFT_LIM);
  });
}

void loop() {
  idle();
}
