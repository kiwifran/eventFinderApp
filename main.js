const app ={};
import {
	CLIENT_ID,
	AUTHORIZATION_ENDPOINT,
	RESOURCE_ENDPOINT,
	LOCATIONS_ENDPOINT
} from "./scripts/apiInfo.js";
app.extractToken =function(hash) {
		const match = hash.match(/access_token=([\w-]+)/);
		return !!match && match[1];
	};
app.checkOauth = function () {
	app.token = app.extractToken(document.location.hash);
	if (app.token) {
		// $("div.authenticated").show();
		console.log(app.token);
		$("a.connect").text("logOut");
		// $("span.token").text(token);
		$.ajax({
			url: "http://proxy.hackeryou.com",
			dataType: "json",
			method: "GET",
			// beforeSend: function(xhr) {
			// 	xhr.setRequestHeader("Authorization", "OAuth " + token);
			// },
			data: {
				reqUrl: LOCATIONS_ENDPOINT,
				params: {
					// key: apiKey,
					query: "toronto",
					access_token: app.token
				},
				// proxyHeaders: {
				//     'Some-Header': 'goes here'
				// },
				xmlToJSON: false,
				useCache: false
			}
		}).then(res => {
			console.log(res);
			console.log("happy again");
		});
		$.ajax({
			url: "http://proxy.hackeryou.com",
			dataType: "json",
			method: "GET",
			// beforeSend: function(xhr) {
			// 	xhr.setRequestHeader("Authorization", "OAuth " + token);
			// },
			data: {
				reqUrl: RESOURCE_ENDPOINT,
				params: {
					// key: apiKey,
					// lon: -73.98999786376953,
					// lat: 40.75,
					access_token: app.token
				},
				// proxyHeaders: {
				//     'Some-Header': 'goes here'
				// },
				xmlToJSON: false,
				useCache: false
			}

			// success: function(response) {
			// 	var container = $("span.user");
			// 	if (response) {
			// 		container.text(response.username);
			// 	} else {
			// 		container.text("An error occurred.");
			// 	}
			// }
		})
			.then(res => {
				console.log(res);
				console.log("happy");
			})
			.fail(err => {
				console.log(err);
			});
	} else {
		// $("div.authenticate").show();
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
$(function() {
	app.checkOauth();
	// const extractToken = function(hash) {
	// 	const match = hash.match(/access_token=([\w-]+)/);
		
	// 	return !!match && match[1];
	// };

	// const CLIENT_ID = "jv9jh96u6125utc2bmb2p8inps";
	// const AUTHORIZATION_ENDPOINT = "https://secure.meetup.com/oauth2/authorize";
	// const RESOURCE_ENDPOINT = "https://api.meetup.com/find/upcoming_events";
	// const LOCATIONS_ENDPOINT ="https://api.meetup.com/find/locations";

	
});
