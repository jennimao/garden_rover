from flask import Flask, render_template
from flask_socketio import SocketIO, emit
import time

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)

# Robot state
robot_state = {
    'position': {'x': 0, 'y': 0},
    'status': 'Active',
    'battery': 100,
    'last_move': None
}

@app.route('/')
def index():
    return render_template('index.html')

@socketio.on('connect')
def handle_connect():
    print('Client connected')
    emit('robot_state', robot_state)

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')

@socketio.on('control_command')
def handle_control_command(data):
    command = data.get('command')
    value = data.get('value')
    
    if command == 'move':
        # Update virtual position
        robot_state['position'] = {
            'x': value['x'],
            'y': value['y']
        }
        
        # Calculate movement direction
        dx = value['x'] - value['oldX']
        dy = value['y'] - value['oldY']
        
        # Here you would add the actual robot control code
        # For example: send commands to Raspberry Pi GPIO pins
        if dx > 0:
            print("Moving right")
            # GPIO commands for moving right
        elif dx < 0:
            print("Moving left")
            # GPIO commands for moving left
        elif dy > 0:
            print("Moving down")
            # GPIO commands for moving down
        elif dy < 0:
            print("Moving up")
            # GPIO commands for moving up
            
        robot_state['last_move'] = {'dx': dx, 'dy': dy}
    
    emit('robot_state', robot_state)

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5001, debug=True) 