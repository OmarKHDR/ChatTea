const sendBtn = document.getElementById('sendButton')
const chat = document.getElementById('messageArea')
const socket = io();
const header = document.querySelector('header')
const rooms = document.getElementById('rooms')
let userName;
let roomName;
fetch('/api/user/username')
.then(res => res.json())
.then(res => {
	userName = res.username;
	socket.emit('username', userName);
	const user = document.createElement("div")
	user.textContent = "Hi, " + userName;
	user.setAttribute('class', 'username')
	header.appendChild(user);
})

fetch('/api/room/list-rooms')
.then(res => res.json())
.then(res => {
	// Sort rooms to put General first
	res.sort((a, b) => {
		if (a.roomName === 'general') return -1;
		if (b.roomName === 'general') return 1;
		return a.roomName.localeCompare(b.roomName);
	});
	
	res.forEach(room => {
		const child = document.createElement('li');
		child.textContent = room.roomName;
		if(room.roomName === 'general') {
			roomName = 'general'
			child.classList.add('clicked');
			socket.emit('joinRoom', room.roomName);
		}
		rooms.appendChild(child);
	});
})

rooms.addEventListener
('click', (e) => {
	if (e.target.tagName === 'LI') {
		// Remove 'clicked' class from all li elements
		const allRooms = rooms.querySelectorAll('li');
		allRooms.forEach(room => room.classList.remove('clicked'));
		e.target.classList.add('clicked');
		roomName = e.target.textContent;
		socket.emit('joinRoom', roomName);
	}
})

socket.on('rejoin', () =>{
	socket.emit('joinRoom', roomName);
})


socket.on('message', (mess) =>{
	console.log(mess);
	mess = JSON.parse(mess)
	const recievedMessage = createMessageElement(mess.message, 'received-message', mess.username);
	chat.appendChild(recievedMessage);
})

socket.on('announcement', (mess) => {
	const recievedMessage = createMessageElement(mess, 'announcement', "");
	chat.appendChild(recievedMessage);
})

function sendMess(val) {
	if (val) {
		socket.emit('message', val, userName);
	}
}

sendBtn.addEventListener('click', ()=>{
	const message = document.getElementById('messageInput');
	const messageText = message.value;
	console.log(messageText);
	if (messageText) {
		const childMessage = createMessageElement(messageText, 'sent-message', 'me');
		//console.log(childMessage);
		chat.appendChild(childMessage);
		sendMess(messageText);
		message.value = "";
	}
})

function createMessageElement(message, className, userName) {
	const text = document.createElement('div');
	text.setAttribute('class', className);
	text.innerText = message;
	if (className !== 'announcement') {
		const time = document.createElement('div');
		time.setAttribute('class', 'message-time');
		const t = new Date();
		const nighty = (t.getHours() / 12) ? 'pm' : 'am';
		const date = `${t.getHours() % 12}:${t.getMinutes()} ${nighty}`;
		time.textContent = userName + " " + date;
		text.appendChild(time);
	}
	//text.style.width = message.len;
	return text;
}
