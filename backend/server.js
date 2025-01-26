import { Server } from "socket.io";
import { createServer } from "http";
import express from "express";
import env from 'process';
import bodyParser from 'body-parser';
import {v4} from 'uuid'
import session from 'express-session'
import router from './routes/index.js'

const port = env.SOCKETPORT || 5000;
const host = env.SOCKETHOST || '0.0.0.0';
const app = express()
const httpServer = createServer(app);

if (!env.SECRETKEY) {
	env.SECRETKEY = v4();
}
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(session({
	secret: env.SECRETKEY, // Change this to a secure secret
	resave: false,
	saveUninitialized: true, // Only save session if modified
	cookie: {
		   secure: false, // Set to true in production with https
		   httpOnly: false, // Helps prevent client-side JS from accessing the cookie
		   maxAge: 1000 * 60 * 60 * 24 // Session expiration time (1 day)
		},
}));

app.use(router);
app.use(express.static('../frontend'))

const io = new Server(httpServer, { cors: { origin: "*" } })

io.on('connection', soc => {
	soc.on('username', (name) => {
		soc.username = name;
	})
	console.log('user:', soc.id, 'connected')
	soc.on('joinRoom', roomName => {
		if (!soc.username) {
			console.log('username not recieved yet, trying to reconnect....')
			soc.emit("rejoin", {status: "failed to join room"})
			return;
		}
		if(soc.currentRoom) {
			soc.leave(soc.currentRoom);
			io.to(soc.currentRoom).emit('announcement', soc.username + ' has left the room');
		}
		soc.currentRoom = roomName;
		soc.join(soc.currentRoom);
		console.log(soc.username, "has joined", soc.currentRoom)
		io.to(soc.currentRoom).emit('joined', soc.currentRoom)
		io.to(soc.currentRoom).emit('announcement', `user ${soc.username} has joined the room`)
		soc.on('message', (message) => {
			console.log('message sent to', soc.currentRoom);
			soc.broadcast.to(soc.currentRoom).emit('message', JSON.stringify({message, username: soc.username}))
		})
	})
	soc.on('disconnect', () => {
		console.log(soc.username, "left", soc.currentRoom)
		if(soc.currentRoom) {
			soc.leave(soc.currentRoom);
			io.to(soc.currentRoom).emit('announcement', soc.username + ' has left the room');
			soc.currentRoom = null;
		}
	})
})

httpServer.listen(port, host, () => {
	console.log('socket connection started on',host, port);
})
