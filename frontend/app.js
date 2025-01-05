const sockect = io('ws://localhost:5000')

function sendMess() {
	const text = document.getElementById('messageInput');
	const val = text.value
	if (val) {
		socket.emit(val);
		text.value = "";
	}
}