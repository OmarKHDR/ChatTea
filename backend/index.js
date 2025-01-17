import { Server } from "socket.io";
import { createServer } from "http";
import express from "express";
import env from 'process';
import 'bodyParser';
import routes from './routes/index'

const port = env.SOCKETPORT || 5000;
const host = env.SOCKETHOST || '0.0.0.0';
const app = express()
const httpServer = createServer(app);


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static('../frontend'))
app.use(routes);

app.get('/login', (req, res)=> { res.sendFile('login.html', {'root': '../frontend'}); });
app.get('/home', (req, res) => { res.sendFile('index.html', {'root': '../frontend'}); });

const io = new Server(httpServer, { cors: { origin: "*" } })

io.on('connection', soc => {
	console.log('user:', soc.id, 'connected')

	soc.broadcast.emit('announcement', 'new user entered');
	soc.on('message', message => {
		soc.broadcast.emit('message', message)
	})
	io.on('diconnect', () => {
		soc.broadcast.emit('announcement', 'a user has left')
	})
})

httpServer.listen(port, host, () => {
	console.log('socket connection started on',host, port);
})
