#ifndef LINACT
#define LINACT

#include "Idlers.h"

#include "arduino.h"
#include "button.h"

class linAct: public Idler {
  public:
    //variables
    bool homing;
    bool homed;
    bool running;

    //pins
    int dir,enb,pulsePin;
    Button leftLimit, rightLimit;

    //parameters
    int ppr; //pulses per rev
    int tpr; // teeth per rev
    float pitch; //pitch of timing belt, in inches
    float ppi;
    int maxFreq;

    int pulseCount;
    int pulseState;
    int direction;
    int destination;
    int startPos;

    //speed profile controls
    unsigned long lastTime;
    unsigned long cur;
    bool useProfile;
    unsigned long oscTmr;
    unsigned long runTmr;
    int runTimeout;
    float oscillator;
    float oscMax;
    float oscIncrement;
    float incrementInterval;
    bool resetOnRun;

    //stores the pointer to the callback function
    void (*endCB)();

    void (*destCB)();
  
    float (*oscFunc)(float);

    //Functions:
    void setInterrupt();
    void setFrequency(int freq);

    void setParameters(int pulsesPerRev, int teethPerRev, float inchesPerTooth, float mxf);
    
    void setup(int pulsePin, int dirPin, int enablePin, int leftLimPin, int rightLimPin);

    void enable();

    void disable();

    void setDirection(int d);

    void stop();

    void run(float speed, bool prof=false);

    void to(float location, float timeInSeconds,  void (*cb)(), bool prof=false , bool ramp = false);

    void run(float (*oscFxn)(float));

    float currentLocation();

    void home(void (*homeCB)());

    void idle();

    void isrIdle();
};

extern linAct actuator;

#endif
