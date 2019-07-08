const app ={};
import {
	CLIENT_ID,
	AUTHORIZATION_ENDPOINT,
	RESOURCE_ENDPOINT,
	LOCATIONS_ENDPOINT,
	IMAGE_ENDPOINT
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
						page:12,
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
		background: "#fffaf4",
		text: text,
		confirmButtonText: "OK",
		confirmButtonColor: "#0f0a05"
	});
}
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
			console.log(res, res.events.length);
			console.log(res.events.filter(i=> i.status==="upcoming").length);
			
			if(res.events.length){
				const newArray = [...res.events];
				app.eventsArray=[...newArray];
				console.log(app.eventsArray);
				app.htmlStringMaking(app.eventsArray);
			}else {
				app.sweetAlert("no events there...maybe check your input please😓")
			}
		}).fail(err=>{
			app.sweetAlert("Sorry, we cannot get data now😢, please retry it later");	
			})
}
app.htmlStringMaking=function (array) {
	console.log("html String");
	const $wrapper = $(".wrapper");
	$wrapper.empty();
	const $resultWrapper = $("<div>").addClass("resultWrapper d-flex flex-row justify-content-between flex-wrap");
	array.forEach((item, i)=>{
		const {duration, group, id, link, local_date, local_time, name}=item;
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
				`<div><p>${name}-${address_1}</p><p>${city}, ${country.charAt(0).toUpperCase() + country.slice(1)}</p></div>`
			)
				.addClass("eventVenue")
				.prepend("<p class='questionWord'>Where</p>");
			$eventDetails.append($eventVenue);
		}
		if(item.description!==undefined) {
			const letterNumbers = item.description.trim().split(/\s+/).length;
			console.log(letterNumbers);
			//average english word length is 4.5 letters, take is as 5 letters.
			const cutString = (oldStr) => {
				return oldStr.substring(0, 270)+" ...";
			}
			// console.log(letterNumbers);
			if(letterNumbers>80) {
				const newStr = cutString(item.description);
				const $description = $(`<div>${newStr}</div>`)
					.addClass("description truncated")
					.prepend(
						"<p class='questionWord'>What to do</p>"
					);;
				const $readMoreBtn = $(
					`<button type='button'>Read More</button>`
				).addClass(
					"readMoreBtn btn btn-outline-secondary"
				).attr({
					"data-toggle":"modal",
					"data-target":`#detailModal${i}`
				})
				$eventDetails.append($description, $readMoreBtn)

				
			}else {
				const $description = $(`<div>${item.description}</div>`).addClass(
					"description"
				).prepend("<p class='questionWord'>What to do</p>");
				$eventDetails.append($description);
			}
			const $registerBtn = $(
				`<a target="_blank" href="${link}">Register It</a>`
			).addClass("readMoreBtn btn btn-outline-info");
			$eventDetails.append($registerBtn);

		}
		if (
			item.visibility === "public_limited" &&
			item.venue === undefined &&
			item.description === undefined
		) {
			const $findMore = $(`<p>More details about the event are only available for the group members. Please find more infomation at <a target="_blank" href="${link}">Meetup.com</a></p>`).addClass("findMore")
			$eventDetails.append($findMore);
		}
		$cardText.append($eventTime, $eventDetails);
		$card.append($basicInfo, $cardText);
		const $detailModal = $(
			`<div class="modal fade w-80" id="detailModal${i}" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">`
		).attr({
			"data-urlname":group.urlname,
			"data-groupname":group.name,
			"data-modalnum":i
		})
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
	})
}
app.modalCallback = function () {
	$(document).on('show.bs.modal', '.modal', function(e) {
		console.log("modal fired");
		console.log($(this).data());
		
		const {urlname, groupname, modalnum} = $(this).data();		
		$.ajax({
			url: "http://proxy.hackeryou.com",
			dataType: "json",
			method: "GET",
			data: {
				reqUrl: IMAGE_ENDPOINT,
				params: {
					group_urlname:urlname,
					// access_token: app.token
					page:20,
				},
				xmlToJSON: false,
				useCache: false
			}
		})
			.then(res => {
				console.log(res);
				if(res.results.length) {
					const imgLink = res.results[0]["highres_link"];
					const $imgForGroup = $(`<img src="${imgLink}" alt="picture of the organizer group ${groupname}"/>`);
					$(`#detailModal${modalnum} .groupImgWrapper`).html($imgForGroup);
				}
			})
			.fail(err => {
				console.log("picture api call", err);
			});
	})
}
app.init=function () {
	app.checkOauth();
	app.getUserInput();
	app.upArrowButton();
	app.modalCallback();
}

$(function() {
	app.init();
});
