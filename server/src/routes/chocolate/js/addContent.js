document.querySelectorAll("input[type=file]").forEach((input) => {
	input.addEventListener('change', (event) => {
		const size = event.target.files[0].size;
		console.log(event.target.files[0].size);
		if (size < 1000000) {
			event.target.form.submit();
		}
	})
});

document.getElementById('addLink').addEventListener('click', () => {
	document.getElementById('contentButtons').style.display = 'none';
	document.getElementById('linker').style.display = 'block';
});

document.getElementById('linkCancel').addEventListener('click', () => {
	document.getElementById('contentButtons').style.display = '';
	document.getElementById('linker').style.display = 'none';
});