import RPi.GPIO as GPIO          
from time import sleep

# Pin setup
in1 = 24
in2 = 23
en = 25
temp1 = 1  # 1 = forward, 0 = backward

# Setup
GPIO.setmode(GPIO.BCM)
GPIO.setup(in1, GPIO.OUT)
GPIO.setup(in2, GPIO.OUT)
GPIO.setup(en, GPIO.OUT)

GPIO.output(in1, GPIO.LOW)
GPIO.output(in2, GPIO.LOW)

# PWM setup on enable pin
p = GPIO.PWM(en, 25000)  # 1kHz frequency
p.start(100)  # Start with 75% duty cycle


print("""
Motor Control Program
---------------------
The default speed & direction of motor is LOW & Forward.

Controls:
r - run
s - stop
f - forward
b - backward
l - low speed
m - medium speed
h - high speed
e - exit
""")

try:
    while True:
        x = input("Enter command: ").lower()

        if x == 'r':
            print("Run")
            if temp1 == 1:
                GPIO.output(in1, GPIO.HIGH)
                GPIO.output(in2, GPIO.LOW)
                print("Direction: Forward")
            else:
                GPIO.output(in1, GPIO.LOW)
                GPIO.output(in2, GPIO.HIGH)
                print("Direction: Backward")

        elif x == 's':
            print("Stop")
            GPIO.output(in1, GPIO.LOW)
            GPIO.output(in2, GPIO.LOW)

        elif x == 'f':
            print("Set direction: Forward")
            temp1 = 1
            GPIO.output(in1, GPIO.HIGH)
            GPIO.output(in2, GPIO.LOW)

        elif x == 'b':
            print("Set direction: Backward")
            temp1 = 0
            GPIO.output(in1, GPIO.LOW)
            GPIO.output(in2, GPIO.HIGH)

        elif x == 'l':
            print("Speed: Low")
            p.ChangeDutyCycle(25)

        elif x == 'm':
            print("Speed: Medium")
            p.ChangeDutyCycle(50)

        elif x == 'h':
            print("Speed: High")
            p.ChangeDutyCycle(100)

        elif x == 'e':
            print("Exiting and cleaning up GPIO...")
            break

        else:
            print("<<< Invalid command >>>")
            print("Please enter one of: r, s, f, b, l, m, h, e")

except KeyboardInterrupt:
    print("\nProgram interrupted")

finally:
    GPIO.cleanup()
    print("GPIO cleaned up")
