const signupForm = document.querySelector('form');

function validateEmail(email) {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
}

function validatePasswords(password, confirmPassword) {
	// Check if passwords match
	if (password !== confirmPassword) {
		return false;
	}

	// Password strength criteria
	const minLength = 8;
	const hasUpperCase = /[A-Z]/.test(password);
	const hasLowerCase = /[a-z]/.test(password);
	const hasNumbers = /\d/.test(password);
	const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

	return password.length >= minLength && 
			hasUpperCase && 
			hasLowerCase && 
			hasNumbers && 
			hasSpecialChar;
}
function updatePasswordError(password) {
	const errorElement = document.querySelector('#password-errors');
	const errors = [];
	if (password !== document.querySelector('#password').value) {
		errors.push('Password and confirmation must be the same')
	}
	if (password.length < 8) {
		errors.push('Password must be at least 8 characters long');
	}
	if (!/[A-Z]/.test(password)) {
		errors.push('Password must contain at least one uppercase letter');
	}
	if (!/[a-z]/.test(password)) {
		errors.push('Password must contain at least one lowercase letter');
	}
	if (!/\d/.test(password)) {
		errors.push('Password must contain at least one number');
	}
	if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
		errors.push('Password must contain at least one special character');
	}

	// Clear existing errors
	errorElement.innerHTML = '';
	
	// Create li elements for each error
	errors.forEach(error => {
		const li = document.createElement('li');
		li.textContent = error;
		errorElement.appendChild(li);
	});
}

document.querySelector('#password').addEventListener('input', function(e) {
	updatePasswordError(e.target.value);
});

document.querySelector('#confirm-password').addEventListener('input', function(e) {
	updatePasswordError(e.target.value);
});
signupForm.addEventListener('submit', function(event) {
	event.preventDefault();

	const email = document.querySelector('#email').value;
	const password = document.querySelector('#password').value;
	const confirmPassword = document.querySelector('#confirm-password').value;
	const userName = document.querySelector('#username').value;
	// Validate email
	if (!validateEmail(email)) {
		alert('Please enter a valid email address');
		return;
	}

	// Check if passwords match and meet minimum length
	if (!validatePasswords(password, confirmPassword)) {
		alert('use better password');
		return;
	}

	// If all validations pass, submit the form
	fetch('/api/user/submit-signup/', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			username: userName,
			password: password,
			confirmPassword: confirmPassword,
			email: email
		})
	})
	.then(response => response.json())
	.then(data => {
		console.log(data)
		if (data.status) {
			window.location.href = '/home';
		} else {
			alert(data.reason);
		}
	})
});

document.querySelectorAll('.toggle-password').forEach(button => {
	button.addEventListener('click', function() {
		const input = this.previousElementSibling;
		if (input.type === 'password') {
			input.type = 'text';
			this.textContent = 'Hide';
		} else {
			input.type = 'password';
			this.textContent = 'Show';
		}
	});
});