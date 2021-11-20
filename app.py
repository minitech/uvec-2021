import socketio
from flask import Flask, render_template, request
from flask_socketio import SocketIO, send, emit, join_room, leave_room

app = Flask(__name__)
socketio = SocketIO(app)

@app.route('/', methods=['GET'])
def home():
    return render_template('home.html')

@app.route('/game/<url>', methods=['POST', 'GET'])
def realtime_chess(url):
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

@socketio.on('join_room')
def join(msg):
    for socket in sockets:
        if socket.sid == request.sid:
            socket.room = msg['room']
    join_room(msg['room'])

@socketio.on('move')
def handle_move(data):
    emit('move', data, broadcast=True, include_self=False, room=data['room'])

if __name__ == '__main__':
    # socketio.run(app, host='0.0.0.0', port=80)
    app.run(debug=True)
