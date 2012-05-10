var app = require('express').createServer()
var io = require('socket.io').listen(app);

app.listen(8089);

// routing
app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

var clients = {};

io.sockets.on('connection', function (socket) {

	socket.on("join",function(username,x,y){
		
		// tell everyone that you are new
		io.sockets.emit("new_user",username,x,y);

		// Store the new user as a client with a position
		var client = Object();
		client.username = username
		client.x = x;
		client.y = y;
		clients[username] = client;

		socket.username = username;
		
		// Tell the new client about all existing users and their positions.
		Object.keys(clients).forEach(function(username){
			client = clients[username];
			if(client.username != socket.username){
				socket.emit("new_user",client.username,client.x,client.y);
			}
		})
		
	});

	socket.on("move",function(x,y){
		if(typeof(socket.username) != "undefined"){
			io.sockets.emit("client_is_moving",socket.username,x,y);

			// Alway update the client with latest position so 
			// new clients will the position when the log on.
			clients[socket.username].x = x;
			clients[socket.username].y = y;			
		}
	})

	// when the user disconnects.. perform this
	socket.on('disconnect', function(){
		// remove the user and tell all clients that the user has left.
		delete clients[socket.username];
		io.sockets.emit("user_has_left",socket.username);
	});
});