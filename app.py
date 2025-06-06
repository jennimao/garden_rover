from flask import Flask, render_template, send_from_directory
from flask_socketio import SocketIO
from flask_cors import CORS  # 🆕

app = Flask(__name__)
CORS(app)  # ✅ allow cross-origin requests (e.g., to Arduino)
socketio = SocketIO(app, cors_allowed_origins="*")  # ✅ allow socket.io CORS

# Serve the main game page
@app.route('/')
def index():
    return render_template('index.html')

# Serve static files
@app.route('/static/<path:path>')
def serve_static(path):
    return send_from_directory('static', path)

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=8000, debug=True)
