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
			app.paramsForApiCall1 = {
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
			Swal.fire({
				title: "oops",
				background: "#ffe438",
				text: "please log in to search",
				confirmButtonText: "OK",
				confirmButtonColor: "#349052"
			});
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

app.apiCall = async function() {
	if (app.regexCheck(app.locationInput)) {
		console.log("both");
		
		app.status = await app.apiCallLocation();
	}else if(app.regexCheck(app.queryInput)) {
		console.log("single");
		console.log(app.paramsForApiCall2);
		
		app.apiCallEvents(app.paramsForApiCall2);
	}else {
		app.apiCallEvents(app.paramsForApiCall1);
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
			app.paramsForApiCall3 = {
				url: "http://proxy.hackeryou.com",
				dataType: "json",
				method: "GET",
				data: {
					reqUrl: RESOURCE_ENDPOINT,
					params: {
						// lon: -0.1,
						// lat: 51.52,
						lon: app.locationInfo.lon,
						lat: app.locationInfo.lat,
						access_token: app.token
					},

					xmlToJSON: false,
					useCache: false
				}
			};
			app.paramsForApiCall4 = {
				url: "http://proxy.hackeryou.com",
				dataType: "json",
				method: "GET",
				data: {
					reqUrl: RESOURCE_ENDPOINT,
					params: {
						// lon: -0.1,
						// lat: 51.52,
						lon: app.locationInfo.lon,
						lat: app.locationInfo.lat,
						text: app.queryInput,
						access_token: app.token
					},

					xmlToJSON: false,
					useCache: false
				},

			};
			
		}
		console.log("happy again");
		if (app.regexCheck(app.queryInput)) {
			app.apiCallEvents(app.paramsForApiCall4);
		}else {
			app.apiCallEvents(app.paramsForApiCall3);
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
