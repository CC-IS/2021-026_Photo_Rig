#include "Idlers.h"
#include <Arduino.h>

static int idlerCount = 0;
Idler * idlers[50];


Idler::Idler(){
}

void Idler::enroll(){
  idlers[idlerCount++] = this;
  Serial.println(idlerCount);
}

void idle(){
  for(int i =0; i< idlerCount; i++){
    idlers[i]->idle();
  }
}
