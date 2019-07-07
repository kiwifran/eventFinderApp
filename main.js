const app ={};
import {
	CLIENT_ID,
	AUTHORIZATION_ENDPOINT,
	RESOURCE_ENDPOINT,
	LOCATIONS_ENDPOINT
} from "./scripts/apiInfo.js";
app.locationInfo={};
app.monthArr = [
	["January", 31],
	["February", 28],
	["March",31], 
	["April",30],
	["May",31],
	["June",30],
	["July",31],
	["August",31],
	["September",30],
	["October",31],
	["November",30],
	["December",31],
];
app.extractToken =function(hash) {
		const match = hash.match(/access_token=([\w-]+)/);
		return !!match && match[1];
	};
app.checkOauth = function () {
	app.token = app.extractToken(document.location.hash);
	if (app.token) {
		console.log(app.token);
		$("a.connect").html(`<i aria-hidden class="fas fa-sign-out-alt" /> Log Out`);
	} else {
		console.log("need authentication");
		const authUrl =
			AUTHORIZATION_ENDPOINT +
			"?client_id=" +
			CLIENT_ID +
			"&response_type=token" +
			"&redirect_uri=" +
			window.location;

		$("a.connect")
			.attr("href", authUrl)
			.html(`<i aria-hidden class="fas fa-sign-in-alt" /> Log In`);
	}
}

