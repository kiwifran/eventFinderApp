const app = {};
//api related information
import {
	CLIENT_ID,
	AUTHORIZATION_ENDPOINT,
	RESOURCE_ENDPOINT,
	LOCATIONS_ENDPOINT,
	IMAGE_ENDPOINT
} from "./scripts/apiInfo.js";
//create for later use
app.locationInfo = {};
//month names with corresponding number of days
app.monthArr = [
	["January", 31],
	["February", 28],
	["March", 31],
	["April", 30],
	["May", 31],
	["June", 30],
	["July", 31],
	["August", 31],
	["September", 30],
	["October", 31],
	["November", 30],
	["December", 31]
];
//extract token from url
app.extractToken = function(hash) {
	const match = hash.match(/access_token=([\w-]+)/);
	return !!match && match[1];
};
//check if the user has authenticated the app  and change the icon respectively
app.checkOauth = function() {
	app.token = app.extractToken(document.location.hash);
	app.documentLoc = document.location;
	if (app.token) {
		$("a.connect").html(
			`<i aria-hidden class="fas fa-sign-out-alt"/> Log Out`
		);
	} else {
		const authUrl =
			AUTHORIZATION_ENDPOINT +
			"?client_id=" +
			CLIENT_ID +
			"&response_type=token" +
			"&redirect_uri=" +
			window.location;

		$("a.connect")
			.attr("href", authUrl)
			.html(`<i aria-hidden class="fas fa-sign-in-alt"/> Log In`);
	}
};
//sweet alert pop up a modal, waiting for a parameter to display in the modal
app.sweetAlert = function(text) {
	Swal.fire({
		title: "oops",
		background: "#fffaf4",
		text: text,
		confirmButtonText: "OK",
		confirmButtonColor: "#0f0a05"
	});
};
//show the up arrow button after 900 pixels away from the top of the app
//when users click the button, the app scrolls back to the header
app.upArrowButton = () => {
	const $upButton = $(".arrowUp");
	$(window).scroll(() => {
		if ($(window).scrollTop() > 900) {
			$upButton.css({
				display: "block"
			});
		} else {
			$upButton.css({
				display: "none"
			});
		}
	});
	$upButton.on("click", function(e) {
		$("html, body").animate(
			{
				scrollTop: $("header").offset().top
			},
			1200
		);
	});
};
//calculate the end time including its date (and check if it exceeds the current month of start date)
app.getTime = function(startTime, duration, startDate) {
	//deal with start date
	const dateArr = startDate.split("-");
	const monthNum = parseInt(dateArr[1]);
	let monthWord = app.monthArr[monthNum - 1][0];
	const startTimeString = `${monthWord} ${dateArr[2]}, ${
		dateArr[0]
	}, ${startTime}`;
	//deal with start date, convert it to milliseconds
	const startTimeArr = startTime.split(":");
	const hour = parseInt(startTimeArr[0]);
	const minutes = parseInt(startTimeArr[1]);
	const startTimeMls = hour * 60 * 60 * 1000 + minutes * 60 * 1000;
	//calculate the end time and date
	const endTimeMls = startTimeMls + duration;
	const multiplierOfDay = Math.floor(endTimeMls / (1000 * 60 * 60 * 24));
	let endDate = parseInt(dateArr[2]) + multiplierOfDay;
	const endHours = parseInt(
		(endTimeMls % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
	);
	const endMinutes = parseInt((endTimeMls % (1000 * 60 * 60)) / (1000 * 60));
	//type out the date in string for a uniform looking of time
	let endTimeString2 = endHours < 10 ? `0${endHours}:` : `${endHours}:`;
	let endTimeString3 = endMinutes < 10 ? `0${endMinutes}` : `${endMinutes}`;
	//check if the end date falls in the next months
	//ignore the very edges cases, eg: the event lasted for two months...
	if (endDate > app.monthArr[monthNum - 1][1]) {
		monthWord = app.monthArr[monthNum][0];
		endDate -= app.monthArr[monthNum - 1][1];
	} else if (multiplierOfDay === 0) {
		endDate = dateArr[2];
	}
	const endTimeString1 = `${monthWord} ${endDate}, ${dateArr[0]}, `;
	//return start and end time strings for later use
	return [startTimeString, endTimeString1, endTimeString2, endTimeString3];
};
//get user's input in the search bars and make api calls by calling app.apiCall
app.getUserInput = function() {
	$(".userInput").on("submit", function(e) {
		e.preventDefault();
		const $queryInput = $("#queryInput");
		const $locationInput = $("#locationInput");
		app.queryInput = $queryInput.val().trim();
		app.locationInput = $locationInput.val().trim();
		//empty the search bars after users submit the search form
		$queryInput.val("");
		$locationInput.val("");
		app.checkOauth();
		//define a parameter object as an app property for the api call towards events endpoints
		if (app.token) {
			app.paramsForApiCall = {
				url: RESOURCE_ENDPOINT,
				dataType: "json",
				method: "GET",
				data: {
					key: "18569772d776f354c166e3a335b443c",
					// access_token: app.token,
					page: 12,
					fields: "plain_text_no_images_description,photo_album"
				}
			};
			//scroll down the page after the api call brings data back
			async function scrollDownApi() {
				const status = await app.apiCall();
				if (status) {
					$("html, body").animate(
						{
							scrollTop: $("main").offset().top + 10
						},
						2000
					);
				}
			}
			scrollDownApi();
		} else {
			app.sweetAlert("please log in to use search😓");
		}
	});
};
// check if users' input is empty string or made up by pure spaces
app.regexCheck = function(string) {
	if (string !== "" && !/^\s*$/.test(string)) {
		return true;
	} else {
		return false;
	}
};
//calling api end point conditionally
app.apiCall = async function() {
	//if there is a location input, callin the location endpoints first to get the latitude and longitute stored in the db
	if (app.regexCheck(app.locationInput)) {
		app.apiCallLocation();
		//if there is only query input, change the value of the params object and pass the object to ajax call.
	} else if (app.regexCheck(app.queryInput)) {
		app.paramsForApiCall.data.text = app.queryInput;
		app.apiCallEvents(app.paramsForApiCall);
		//if users haven't typed in anything for location or keyword, call the events endpoint directly, it will return events data based on user' account's location settings and preference
	} else {
		app.apiCallEvents(app.paramsForApiCall);
	}
	return true;
};
//call the location endpoints for lon and lat information, then call the events endpoints conditionally
app.apiCallLocation = function() {
	$.ajax({
		url: LOCATIONS_ENDPOINT,

		dataType: "json",
		method: "GET",
		data: {
			query: app.locationInput,
			key: "18569772d776f354c166e3a335b443c"
			// access_token: app.token
		}
	})
		.then(res => {
			//if the api returns some data, take the first location data and store it in the app object.
			if (res.length) {
				app.locationInfo = {
					lon: res[0].lon,
					lat: res[0].lat
				};
			}
			//since events endpoints doesn't require lon and lat, even the first api call to location endpoints fails, app can call the events endpoint
			//if users type in a keyword, change the params object property values.
			if (app.regexCheck(app.queryInput)) {
				app.paramsForApiCall.data.text = app.queryInput;
				app.paramsForApiCall.data.lon = app.locationInfo.lon;
				app.paramsForApiCall.data.lat = app.locationInfo.lat;
				app.apiCallEvents(app.paramsForApiCall);
			} else {
				app.paramsForApiCall.data.lon = app.locationInfo.lon;
				app.paramsForApiCall.data.lat = app.locationInfo.lat;
				app.apiCallEvents(app.paramsForApiCall);
			}
		})
		.fail(err => {
			app.sweetAlert(
				"Sorry, we cannot get data now😢, please retry it later"
			);
		});
	return true;
};
//call the events endpoint (token needed) and store the data coming back from the api, waiting a parameter object
app.apiCallEvents = function(params) {
	$.ajax(params)
		.then(res => {
			if (res.events.length) {
				const newArray = [...res.events];
				app.eventsArray = [...newArray];
				app.htmlStringMaking(app.eventsArray);
				//if api call succeeds but no data comes back, render an alert for users.
			} else {
				app.sweetAlert("no events there...please check your input😓");
			}
		})
		//render and alert when api call fails.
		.fail(err => {
			app.sweetAlert(
				"Sorry, we cannot get data now😢, please retry it later"
			);
		});
};
//display the data coming back from the api on the page.
app.htmlStringMaking = function(array) {
	const $wrapper = $(".wrapper");
	$wrapper.empty();
	const $resultWrapper = $("<div>").addClass(
		"resultWrapper d-flex flex-row justify-content-between flex-wrap"
	);
	array.forEach((item, i) => {
		const { duration, group, link, local_date, local_time, name } = item;
		//create smaller html parent elements on the page
		const $card = $("<div>").addClass("card");
		const $basicInfo = $("<div>").addClass("basicInfo");
		const $cardText = $("<div>").addClass("card-text");
		const $eventDetails = $("<div>").addClass("eventDetails");
		//create children elements using api data and append them to the parent elements
		//event name and organizer
		const $eventName = $(`<h3> ${name}</h3>`).addClass(
			"eventName card-title"
		);
		const $organizer = $(`<h4>organanized by ${group.name}</h4>`).addClass(
			"card-subtitle text-muted"
		);
		$basicInfo.append($eventName, $organizer);
		//event date and time
		const timeStringArr = app.getTime(local_time, duration, local_date);
		const $eventTime = $(
			`<div><p><span>Start at</span> ${
				timeStringArr[0]
			}</p><p><span>Ends at</span> ${timeStringArr[1]}${
				timeStringArr[2]
			}${timeStringArr[3]}</p></div>`
		)
			.addClass("eventTime")
			.prepend("<p class='questionWord'>When</p>");
		//event venue, some objects in the data array don't have it
		if (item.venue !== undefined) {
			const { name, address_1, city, country } = item.venue;
			const $eventVenue = $(
				`<div><p>${name}-${address_1}</p><p>${city}, ${country
					.charAt(0)
					.toUpperCase() + country.slice(1)}</p></div>`
			)
				.addClass("eventVenue")
				.prepend("<p class='questionWord'>Where</p>");
			$eventDetails.append($eventVenue);
		}
		//event description, not every event has it.
		if (item.description !== undefined) {
			const wordNumbers = item.description.trim().split(/\s+/).length;
			//cutstring function. Average english word length is 4.5 letters, take it as 4 letters for a better layout
			const cutString = oldStr => {
				return `${oldStr.substring(0, 280)}...`;
			};
			//check the length of the description, if it is very long, it's better to see it in a single modal and add a button on the page for user to open the modal.
			if (wordNumbers > 70) {
				const newStr = cutString(item.description);
				const $description = $(`<div>${newStr}</div>`)
					.addClass("description truncated")
					.prepend("<p class='questionWord'>What to do</p>");
				const $readMoreBtn = $(
					`<button type='button'>Read More</button>`
				)
					.addClass("readMoreBtn btn btn-outline-secondary")
					.attr({
						"data-toggle": "modal",
						"data-target": `#detailModal${i}`
					});
				$eventDetails.append($description, $readMoreBtn);
			} else {
				const $description = $(`<div>${item.description}</div>`)
					.addClass("description")
					.prepend("<p class='questionWord'>What to do</p>");
				$eventDetails.append($description);
			}
			//button for users to register for the event
			const $registerBtn = $(
				`<a target="_blank" href="${link}">Register It</a>`
			).addClass("readMoreBtn btn btn-outline-info");
			$eventDetails.append($registerBtn);
		}
		//if the event details including its venue and description are only available for the group members, provide a link to the event page at the Meetup.com
		if (
			item.visibility === "public_limited" &&
			item.venue === undefined &&
			item.description === undefined
		) {
			const $findMore = $(
				`<p>More details about the event are only available for the group members. Please find more infomation at <a target="_blank" href="${link}">Meetup.com</a></p>`
			).addClass("findMore");
			$eventDetails.append($findMore);
		}
		$cardText.append($eventTime, $eventDetails);
		$card.append($basicInfo, $cardText);
		//save description text in modals
		const $detailModal = $(
			`<div class="modal fade w-80" id="detailModal${i}" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">`
		).attr({
			"data-urlname": group.urlname,
			"data-groupname": group.name,
			"data-modalnum": i
		});
		const modalHtmlString = `<div class="modal-dialog" role="document">
									<div class="modal-content">
										<div class="modal-header">
											<h5 class="modal-title" id="exampleModalLabel">${name}</h5>
											<button type="button" class="close" data-dismiss="modal" aria-label="Close">
											<span aria-hidden="true">&times;</span>
											</button>
										</div>
										<div class="modal-body">
											<div class="groupImgWrapper"></div>
											${item.description}
										</div>
										<div class="modal-footer">
											<button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
										</div>
									</div>
								</div>`;
		$detailModal.append(modalHtmlString);
		$resultWrapper.append($card, $detailModal);
		$wrapper.append($resultWrapper);
	});
};
//trigger an api call towards photo endpoints sending the organizing group urlname and show an image in the modal popping up before description text if there are any photos
//if search photo by event id, most of time there are no photos.
app.modalCallback = function() {
	$(document).on("show.bs.modal", ".modal", function(e) {
		const { urlname, groupname, modalnum } = $(this).data();
		$.ajax({
			url: IMAGE_ENDPOINT,
			dataType: "json",
			method: "GET",
			data: {
				group_urlname: urlname,
				page: 20,
				key: "18569772d776f354c166e3a335b443c"
				// access_token: app.token
			}
		})
			.then(res => {
				if (res.results.length) {
					const imgLink = res.results[0]["highres_link"];
					const $imgForGroup = $(
						`<img src="${imgLink}" alt="picture of the organizer group ${groupname}"/>`
					);
					$(`#detailModal${modalnum} .groupImgWrapper`).html(
						$imgForGroup
					);
				}
			})
			.fail(err => {});
	});
};
app.init = function() {
	app.checkOauth();
	app.getUserInput();
	app.upArrowButton();
	app.modalCallback();
};

$(function() {
	app.init();
});
