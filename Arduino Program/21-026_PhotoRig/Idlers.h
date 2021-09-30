#ifndef IDLERS
#define IDLERS

class Idler {
  public:
    Idler();
    void enroll();
    
    virtual void idle() = 0;
};

void idle();

#endif
