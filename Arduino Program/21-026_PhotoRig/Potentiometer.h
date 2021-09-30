#ifndef POTENTIOMETER
#define POTENTIOMETER

#include "Idlers.h"

#include "arduino.h"
#include "averager.h"

class Potentiometer: public Idler {
public:
  Averager reads;

  float divs;
  void (*changeCB)(int val);
  int value;
  int lastValue;

  int pin;
  int debounce;
  unsigned long lastTime;

  Potentiometer(){
    divs = 0;
  }

  void setup(int pn, float dvs, void (*CB)(int), int nSamps=10) {
    enroll();
    pin=pn;
    changeCB = CB;
    value = lastValue = 0;

    divs = dvs;

    debounce = 20;
    
  }
  
  void idle(){
    reads.addSample(analogRead(pin));

    value = floor(divs * reads() / 1023.);

    if(value != lastValue){
      if(lastTime + debounce < millis()){
        changeCB(value);
        lastValue = value;
      }
    } else {
      lastTime = millis();
    }
  }
};

#endif
