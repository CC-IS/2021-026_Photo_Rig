#include "linAct.h"

linAct actuator;

ISR(TIMER1_COMPA_vect){//timer1 interrupt 1Hz toggles pin 13 (LED)
//generates pulse wave of frequency 1Hz/2 = 0.5kHz (takes two cycles for full wave- toggle high then toggle low)
  actuator.isrIdle();
}

void linAct::setInterrupt(){
  cli(); // stop interrupts
  TCCR1A = 0;// set entire TCCR1A register to 0
  TCCR1B = 0;// same for TCCR1B
  TCNT1  = 0;//initialize counter value to 0
  // set compare match register for 1hz increments
  OCR1A = 12499;// = (16*10^6) / (1*1024) - 1 (must be <65536)
  OCR1B = 0;
  // turn on CTC mode
  TCCR1B |= (1 << WGM12);
  // Set CS12, CS11 and CS10 bits for 8 prescaler
  TCCR1B |= (0 << CS12) | (1 << CS11) | (0 << CS10);
  // enable timer compare interrupt
  TIMSK1 |= (1 << OCIE1A);
  sei();
}

void linAct::setFrequency(int freq){
  if(freq>maxFreq) freq = maxFreq;
  uint32_t ocr = F_CPU / freq / 2 - 1;

  uint8_t prescalarbits = 0b001;
  if (ocr > 0xffff)
  {
    ocr = F_CPU / freq / 2 / 64 - 1;
    prescalarbits = 0b011;
  }

  
  TCCR1B = (TCCR1B & 0b11111000) | prescalarbits;
  OCR1A = ocr;
}

void linAct::setParameters(int pulsesPerRev=800, int teethPerRev=20, float inchesPerTooth=.118, float mxf = 5000){
  ppr = pulsesPerRev;
  tpr = teethPerRev;
  pitch = inchesPerTooth;
  maxFreq = mxf;


  ppi = ppr/(pitch*tpr); //pulse/rev / (in/tooth*tooth/rev) = pulse/rev * rev/in = pulse/in
}

void linAct::setup(int plsPin, int dirPin, int enablePin, int leftLimPin, int rightLimPin){
  enroll();
  setInterrupt();
  setParameters();

  pulsePin = plsPin;
  dir = dirPin;
  enb = enablePin;

  pulseCount = 0;

  useProfile = false;
  oscTmr = 0;
  oscillator = 0;
  oscIncrement = PI/8;
  resetOnRun = false;

  pinMode(pulsePin,OUTPUT);
  pinMode(dir, OUTPUT);
  pinMode(enb,OUTPUT);

  leftLimit.setup(leftLimPin, [](int state){
    if(state) Serial.println("left limit hit");
  });

  rightLimit.setup(rightLimPin, [](int state){
    if(state) Serial.println("right limit hit");
  });

  digitalWrite(dir,LOW);
  digitalWrite(enb,LOW);
}

void linAct::enable(){
  digitalWrite(enb,HIGH);
}

void linAct::disable(){
  digitalWrite(enb,LOW);
}

void linAct::setDirection(int d){
  direction = (d)?1:-1;
  digitalWrite(dir, d);
}

void linAct::stop(){
  running = false;
  disable();
}

void linAct::run(float speed, bool prof = false){
  useProfile = prof;
  running = true;
  setFrequency(abs(speed) * maxFreq);
  setDirection(speed > 0);
  if(speed) enable();
  else disable();
}

void linAct::to(float location, float timeInSeconds,  void (*cb)(), bool prof = false, bool ramp = false){
  int cmdPulseCount = location*ppi;
  useProfile = prof;
  running=true;
  startPos = pulseCount;
  destination = cmdPulseCount;
  destCB = cb;
  int freq = (cmdPulseCount - pulseCount)/timeInSeconds;
  setFrequency(abs(freq));
  setDirection(freq>0);
  enable();
}

void linAct::run(float (*oscFxn)(float)){
  //running = true;
  useProfile = true;
  oscFunc = oscFxn;
  //enable();
}

float linAct::currentLocation(){
  return pulseCount/ppi;
}

void linAct::home(void (*homeCB)()){
  useProfile = false;
  homed = false;
  run(-.2);
  rightLimit.setCallback([this,homeCB](int state){
    this->stop();
    pulseCount = 0;
    homeCB();
    homed = true;
  });
}

int diff = 0;

void linAct::idle(){
  leftLimit.idle();
  rightLimit.idle();

  if(useProfile){
    if(oscFunc){
      //setFrequency(abs(oscFunc(oscillator))*ppi);
      //setDirection(oscFunc(oscillator) > 0);
      oscFunc(oscillator);
    }
//    } else if(destination) {
//      int mid = destination - startPos;
//      setFrequency(abs(freq));
//      setDirection(freq>0);
//    }
  }

  oscillator+=((micros()-lastTime)/1000000.)*oscIncrement;
  if(oscillator>2*PI) oscillator-=2*PI;

  lastTime = micros();
}

void linAct::isrIdle(){
  if(running){
    if(pulseState) pulseCount+=direction;
    digitalWrite(pulsePin, pulseState);
    pulseState = !pulseState;
    if(pulseCount == destination && destCB){
      stop();
      (*destCB)();
      destCB = 0;
    }
  }
}
