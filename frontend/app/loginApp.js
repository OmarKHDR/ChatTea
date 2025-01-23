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