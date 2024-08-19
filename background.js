var to_be_hidden_en_title;
var to_be_hidden_manga_id;
var to_be_hidden_manga_title_manga_id;
var manga_title_manga_id;
var successfully_blocked_manga;

/*
	Questions:
	How does it figure out which part is the uploader / group?
	How can it instead figure out which part is the manga title?
	Preferably, how can it instead figure out which part is the really long alphanumeric string with dashes in the url?
					Like: https://mangadex.org/title/   "dcebd4d5-d384-4079-8491-62bf1b9a9cd8"   /garouden
						  https://mangadex.org/title/   "8f542695-6d90-48a3-bee7-cc84175857ee"   /one-day-outing-foreman
		It comes in the JSON!
		Assuming the alphanumeric string is unique and consistent to each manga of course
			The string should be unique, removing the manga name after the string still gives the same webpage
		Looking at the url is not needed, I will simply use the id for the manga from its json

	How can I add a button to webpages to quickly add a manga to the block list?


	Things to hide:
		Manga based on ID						Done
		Manga based on title							What I started this for
		Manga based on words in en/jp title				Can't be bothered
		Manga based on tags								Not enough interest
		Manga based on words in description				Can't be bothered



*/

/*
inner html		Latest Updates
outer html		<h2 data-v-0389fa15="" class="font-header text-2xl font-semibold">Latest Updates</h2>
css selector	.font-header
css path		html.dark.custom body div#__nuxt div.flex.flex-grow.text-color div.flex.flex-col.flex-grow div.md-content.flex-grow div.page-container.wide div.flex.items-center.mb-6.mt-2 h2.font-header.text-2xl.font-semibold
xpath			/html/body/div[1]/div[1]/div[2]/div[3]/div/div[1]/h2

what is happening:
	the part of the webpage I want to access doesn't exist yet probably (lets test that)
.dark.custom body div#__nuxt div.flex.flex-grow.text-color div.flex.flex-col.flex-grow div.md-content.flex-grow div.page-container.wide div.flex.items-center.mb-6.mt-2 h2.font-header.text-2xl.font-header text-2xl font-semibold
*/

function listener(details) {


	browser.tabs.query({active:true,currentWindow:true}).then(function(tabs){
		if (tabs[0].url.includes("/titles/latest"))
		{



			let getting = browser.storage.local.get(["manga", "uploaders"]);
			getting.then(onGot, onError);

			let filter = browser.webRequest.filterResponseData(details.requestId);
			let decoder = new TextDecoder("utf-8");
			let encoder = new TextEncoder();
			let data = [];
			filter.ondata = event => {
				data.push(event.data);
			};
			
			filter.onstop = event => {
				let str = "";
				if (data.length == 1) {
					str = decoder.decode(data[0]);
				} else {
					for (let i = 0; i < data.length; i++) {
						let stream = (i == data.length - 1) ? false : true;
						str += decoder.decode(data[i], {stream});
					}
				}
				var json_data = JSON.parse(str);
				data_length = Object.keys(json_data.data).length;
				try {
					for (let i = 0; i < data_length; i++) {
						relationships = json_data.data[i].relationships;
						var en_title = "";
						var manga_id = "";
						var manga_tags = "";
			//			console.log(JSON.stringify(relationships[i]));
						for (let j = 0; j < Object.keys(relationships).length; j++) {

							if (relationships[j].type == "manga" && "attributes" in relationships[j]) {
								en_title = relationships[j].attributes.title.en;
								manga_id = relationships[j].id;
								manga_tags = relationships[j].attributes.tags; // attributes.tags.attributes.name.en
							}
						}
						
						var hidden = false;
						for (let current_tag = 0; current_tag < manga_tags.length; current_tag++)
						{
							if (manga_tags[current_tag].attributes.name.en == "Boys' Love")
							{
								hidden = true;
							}
						}
						if ((!hidden) && (en_title != "" && manga_id != "" ) && (to_be_hidden_manga_title_manga_id.length > 0)) {
							for (let j = 0; j < to_be_hidden_manga_title_manga_id.length; j++) {
								let current_manga_title_manga_id = to_be_hidden_manga_title_manga_id[j].split(',');
								if (current_manga_title_manga_id[current_manga_title_manga_id.length-1] === manga_id) 
								{
									hidden = true;
									console.log(current_manga_title_manga_id[0]);//Since sometimes things get through somehow? This lets me see if it finds them or not
									break;
								}
							}
						}
						
						if (hidden) {
							json_data.data.splice(i, 1);
							i = i - 1;
							data_length = data_length - 1;
						}
					}
				} catch (err) {
					console.log(err);
				}
				filter.write(encoder.encode(JSON.stringify(json_data)));
				filter.disconnect();
			}
		}
	});
	return {};
}

function onError(error) {
	console.log(`Error: ${error}`);
}

function onGot(item) {
	try {
		to_be_hidden_manga_title_manga_id = item.manga.split(/\r?\n/);
	} catch (err) {
		to_be_hidden_manga_title_manga_id = [];
	}
}





function handleMessage(request, sender, sendResponse) {
	try
	{
		let get_all_manga_promise = browser.storage.local.get("manga");

		manga_title_manga_id = request.greeting;
		get_all_manga_promise.then(add_manga_to_uninterested, onError);
		sendResponse({ response: "true" });
	}
	catch (err) //if something happens then it failed to add to the blocked list
	{
		console.log(err);
		sendResponse({ response: "false" });
	}
}



function add_manga_to_uninterested(result)
{
	let current_manga = result.manga;
	if ( (current_manga == undefined) || (current_manga == null) )
	{
		throw new error ("The variable current_manga is undefined or null. To prevent overriding a list with nothing, the attempt has been aborted.");
	}
	if (current_manga == "")
	{
		current_manga = `${manga_title_manga_id}`;
	}
	else
	{
		current_manga = current_manga + `\n${manga_title_manga_id}`;
	}
	browser.storage.local.set({
	manga: current_manga
	})
}

/*
function binary_search_uninterested_list()
{
	//Need everything in the storage
	let getting = browser.storage.local.get(["manga", "uploaders"]);
	getting.then(onGot, onError);
	let manga_id_to_find = "???";
	let min_manga_id = 0;
	let max_manga_id = "???";
	let mid_manga_id = undefined;
	let found = false;
	while ((min_manga_id <= max_manga_id) && !found)
	{
		mid_manga_id = Math.trunc((min_manga_id + max_manga_id)/2);

	}

}
*/



function onError(error)
{
	console.log(`Error happened with adding the manga to the block list: ${error}`);
}








browser.runtime.onMessage.addListener(handleMessage);

browser.webRequest.onBeforeRequest.addListener(
	listener,
	{urls: ["https://api.mangadex.org/manga/*/feed?*", "https://api.mangadex.org/chapter?*", "https://api.mangadex.org/user/follows/manga/feed?*"], types: ["xmlhttprequest"]},
	["blocking"]
);
