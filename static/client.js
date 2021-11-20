import io from './node_modules/socket.io/client-dist/socket.io.esm.min.js';
alert(typeof io);

$(document).ready(function() {
    let socket = io.connect('//' + document.domain + ':' + location.port);

    socket.on('connect', function() {
        socket.emit('user_connect', {data: 'connected to the SocketServer...'});
    });
});


