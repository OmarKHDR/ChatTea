import { Server } from "socket.io";
import { createServer } from "http";
import express from "express";
import env from 'process';
import bodyParser from 'body-parser';
import {v4} from 'uuid'
import session from 'express-session'
import router from './routes/index.js'
import userController from "./controllers/userController.js";

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
	saveUninitialized: false, // Only save session if modified
	 cookie: {
		   secure: false, // Set to true in production with https
		   httpOnly: false, // Helps prevent client-side JS from accessing the cookie
		   maxAge: 1000 * 60 * 60 * 24 // Session expiration time (1 day)
	   },
  }));

app.use(express.static('../frontend'))
app.use(router);

const io = new Server(httpServer, { cors: { origin: "*" } })

io.on('connection', soc => {
	console.log('user:', soc.id, 'connected')

	soc.on('username', (name) => {
		soc.username = name;
		io.emit('announcement', `user ${soc.username} has joined the room`)
	})

	soc.on('message', message => {
		soc.broadcast.emit('message', JSON.stringify({message, username: soc.username}))
	})
	io.on('diconnect', () => {
		io.emit('announcement', soc.username + 'has left')
	})
})

httpServer.listen(port, host, () => {
	console.log('socket connection started on',host, port);
})
