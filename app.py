from flask import Flask, render_template, send_from_directory
from flask_socketio import SocketIO

app = Flask(__name__)
socketio = SocketIO(app)

# Serve the main game page
@app.route('/')
def index():
    return render_template('index.html')

# Serve static files (CSS, JavaScript, images)
@app.route('/static/<path:path>')
def serve_static(path):
    return send_from_directory('static', path)

if __name__ == '__main__':
    # Run the server on port 8000 (different from Pi's 5001)
    socketio.run(app, host='0.0.0.0', port=8000, debug=True)