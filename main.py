import os
import base64
from flask import Flask, render_template, request, send_file
from flask_socketio import SocketIO, emit
import eventlet

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your_secret_key'
socketio = SocketIO(app, async_mode='eventlet')

@app.route('/')
def index():
    return render_template('index.html')

@socketio.on('message')
def handle_message(data):
    emit('message', data, broadcast=True)

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return 'No file part', 400
    file = request.files['file']
    if file.filename == '':
        return 'No selected file', 400
    if file:
        file_content = file.read()
        file_base64 = base64.b64encode(file_content).decode('utf-8')
        file_info = {
            'filename': file.filename,
            'content': file_base64,
            'mimetype': file.mimetype
        }
        socketio.emit('file_upload', file_info, broadcast=True)
        return 'File uploaded and broadcasted', 200

if __name__ == '__main__':
    socketio.run(app, debug=True, host='0.0.0.0', port=3453)
