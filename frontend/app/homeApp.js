const sendBtn = document.getElementById('sendButton')
const chat = document.getElementById('messageArea')
const socket = io();


socket.on('message', (mess) =>{
	console.log(mess);
	const recievedMessage = createMessageElement(mess, 'received-message', 'anyUser');
	chat.appendChild(recievedMessage);
})

socket.on('announcement', (mess) => {
	const recievedMessage = createMessageElement(mess, 'announcement', 'anyUser');
	chat.appendChild(recievedMessage);
})

function sendMess(val) {
	if (val) {
		socket.emit('message', val);
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

	const time = document.createElement('div');
	time.setAttribute('class', 'message-time');
	const t = new Date();
	const nighty = (t.getHours() / 12) ? 'pm' : 'am';
	const date = `${t.getHours() % 12}:${t.getMinutes()} ${nighty}`;
	time.textContent = "user name " + date;
    
	text.appendChild(time);
	//text.style.width = message.len;
	return text;
}
