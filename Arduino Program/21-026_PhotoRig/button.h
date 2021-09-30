#ifndef BUTTON
#define BUTTON

#include "Idlers.h"

#include "arduino.h"

namespace DigitalButton {
  
  template <typename CT, typename ... A> class fxn
  : public fxn<decltype(&CT::operator())()> {};
  
  class dButFunc{
    public:
      virtual void operator()(int);
  };
  
  template <typename C> class fxn<C>: public dButFunc {
  private:
      C mObject;
  
  public:
      fxn(const C & obj) : mObject(obj) {}
  
      void operator()(int a) {
          this->mObject(a);
      }
  };

}

class Button : public Idler {
public:
  bool state;
  bool fired;
  bool lastFired;
  unsigned long debounceTimer;
  int debounce;
  int pin;
  
  void (*callback)(int state);
  DigitalButton::dButFunc* pressCB;

  Button(){
  }

  void setup(int p, void (* cb)(int), unsigned long time = 20) {
    enroll();
    setCallback(cb);
    pin = p;
    pinMode(p, INPUT_PULLUP);
    digitalWrite(p,HIGH);
    debounceTimer = 0;
    debounce = time;
    lastFired = state = fired = true;
  }

  template<typename C>
  void setup(int p, const C & cb, unsigned long time = 20) {
    enroll();
    setCallback(cb);
    pin = p;
    pinMode(p, INPUT_PULLUP);
    debounceTimer = 0;
    debounce = time;
    lastFired = state = fired = true;
  }

  template<typename C> 
  void setCallback( const C & cb){
    pressCB = new DigitalButton::fxn<C>(cb);
  }

  void setCallback( void (* cb)(int)){
    callback = cb;
  }
  
  void idle(){
    if(digitalRead(pin) != state){
      state = !state;
      fired = !state;
      debounceTimer = millis() + debounce;
    }

    if(debounceTimer < millis() && state != fired && lastFired != state){
      lastFired = fired = state;
      //callback(!state);
      if(pressCB) (*pressCB)(!state);
      else if(callback) callback(!state);
    }
  }
};

#endif
