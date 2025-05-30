import RPi.GPIO as GPIO          
from time import sleep

# --- Motor 1 Pin Setup ---
in1 = 17
in2 = 18
en1 = 25

# --- Motor 2 Pin Setup ---
# (Change these pins if needed to match your wiring.)
in3 = 22
in4 = 23
en2 = 24

# Direction flag: 1 = forward, 0 = backward (applied to both motors)
temp1 = 1  

# --- GPIO Setup ---
GPIO.setmode(GPIO.BCM)

# Setup for Motor 1
GPIO.setup(in1, GPIO.OUT)
GPIO.setup(in2, GPIO.OUT)
GPIO.setup(en1, GPIO.OUT)
GPIO.output(in1, GPIO.LOW)
GPIO.output(in2, GPIO.LOW)

# Setup for Motor 2
GPIO.setup(in3, GPIO.OUT)
GPIO.setup(in4, GPIO.OUT)
GPIO.setup(en2, GPIO.OUT)
GPIO.output(in3, GPIO.LOW)
GPIO.output(in4, GPIO.LOW)

# --- PWM Setup on Enable Pins ---
# Use a PWM frequency of 25kHz to avoid audible noise
p1 = GPIO.PWM(en1, 25000)
p2 = GPIO.PWM(en2, 25000)

# Start both PWM channels at full speed (100% duty cycle)
p1.start(100)
p2.start(100)

print("""
Motor Control Program for Two Motors
--------------------------------------
The default speed & direction of both motors is HIGH & Forward.

Controls:
r - run
s - stop
f - forward
b - backward
l - low speed (25%)
m - medium speed (50%)
h - high speed (100%)
e - exit
""")

try:
    while True:
        x = input("Enter command: ").lower()

        if x == 'r':
            print("Run")
            if temp1 == 1:
                # Set both motors to forward
                GPIO.output(in1, GPIO.HIGH)
                GPIO.output(in2, GPIO.LOW)
                GPIO.output(in3, GPIO.HIGH)
                GPIO.output(in4, GPIO.LOW)
                print("Direction: Forward")
            else:
                # Set both motors to backward
                GPIO.output(in1, GPIO.LOW)
                GPIO.output(in2, GPIO.HIGH)
                GPIO.output(in3, GPIO.LOW)
                GPIO.output(in4, GPIO.HIGH)
                print("Direction: Backward")

        elif x == 's':
            print("Stop")
            # Stop both motors by setting both inputs LOW
            GPIO.output(in1, GPIO.LOW)
            GPIO.output(in2, GPIO.LOW)
            GPIO.output(in3, GPIO.LOW)
            GPIO.output(in4, GPIO.LOW)

        elif x == 'f':
            print("Set direction: Forward")
            temp1 = 1
            GPIO.output(in1, GPIO.HIGH)
            GPIO.output(in2, GPIO.LOW)
            GPIO.output(in3, GPIO.HIGH)
            GPIO.output(in4, GPIO.LOW)

        elif x == 'b':
            print("Set direction: Backward")
            temp1 = 0
            GPIO.output(in1, GPIO.LOW)
            GPIO.output(in2, GPIO.HIGH)
            GPIO.output(in3, GPIO.LOW)
            GPIO.output(in4, GPIO.HIGH)

        elif x == 'l':
            print("Speed: Low")
            p1.ChangeDutyCycle(25)
            p2.ChangeDutyCycle(25)

        elif x == 'm':
            print("Speed: Medium")
            p1.ChangeDutyCycle(50)
            p2.ChangeDutyCycle(50)

        elif x == 'h':
            print("Speed: High")
            p1.ChangeDutyCycle(100)
            p2.ChangeDutyCycle(100)

        elif x == 'e':
            print("Exiting and cleaning up GPIO...")
            break

        else:
            print("<<< Invalid command >>>")
            print("Please enter one of: r, s, f, b, l, m, h, e")

except KeyboardInterrupt:
    print("\nProgram interrupted")

finally:
    # Stop PWM signals before cleanup
    p1.stop()
    p2.stop()
    GPIO.cleanup()
    print("GPIO cleaned up")
