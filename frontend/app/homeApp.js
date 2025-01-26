const sendBtn = document.getElementById('sendButton')
const chat = document.getElementById('messageArea')
const socket = io();
const header = document.querySelector('header')
const rooms = document.getElementById('rooms')
const deleteChat = document.getElementById('deleteChat');

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
			socket.emit('joinRoom', 'general');
		}
		rooms.appendChild(child);
	});
})

fetch(`/api/room/room-session?roomName=general`)
.then(_=>{
	fetch('/api/room/add-member/');
})
.then(_=>{
	getMembers();
	getAdmins();
	getRoomMessages(roomName);
})

rooms.addEventListener
('click', (e) => {
	if (e.target.tagName === 'LI') {
		// Remove 'clicked' class from all li elements
		const allRooms = rooms.querySelectorAll('li');
		allRooms.forEach(room => room.classList.remove('clicked'));
		e.target.classList.add('clicked');
		fetch(`/api/room/remove-member?roomName=${roomName}`).then(_=> {
			roomName = e.target.textContent;
			fetch(`/api/room/room-session?roomName=${roomName}`).then(_=>{
				console.log(roomName, "has been joined and session were updated")
				socket.emit('joinRoom', roomName);
			})
		})
	}
})

socket.on('rejoin', () =>{
	socket.emit('username', userName);
	socket.emit('joinRoom', roomName);

})

socket.on('joined', (room)=>{
	console.log(room, roomName, "this is insane")
	if (room === roomName) {
		fetch('/api/room/add-member/')
		.then(_ => {
			getMembers();
			getAdmins();
			getRoomMessages() 
		})
	}
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

function sendMess(val, time) {
	if (val) {
		fetch('/api/message/add-message/', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				roomName: roomName,
				userName: userName,
				message: val,
				timeCreated: time || new Date(),
				timeUpdated: undefined,
			})
		});
		socket.emit('message', val, time);
	}
}

sendBtn.addEventListener('click', ()=>{
	const message = document.getElementById('messageInput');
	const messageText = message.value;
	console.log(messageText);
	if (messageText) {
		const time = new Date();
		const childMessage = createMessageElement(messageText, 'sent-message', 'me', time);
		chat.appendChild(childMessage);
		sendMess(messageText, time);
		message.value = "";
	}
})

function createMessageElement(message, className, userName, tm=undefined, timeUpdated=undefined) {
	const text = document.createElement('div');
	text.setAttribute('class', className);
	text.innerText = message;
	if (className !== 'announcement') {
		const time = document.createElement('div');
		time.setAttribute('class', 'message-time');
		console.log(typeof(tm))
		const t = (tm)? new Date(tm) : new Date();
		const nighty = (t.getHours() / 12) ? 'pm' : 'am';
		const date = `${t.getHours() % 12}:${t.getMinutes()} ${nighty}`;
		time.textContent = userName + " " + date ;
		text.appendChild(time);
	}
	//text.style.width = message.len;
	return text;
}


function getRoomMessages() {
	fetch('/api/message/all-messages/')
	.then(res => res.json())
	.then(messages => {
		console.log(messages)
		chat.innerHTML = '';
		messages.forEach(msg => {
			const messageClass = msg.userName === userName ? 'sent-message' : 'received-message';
			const displayName = msg.userName === userName ? 'me' : msg.userName;
			const messageElement = createMessageElement(msg.message, messageClass, displayName, msg.timeCreated, msg.timeUpdated);
			chat.appendChild(messageElement);
		});
	});
}

function getMembers() {
	fetch('/api/room/list-members/')
	.then(res => res.json())
	.then(members => {
		const membersList = document.getElementById('members');
		membersList.innerHTML = '';
		members.forEach(member => {
			const li = document.createElement('li');
			li.textContent = member;
			membersList.appendChild(li);
		});
	});
}

function getAdmins() {
	fetch('/api/room/list-admins/')
	.then(res => res.json())
	.then(admins => {
		console.log(admins)
		const adminsList = document.getElementById('admins');
		adminsList.innerHTML = '';
		admins.forEach(admin => {
			const li = document.createElement('li');
			li.textContent = admin;
			adminsList.appendChild(li);
		});
	});
}

deleteChat.addEventListener('click', async ()=>{
	const res = await fetch("/api/message/delete-messages/")
	console.log("reloading messages after deleting", res)
	if(res.status === 401) {
		alert("you are not an admin, you can't delete room messages")
	} else if (res.status === 500) {
		alert("a problem happend while deleting check the logs")
	} else {
		getRoomMessages();
	}
})