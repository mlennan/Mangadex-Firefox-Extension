window.addEventListener("click", page_clicked);
var uninterested_manga_title;
var uninterested_manga_id;
var mangadexNode;


function page_clicked(){
	console.log("Page clicked");
	//Find the button that I want my button to come after, or that I'll alter
	mangadexNode = document.querySelector('a[href*="/title/upload/"]');
	if (mangadexNode != null)
	{
		//If we've found the button we're going to replace, stop listening for more button presses that initiate a search for this button
		window.removeEventListener("click", page_clicked);
		uninterested_manga_title = ((document.evaluate("/html/body/div[1]/div[1]/div[2]/div[3]/div/div[4]/p", document)).iterateNext()).innerText;
		uninterested_manga_id = mangadexNode.getAttribute("href").substring(14);
		mangadexNode.firstChild.innerText = "Mark Uninterested";
		mangadexNode.removeAttribute("href");
		mangadexNode.addEventListener("click", notifyBackgroundPage);
	}

}





function handleResponse(message) {
	console.log(`Message from the background script: ${message.response}`);
	//if message.response is true change mangadexNode to say "Marked as uninterested"
	if (message.response === "true")
	{
		console.log("Removing the event listener and changing the text");
		mangadexNode.removeEventListener("click", notifyBackgroundPage);
		mangadexNode.firstChild.innerText = "Successfully marked uninterested";
	}
}

function handleError(error) {
	console.log(`Error: add_button ${error}`);
}

function notifyBackgroundPage(e) {
	let manga_title_manga_id = `${uninterested_manga_title},${uninterested_manga_id}`;
	console.log(manga_title_manga_id);
	const sending = browser.runtime.sendMessage({
		greeting: manga_title_manga_id,
	});
	sending.then(handleResponse, handleError);
}


function handleMessage(request, sender, sendResponse) {

	console.log(`A background script sent a message: ${request.greeting}`);
	sendResponse({ response: storage_groups });
}



browser.runtime.onMessage.addListener(handleMessage);
