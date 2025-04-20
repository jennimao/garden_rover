import RPi.GPIO as GPIO
import time

class StepperMotor:
    def __init__(self, in1=17, in2=18, in3=27, in4=22):
        """Initialize stepper motor with GPIO pins.
        Default pins: IN1=17, IN2=18, IN3=27, IN4=22
        """
        # Setup GPIO pins
        self.pins = [in1, in2, in3, in4]
        GPIO.setmode(GPIO.BCM)
        GPIO.setwarnings(False)
        
        # Initialize all pins as outputs
        for pin in self.pins:
            GPIO.setup(pin, GPIO.OUT)
            GPIO.output(pin, False)
        
        # Stepper sequence for clockwise rotation (half-step sequence)
        self.step_sequence = [
            [1, 0, 0, 0],
            [1, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 1, 0],
            [0, 0, 1, 0],
            [0, 0, 1, 1],
            [0, 0, 0, 1],
            [1, 0, 0, 1]
        ]
        self.step_count = len(self.step_sequence)
        self.current_step = 0

    def step(self, clockwise=True, delay=0.001):
        """Take one step in specified direction."""
        if clockwise:
            self.current_step = (self.current_step + 1) % self.step_count
        else:
            self.current_step = (self.current_step - 1) % self.step_count

        # Apply the step sequence to the pins
        for i in range(4):
            GPIO.output(self.pins[i], self.step_sequence[self.current_step][i])
        
        time.sleep(delay)

    def rotate(self, degrees, clockwise=True, delay=0.001):
        """Rotate a specific number of degrees."""
        # Calculate steps needed (assuming 512 steps = 360 degrees for typical 28BYJ-48)
        steps = int((degrees * 512) / 360)
        
        for _ in range(steps):
            self.step(clockwise, delay)

    def cleanup(self):
        """Clean up GPIO pins."""
        GPIO.cleanup()

# Example usage
if __name__ == "__main__":
    try:
        # Create stepper motor instance
        motor = StepperMotor()
        
        print("Rotating 360 degrees clockwise...")
        motor.rotate(360, clockwise=True)
        time.sleep(1)
        
        print("Rotating 360 degrees counter-clockwise...")
        motor.rotate(360, clockwise=False)
        
    except KeyboardInterrupt:
        print("\nStopping motor...")
    finally:
        motor.cleanup() 