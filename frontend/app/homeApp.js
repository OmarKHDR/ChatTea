const sendBtn = document.getElementById('sendButton')
const chat = document.getElementById('messageArea')
const socket = io();
const header = document.querySelector('header')
let userName;

fetch('/username')
.then(res => res.json())
.then(res => {
	userName = res.username;
	const user = document.createElement("div")
	user.textContent = "Hi, " + userName;
	user.setAttribute('class', 'username')
	header.appendChild(user);
	socket.emit('username', userName);
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
