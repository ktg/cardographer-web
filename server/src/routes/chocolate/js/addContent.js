document.getElementById('addVideo').addEventListener('click', () => {
	document.getElementById('contentButtons').style.display = 'none';
	document.getElementById('uploader').style.display = 'block';
	const upload = document.getElementById('uploadInput')
	upload.accept = 'video/*';
	upload.click();
});

document.getElementById('addImage').addEventListener('click', () => {
	document.getElementById('contentButtons').style.display = 'none';
	document.getElementById('uploader').style.display = 'block';
	const upload = document.getElementById('uploadInput')
	upload.accept = 'image/*';
	upload.click();
});

document.getElementById('addAudio').addEventListener('click', () => {
	document.getElementById('contentButtons').style.display = 'none';
	document.getElementById('uploader').style.display = 'block';
	const upload = document.getElementById('uploadInput')
	upload.accept = 'audio/*';
	upload.click();
});