app.getTime = function (startTime, duration, startDate) {
	console.log("new event date");
	
	console.log("duration", duration);
	const dateArr = startDate.split("-");
	console.log(dateArr);
	const monthNum = parseInt(dateArr[1]);
	console.log(monthNum);	
	let monthWord = (app.monthArr)[monthNum - 1][0];
	const startTimeString = `${monthWord} ${dateArr[2]}, ${dateArr[0]}, ${startTime}`
	console.log("month", monthWord);
	const startTimeArr = startTime.split(":");
	console.log(startTimeArr);
	const hour= parseInt(startTimeArr[0]);
	const minutes = parseInt(startTimeArr[1]);

	const startTimeMls = hour * 60*60*1000 +minutes*60*1000;
	const endTimeMls = startTimeMls +duration;
	const multiplierOfDay = Math.floor(endTimeMls/(1000*60*60*24));
	let endDate = parseInt(dateArr[2]) +multiplierOfDay;
	const endHours = parseInt(
		(endTimeMls % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
	);
	const endMinutes = parseInt(
		(endTimeMls % (1000 * 60 * 60)) / (1000 * 60)
	);
	let endTimeString2 = endHours< 10? `0${endHours}:` : `${endHours}:`;
	let endTimeString3 = endMinutes<10? `0${endMinutes}`: `${endMinutes}`;

		if (endDate>app.monthArr[monthNum - 1][1]) {
			monthWord = app.monthArr[monthNum][0];
			endDate -= app.monthArr[monthNum - 1][1];
			console.log("endMinutes", endMinutes);
		}else if(multiplierOfDay === 0){
			endDate = dateArr[2];
		}
		const endTimeString1 = `${monthWord} ${endDate}, ${dateArr[0]}, `;
		console.log(startTimeString, endTimeString1, endTimeString2, endTimeString3);
		return ([startTimeString, endTimeString1, endTimeString2, endTimeString3]);
}
app.getUserInput = function() {
	$(".userInput").on("submit", function(e) {
		e.preventDefault();
		const $queryInput = $("#queryInput");
		const $locationInput = $("#locationInput");
		app.queryInput = $queryInput.val().trim();
		app.locationInput = $locationInput.val().trim();
		console.log(app.queryInput, app.locationInput);
		console.log("form Submitted");
		$queryInput.val("");
		$locationInput.val("");
		app.checkOauth();
		if (app.token) {
			app.paramsForApiCall = {
				url: "http://proxy.hackeryou.com",
				dataType: "json",
				method: "GET",
				data: {
					reqUrl: RESOURCE_ENDPOINT,
					params: {
						access_token: app.token,
						page:5,
						fields: "plain_text_no_images_description,photo_album"
					},
					xmlToJSON: false,
					useCache: false
				}
			};
			
			async function scrollDownApi() {
					const status = await app.apiCall();
					if (status) {
						$("html, body").animate(
							{
								scrollTop: $(
									"main"
								).offset().top + 10
							},
							2000
						);
					}
				}
				scrollDownApi();
		} else {
					app.sweetAlert(
						"please log in to use search😓"
					);
		}
	});
};
app.regexCheck = function (string) {
	if (string!=="" && !(/^\s*$/.test(string))) {
		return true
	}else{
		return false
	}
}
app.sweetAlert = function(text) {
	Swal.fire({
		title: "oops",
		background: "#ffe438",
		text: text,
		confirmButtonText: "OK",
		confirmButtonColor: "#349052"
	});
}
app.apiCall = async function() {
	if (app.regexCheck(app.locationInput)) {
		console.log("both");
		
		app.apiCallLocation();
	}else if(app.regexCheck(app.queryInput)) {
		console.log("single");
		app.paramsForApiCall.data.params.text = app.queryInput;
		console.log(app.paramsForApiCall);
		
		
		app.apiCallEvents(app.paramsForApiCall);
	}else {
		app.apiCallEvents(app.paramsForApiCall);
	}

	return true
	// app.result = await app.apiCallEvents(app.paramsForApiCall3);
};
app.apiCallLocation =function () {
	$.ajax({
		url: "http://proxy.hackeryou.com",
		dataType: "json",
		method: "GET",
		data: {
			reqUrl: LOCATIONS_ENDPOINT,
			params: {
				query: app.locationInput,
				// access_token: app.token
			},
			xmlToJSON: false,
			useCache: false
		}
	}).then(res => {
		console.log(res);
		if (res.length) {
			app.locationInfo = {
				lon:res[0].lon,
				lat:res[0].lat
			};
			console.log(app.locationInfo, (typeof(app.locationInfo.lon)));
			
			console.log(app.locationInfo.lon, app.locationInfo.lat);
			
		}
		console.log("happy again");
		if (app.regexCheck(app.queryInput)) {
			app.paramsForApiCall.data.params.text=app.queryInput
			app.paramsForApiCall.data.params.lon = app.locationInfo.lon;
			app.paramsForApiCall.data.params.lat = app.locationInfo.lat;
			console.log(app.paramsForApiCall);
			
			app.apiCallEvents(app.paramsForApiCall);
		}else {
			app.paramsForApiCall.data.params.lon =
				app.locationInfo.lon;
			app.paramsForApiCall.data.params.lat =
				app.locationInfo.lat;
			app.apiCallEvents(app.paramsForApiCall);
		}
		
	}).fail(err=>{
		console.log(err)
	})
	return true;
}
app.apiCallEvents =function (params) {
	console.log("triggered");
	
		$.ajax(params).then(res=>{
			console.log(res);
			if(res.events.length){
				const newArray = [...res.events];
				app.eventsArray=[...newArray];
				console.log(app.eventsArray);
				app.htmlStringMaking(app.eventsArray);
			}else {
				app.sweetAlert("no events there...maybe check your input please😓")
			}
		}).fail(err=>{
			console.log(err);
		})
}
app.htmlStringMaking=function (array) {
	console.log("html String");
	const $resultWrapper = $("<div>").addClass("resultWrapper");
	$resultWrapper.empty().addClass("d-flex flex-row justify-content-between flex-wrap");
	array.forEach((item, i)=>{
		const {duration, group, link, local_date, local_time, name}=item;
		const $card = $("<div>").addClass("card");
		const $basicInfo = $("<div>").addClass("basicInfo");
		const $cardText= $("<div>").addClass("card-text");		
		const $eventDetails = $("<div>").addClass("eventDetails")
		const $number = $(`<h3>${i+1}</h3>`).addClass("number");
		const $eventName = $(
			`<h3> ${name}</h3>`
		).addClass("eventName card-title");
		const $organizer = $(
			`<h4>organanized by ${group.name}</h4>`
		).addClass("card-subtitle text-muted");
		$basicInfo.append( $eventName, $organizer);
		//haveto use the info in the array so not separate it out
		const timeStringArr = app.getTime(
			local_time,
			duration,
			local_date
		);
		const $eventTime = $(
			`<div><p><span>Start at</span> ${
				timeStringArr[0]
			}</p><p><span>Ends at</span> ${timeStringArr[1]}${
				timeStringArr[2]
			}${timeStringArr[3]}</p></div>`
		)
			.addClass("eventTime")
			.prepend("<p class='questionWord'>When</p>");
		if(item.venue!==undefined) {
			const { name, address_1, city, country } = item.venue;
			const $eventVenue = $(
				`<div><p>${name}-${address_1}</p><p>${city}-${country}</p></div>`
			)
				.addClass("eventVenue")
				.prepend("<p class='questionWord'>Where</p>");
			$eventDetails.append($eventVenue);
		}
		if(item.description!==undefined) {
			const $description = $(
				`<div>${item.description}</div>`
			).addClass("description");
			const letterNumbers = item["plain_text_no_images_description"].trim().split(/\s+/).length;
			// console.log(letterNumbers);
			if(letterNumbers>120) {
				$description.addClass("truncated");
				const $readMoreBtn = $(
					"<button>Read More</button>"
				).addClass(
					"readMoreBtn btn btn-outline-secondary"
				);
				
				$readMoreBtn.insertAfter($description)
	
			}
			$eventDetails.append($description);
		}
		// if (
		// 	item.visibility === "public" &&
		// 	item.venue !== undefined &&
		// 	item["description"]!==undefined
		// ) {
			
		// 		} else if (
		// 			item.visibility === "public" &&
		// 			item["plain_text_no_images_description"] !==
		// 				undefined
		// 		) {
		// 			const $description = $(
		// 				`<p>${
		// 					item[
		// 						"plain_text_no_images_description"
		// 					]
		// 				}</p>`
		// 			).addClass("description");
		// 			$eventDetails.append(
		// 				$description
		// 			);
		// 		}
		if (
			item.visibility === "public_limited" &&
			item.venue === undefined &&
			item["description"] === undefined
		) {
			const $findMore = $(`<p>Find more infomation on <a target="_blank" href="${link}">Meetup.com</a></p>`).addClass("findMore")
			$eventDetails.append($findMore);
		}
		$cardText.append($eventTime, $eventDetails);
		$card.append($basicInfo, $cardText);
		$resultWrapper.append($card);
		$("main").append($resultWrapper);
		// const $link = $(`<a target="_blank" href=${link}>check it on Meetup.com</a>`).addClass("link")
	})
}

app.goUp=function () {
	
}
app.init=function () {
	
}

$(function() {
	app.checkOauth();
	app.getUserInput();
});
