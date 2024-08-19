function saveOptions(e) {
	e.preventDefault();
	browser.storage.local.set({
		manga: document.querySelector("#hidden-manga").value,
		uploaders: document.querySelector("#hidden-uploaders").value
	});
}
//Gets the values from storage and puts them in the text boxes on the options page
function restoreOptions() {

	function setCurrentChoiceGroups(result) {
		document.querySelector("#hidden-manga").value = result.manga || "";
	}

	function setCurrentChoiceUploaders(result) {
		document.querySelector("#hidden-uploaders").value = result.uploaders || "";
	}

	function onError(error) {
		console.log(`Error: ${error}`);
	}

	let getting_groups = browser.storage.local.get("manga");
	getting_groups.then(setCurrentChoiceGroups, onError);

	let getting_uploaders = browser.storage.local.get("uploaders");
	getting_uploaders.then(setCurrentChoiceUploaders, onError);
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);