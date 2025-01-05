import { Server } from "socket.io";
import { createServer } from "http";
import env from 'process';


const port = env.SOCKETPORT || 5000;
const host = env.SOCKETHOST || '127.0.0.1';
const httpServer = createServer();
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
	console.log('socket connection started');
})