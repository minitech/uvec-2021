import socketio
from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit

app = Flask(__name__)
socketio = SocketIO(app)

@app.route('/', methods=['GET'])
def home():
    return render_template('index.html')

# Keep track of connected users
class Socket:
    def __init__(self, sid):
        self.sid = sid
        self.connected = True
        self.username = sid
        self.room = sid


sockets = []

@socketio.on('connect')
def add_socket():
    sockets.append(Socket(request.sid))
    emit('user_connect', {'data' : 'user connected'})
    

if __name__ == '__main__':
    socketio.run(app, debug=True)
