#ifndef AVERAGER
#define AVERAGER

#include "arduino.h"

class Averager {
public:

  // variables for averaging.
  int numSamps;
  double * samps;
  int pntr;
  double tot;
  double ave;

  Averager(int num = 10){
  // init the averaging variables.
    pntr=tot=ave=0;
    numSamps = num;
    samps = new double[numSamps];
    for(int i=0; i<numSamps; i++){
      samps[i]=0;
      tot+=samps[i];
    }
  }

  double operator()(){
    return ave;
  }

  void reset(){
    for(int i=0; i<numSamps; i++){
      samps[i]=0;
    }
    tot = ave = 0;
  }

  void addSample(double newRead){
    tot-=samps[pntr];
    samps[pntr]=newRead;
    tot+=newRead;
    ave = tot/numSamps;
    pntr=(pntr + 1)%numSamps;
  }
};

#endif
