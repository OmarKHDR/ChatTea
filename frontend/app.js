const sendBtn = document.getElementById('sendButton')
const chat = document.getElementById('messageArea')

function sendMess() {
	const text = document.getElementById('messageInput');
	const val = text.value
	if (val) {
		socket.emit(val);
		text.value = "";
	}
}

sendBtn.addEventListener('click', ()=>{
	const message = document.getElementById('messageInput').value
	console.log(message)
	if (message) {
		const childMessage = createMessageElement(message, 'sent-message');
		console.log(childMessage)
		chat.appendChild(childMessage);
	}
})

function createMessageElement(message, className) {
	const text = document.createElement('div');
	text.setAttribute('class', className);
	text.innerText = message;
	const time = document.createElement('div');
	time.setAttribute('class', 'message-time');
	const t = new Date();
	const nighty = (t.getHours() / 12) ? 'pm' : 'am';
	const date = `${t.getHours() % 12}:${t.getMinutes()} ${nighty}`;
	time.textContent = date;
	text.appendChild(time);
	//text.style.width = message.len;
	return text;
}