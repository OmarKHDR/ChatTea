import { Server } from "socket.io";
import { createServer } from "http";
import express from "express";
import env from 'process';


const port = env.SOCKETPORT || 5000;
const host = env.SOCKETHOST || '0.0.0.0';
const app = express()
const httpServer = createServer(app);

app.use(express.static('../frontend'))
app.get('/login', (req, res)=>{
	res.sendFile('home.html', {'root': '../frontend/'});
})
app.get('/home', (req, res) => {
	res.sendFile('index.html', {'root': '../frontend'})
})

const socket = new Server(httpServer, {
	cors: {
		origin: "*"
	}
})

socket.on('connection', soc => {
	console.log('user:', soc.id, 'connected')
	soc.on('message', message => {
		console.log(message);
		socket.emit(`message from: ${soc.id},\nmessage: ${message}`);
	})
})

httpServer.listen(port, host, () => {
	console.log('socket connection started on',host, port);
})