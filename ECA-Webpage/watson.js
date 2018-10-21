var http = require('http');
var fs = require('fs');
var qs = require('queryString');

var AssistantV1 = require ('watson-developer-cloud/assistant/v1');
var watsonAssistant = new AssistantV1 ({
	version: '2018-10-19',
	username: 'bca0c725-6072-4072-8a72-6c7e4593f0c3',
	password: 'RTHZoOIlg52V',
	url: 'https://gateway.watsonplatform.net/assistant/api'
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

var server = http.createServer(function(req, res) {
	res.writeHead(200, {
	    "Content-Type": "text/html"
	  });
	 read(res, "./chat_bot_head.html", false);
	 if( req.url == "/chatbot" && req.method=="POST") {
	 	// parsing the form data
   	   var body="";
   	   req.on('data', function(c){ body+=c; });
   	   req.on('end', function(){ 
   	   var data=qs.parse(body);
   	   var message = data ['chatbox'];
   	   var parmsId = {
	   	   	'text': data ['chatbox']
	   	   };
	   	   //var  lang_request = data ['langreq'];
	   	   const DEFAULT_LANG = 'en';
	   	   var langId;
	   	   //identify langauge
	   	   	   	 languageTranslator.identify(
 				 parmsId, function(error, response) {
	    			if (error)
	      				console.log(error);
	   				 else {
	     				langId = response.languages[0].language;
	     				console.log(langId);
	     				//if (lang_request.length != 2) {
		   	   			//	lang_request = DEFAULT_LANG;
		   	   			//}
		   	   			//translate
						var parms = {
				  			'text': data['chatbox'],
				  			'model_id': langId+'-'+DEFAULT_LANG
							};
						//CONTINUE FROM HERE
						if (langId!=DEFAULT_LANG){
						console.log (parms.model_id);
	   	   				// end parsing the form data
			   			languageTranslator.translate(
				  			parms,
				  			function (error, response) {
				    			if (error)
				      				console.log(error);
							    else {
							    		var message = response.translations[0].translation;
							    		var paramsW = {
										  workspace_id: '2040d01e-71b5-4385-8a81-3e118fffd208',
										  input: {'text': message}
										};
							    		watsonAssistant.message(paramsW,  
								   	   	function(err, response) {
										  if (err)
										    console.log('error:', err);
										  else {
										  	var html = "<script>";
										  	html += "document.getElementById(\"response\").value = "+response.text+";";
										  	html += "document.getElementById(\"chatbox\").value = "+data["chatbox"]+"</script>;";
										    }//console.log(JSON.stringify(response, null, 2));
										});

								      //var html = "<script>alert('" + response.translations[0].translation + "');</script>"
								      //console.log(html); 
								      //res.write(html);
								      //Pass to Watson
								      //html += "<script>alert(Date.now());</script>";
								      //console.log(html); 
								      res.write(html);
						      	  };
							});
						  }
						 }	
		});
	read(res, "./index.html", true);
	//res.end();
});



		function read( res, filename, end )
		{
				fs.readFile(filename, 'utf8', function(err, data) {
			      res.write(data);
			  });
		}
	 }

function read( res, filename, end )
{
		fs.readFile(filename, 'utf8', function(err, data) {
	      res.write(data);
	  });
}

server.listen(port, host, function() {
  console.log("Listening at http://${ host }:${ port }");
});