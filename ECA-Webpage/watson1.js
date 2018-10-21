var http = require('http');
var fs = require('fs');
var qs = require('queryString');

var AssistantV1 = require('watson-developer-cloud/assistant/v1');
var watsonAssistant = new AssistantV1 ({
	version :'2018-10-19',
	username:'bca0c725-6072-4072-8a72-6c7e4593f0c3',
	password:'RTHZoOIlg52V',
	url:'https://gateway.watsonplatform.net/assistant/api'
});
var port = 4000;
var host = 'localhost';
var LanguageTranslatorV3 = require('watson-developer-cloud/language-translator/v3');
var languageTranslator = new LanguageTranslatorV3({
	  version: '2018-05-01',
	  iam_apikey: '0jTBvJC_AAl2Fv--TBJZ5ryg9aYYJhSrc4bRaklGtE0k',
	  url: 'https://gateway.watsonplatform.net/language-translator/api',
	  model_id: 'en-es'
	});

var server = http.createServer(function(req,res) {
	res.writeHead(200, {
		"Content-type":"text/html"
	});
	read(res, "./chat_bot_head.html", false);
	if(req.url =="/chatbot" && req.method == "POST") {
		//parsing the form data
		var body ="";
		req.on('data', function(c){ body+= c; });
		req.on('end', function() {
			var data = qs.parse(body);
			var message = data ['chatbox'];
			var parmsId = {
				'text': data['chatbox'],
			};
			//var lang_request = data['langreq'];
			const DEFAULT_LANG = 'en';
			//var langId;
			//identify language
			languageTranslator.identify(
				parmsId, function(error, response){
					if(error)
						console.log(error);
					else{
						var langId = response.languages[0].language;
						console.log(langId);

						var parms = {
							'text': data['chatbox'],
							'model_id':langId + '-' +DEFAULT_LANG
						};

						if (langId!=DEFAULT_LANG){
							console.log(parms.model_id);

							languageTranslator.translate(
								parms,
								function(error, response){
									if (error){
										console.log(error);
									}
									else{
										var message = response.translations[0].translation;
										console.log(message);
										var paramsW = {
											workspace_id: '2040d01e-71b5-4385-8a81-3e118fffd208',
											input: {'text': message}
										};

										watsonAssistant.message(paramsW,
											function(err, response){
												if(err){
													console.log('error:', err);	
												}
												else{
													var paramsOut = {
															'text': response.output["text"][0],
															'model_id':DEFAULT_LANG + '-' + langId											
													}
													languageTranslator.translate (paramsOut, 
														function (error, response) {
															if (error){
																console.log(error);
																}
															else{
																var html = "<script>";
																html += "document.getElementById(\"response\").value = \""+response.translations[0].translation+"\";";
																html += "document.getElementById(\"chatbox\").value = \""+data["chatbox"]+"\";</script>";
																res.write(html);
														}
													});
													

												}
											});
										
										}
									});
								}
								else if (langId == 'en') {
										var message = data["chatbox"];
										console.log(message);
										var paramsW = {
											workspace_id: '2040d01e-71b5-4385-8a81-3e118fffd208',
											input: {'text': message}
										};

										watsonAssistant.message(paramsW,
											function(err, response){
												if(err){
													console.log('error:', err);	
												}
												else{
													console.log(response.output["generic"][1]["options"]);
													var html = "<script>";
													html += "document.getElementById(\"response\").value = \""+response.output["text"][0]+" ";
													html += response.output["generic"][1]["title"];
													html += response.output["generic"][1]["options"][0]["label"]+", "+response.output["generic"][1]["options"][1]["label"]+"\";";
													html += "document.getElementById(\"chatbox\").value = \""+data["chatbox"]+"\";</script>";
													console.log(html);
													res.write(html);

												}
											});
								}

						}
					});
				});
		}
		read(res, "./chat_bot.html", true);
	});


server.listen(port, host, function() {console.log(`Listening at http://${ host }:${ port }`)});

function read(res, filename, end) {
	fs.readFile(filename, 'utf8', function(err, data){
		res.write(data);
		//if (end) res.end();
	});
}

