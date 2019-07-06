const app ={};
import {
	CLIENT_ID,
	AUTHORIZATION_ENDPOINT,
	RESOURCE_ENDPOINT,
	LOCATIONS_ENDPOINT
} from "./scripts/apiInfo.js";
app.locationInfo={};
app.monthArr = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December"
];
app.extractToken =function(hash) {
		const match = hash.match(/access_token=([\w-]+)/);
		return !!match && match[1];
	};
app.checkOauth = function () {
	app.token = app.extractToken(document.location.hash);
	if (app.token) {
		console.log(app.token);
		$("a.connect").text("logOut");
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
			.text("logIN");
	}
}
app.getMonth =function (num) {
	const word = app.monthArr[num-1];
	return word;
}
app.getEndTime = function (startTime, duration, startDate) {
	console.log("duration", duration);
	const dateArr = startDate.split("-");
	console.log(dateArr);
	const monthNum = parseInt(dateArr[1]);
	const monthWord = app.getMonth(monthNum);
	console.log(monthWord);
	const startTimeArr = startTime.split(":");
	console.log(startTimeArr);
	const hour= parseInt(startTimeArr[0]);
	const minutes = parseInt(startTimeArr[1]);
	const durHour = Math.floor(duration / (1000*60*60));
	const durMinuteRem = Math.floor(duration % (1000*60*60) / (1000*60));
	// console.log(durHour, durMinuteRem);
	if (
		hour + durHour >= 24 ||
		(hour + durHour === 23 && minutes + durMinuteRem >= 60)
	) {
		const newDay = parseInt(dateArr[2]) + parseInt(duration/(1000*60*60*24));
		const endTime =  `${monthWord} ${newDay}, ${dateArr[0] }`
		console.log(endTime);
		
	} else if (minutes + durMinuteRem > 60) {
		const endTime = `${hour + durHour + 1}:${minutes +
			durMinuteRem -
			60}`;
		console.log(endTime);
		return endTime;
	} else if (minutes + durMinuteRem === 60) {
		const endTime = `${hour + durHour + 1}:0${minutes +
			durMinuteRem -
			60}`;
		console.log(endTime);
		return endTime;
	} else if (minutes + durMinuteRem === 0) {
		const endTime = `${hour + durHour}:0${minutes + durMinuteRem}`;
		console.log(endTime);
		return endTime;
	} else {
		const endTime = `${hour + durHour}:${minutes + durMinuteRem}`;
		console.log(endTime);

		return endTime;
	}
		
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
						// lon: -73.98999786376953,
						// lat: 40.75,
						access_token: app.token,
						page:20,
						fields: "plain_text_no_images_description"
					},
					xmlToJSON: false,
					useCache: false
				}
			};
			app.paramsForApiCall2 = {
				url: "http://proxy.hackeryou.com",
				dataType: "json",
				method: "GET",
				data: {
					reqUrl: RESOURCE_ENDPOINT,
					params: {
						// lon: -73.98999786376953,
						// lat: 40.75,
						text: app.queryInput,
						access_token: app.token
					},
					xmlToJSON: false,
					useCache: false
				}
			};
			app.apiCall();
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
		
		app.status = await app.apiCallLocation();
	}else if(app.regexCheck(app.queryInput)) {
		console.log("single");
		app.paramsForApiCall.data.params.text = app.queryInput;
		console.log(app.paramsForApiCall);
		
		
		app.apiCallEvents(app.paramsForApiCall);
	}else {
		app.apiCallEvents(app.paramsForApiCall);
	}


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
	
	const $resultWrapper = $(".resultWrapper");
	$resultWrapper.empty();
	array.forEach((item, i)=>{
		const {duration, group, link, local_date, local_time}=item;
		const $card = $("<div>").addClass("card");
		const $basicInfo = $("<div>").addClass("basicInfo");
		const $time = $("<div>").addClass("time");
		const $eventDetails = $("<div>").addClass("eventDetails")
		const $number = $(`<h3>${i}</h3>`).addClass("number");
		const $eventName = $(
			`<h4>${name} organanized by ${group.name}</h4>`
		).addClass("eventName");
		//haveto use the info in the array so not separate it out
		
		const $eventDate = $(
			// `<p>${monthWord} ${dateArr[2]}, ${dateArr[0]}</p>`
		).addClass("eventDate");
		app.getEndTime(local_time, duration, local_date);

		const $eventTime = $(`<p>${local_time} - ${duration}</p>`).addClass("eventTime")
		// const durationTime = 10850000/60000;
		// console.log(durationTime);
		$basicInfo.append($number, $eventName);
		$time.append($eventDate, $eventTime);
		if (
			item.visibility === "public" &&
			item.venue !== undefined &&
			item["description"]!==undefined
		) {
			const letterNumbers = item["plain_text_no_images_description"].trim().split(/\s+/).length;
			// console.log(letterNumbers);
			
			const { name, address_1, city, country } = item.venue;
			const $eventVenue = $(
				`<p>${name}</p><p>${address_1}</p><p>${city}-${country}</p>`
			).addClass("venue");
			const $description = $(
				`<div>${item["description"]}</div>`
			).addClass("description");
			$eventDetails.append($eventVenue, $description);
		} else if (
					item.visibility === "public" &&
					item["plain_text_no_images_description"] !==
						undefined
				) {
					const $description = $(
						`<p>${
							item[
								"plain_text_no_images_description"
							]
						}</p>`
					).addClass("description");
					$eventDetails.append(
						$description
					);
				}
		else {
			const $findMore = $(`<p>find more infomation on <a target="_blank" href=${link}>check it on Meetup.com</a></p>`)
			$eventDetails.append($findMore);
		}
		$card.append($basicInfo, $time, $eventDetails);
		$resultWrapper.append($card);
		
		// const $link = $(`<a target="_blank" href=${link}>check it on Meetup.com</a>`).addClass("link")
	})
}
app.scrollDown = function () {
	
}
app.goUp=function () {
	
}
app.init=function () {
	
}

$(function() {
	app.checkOauth();
	app.getUserInput();
});
