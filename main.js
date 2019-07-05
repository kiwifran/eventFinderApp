console.log("linked");
$(function() {
	const extractToken = function(hash) {
		const match = hash.match(/access_token=([\w-]+)/);
		return !!match && match[1];
	};

	const CLIENT_ID = "jv9jh96u6125utc2bmb2p8inps";
	const AUTHORIZATION_ENDPOINT = "https://secure.meetup.com/oauth2/authorize";
	const RESOURCE_ENDPOINT = "https://api.meetup.com/find/upcoming_events";

	const token = extractToken(document.location.hash);
	if (token) {
		// $("div.authenticated").show();
        console.log(token);
        
		// $("span.token").text(token);

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
					lon: -73.98999786376953,
                    lat: 40.75,
                    "access_token":token
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
			AUTHORIZATION_ENDPOINT + "?client_id=" + CLIENT_ID + "&response_type=token" + "&redirect_uri=" +
			window.location;

		$("a.connect").attr("href", authUrl);
	}
});
