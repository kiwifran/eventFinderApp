const app ={};
import {
	CLIENT_ID,
	AUTHORIZATION_ENDPOINT,
	RESOURCE_ENDPOINT,
	LOCATIONS_ENDPOINT
} from "./scripts/apiInfo.js";
app.locationInfo={};

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
						access_token: app.token
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
				access_token: app.token
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
				app.eventsArray=[newArray];
				console.log(app.eventsArray);
				
			}else {
				app.sweetAlert("no events there...maybe check your input please😓")
			}
		}).fail(err=>{
			console.log(err);
		})
	// $.ajax({
	// 	url: "http://proxy.hackeryou.com",
	// 	dataType: "json",
	// 	method: "GET",
	// 	data: {
	// 		reqUrl: RESOURCE_ENDPOINT,
	// 		params: {
	// 			// lon: -73.98999786376953,
	// 			// lat: 40.75,
	// 			lon: app.locationInfo.lon,
	// 			lat: app.locationInfo.lat,
	// 			text: app.queryInput,
	// 			access_token: app.token
	// 		},

	// 		xmlToJSON: false,
	// 		useCache: false
	// 	}
	// })
	// 	.then(res => {
	// 		console.log(res);
	// 		console.log("happy");
	// 	})
	// 	.fail(err => {
	// 		console.log(err);
	// 	});

	
}


	


$(function() {
	app.checkOauth();
	app.getUserInput();
});
