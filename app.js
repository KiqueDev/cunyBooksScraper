//SERVER SETUP
var express = require('express');
var path = require('path');
var http = require('http');
var jsdom = require('jsdom')
var request = require('request')
var url = require('url')
var app = express();

app.configure(function () {
  app.set('port', process.env.PORT || 3000);
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});
//CHECK ERROR if no doc number provided
app.get('/docNum/', function(req, res){
	res.send("Sorry, No Doc number provided!<br> Please enter a Doc Number.");
});

app.get('/docNum/:docNumber', function(req, res){
	console.log("DOC NUMBER:" ,req.params.docNumber);
	var docNumber = req.params.docNumber;

	//Tell the request that we want to fetch youtube.com, send the results to a callback function
	request({uri: 'http://apps.appl.cuny.edu:83/F/?func=direct&doc_number='+docNumber }, function(err, response, body){
		var self = this;
		self.items = new Array();//I feel like I want to save my results in an array
		
		//Just a basic error check
		if(err && response.statusCode !== 200){
			console.log('Request error.');
			return;
		}
		// Send the body param as the HTML code we will parse in jsdom
		// also tell jsdom to attach jQuery in the scripts and loaded from jQuery.com
		jsdom.env({
			html: body,
			scripts: ['http://code.jquery.com/jquery-1.10.1.min.js'],
			done: function(err, window){
				//Use jQuery just as in a regular HTML page
				var $ = window.jQuery;

				var jsonObj = {};
		    var img = '';
		    var callNum = '';
		    var author = '';
		    var title = '';
		    var edition = '';
		    var publisher = '';
		    var description = '';
		    var subjects = [];
		    var contents = '';
		    var elem = $(".td1");
		    //res.end(elem);
		    $(elem).each(function() {
		      var key = $.trim($(this).text());
		      //console.log($.trim($(this).text()));
		      switch(key){
		        case "More information":
		          img = $(this).next(".td1").children("a").children("img").attr("src");
		          console.log("IMG: ", img);
		          break;
		        case "Call numbers":
		          // callNum = $(this).next()[0].children[0].href;
		          // var urlVars = GetUrlVars(callNum);
		          // console.log(urlVars['doc_number']);
		          // console.log(callNum);
		          break;
		        case "Author":
		        	author = $.trim($(this).next(".td1").children("a").text());
		          //author = $.trim($(this).next()[0].children[1].innerHTML.replace(/[&]nbsp[;]/gi," ").replace(/\n/g,""));
		          console.log("Author: ",author);
		          break;
		        case "Title":
		          title = $.trim($(this).next(".td1").children("a").text());
		          console.log("Title: ", title);
		          break;
		        case "Contents":
		          contents = $.trim($(this).next(".td1").text());
		          console.log("Contents: ", contents);
		          break;
		        case "Publisher":
		          publisher = $.trim($(this).next(".td1").text());
		          console.log("Publisher: ", publisher);
		          break;
		      	case "Description":
		          description = $.trim($(this).next(".td1").text());
		          console.log("Description: ", description);
		          break;
		       	case "Subjects":
		       		//Push first subject Item
		       		subjects.push($.trim($(this).next(".td1").children("a").text()));
		       		var nextSubject = $(this).parent("tr");
		       		nextSubject = nextSubject.next("tr");

		       		var nextSubjectString = $.trim(nextSubject.children("td:eq(0)").text());
		       		var nextsubjectLength = nextSubjectString.length;
		       		while(nextsubjectLength == 0){
			       		subjects.push($.trim(nextSubject.children("td:eq(1)").text()));

			       		nextSubject = nextSubject.next("tr");
			       		nextSubjectString = $.trim(nextSubject.children("td:eq(0)").text());
			       		nextsubjectLength = nextSubjectString.length;
		       		}
		          console.log("Subjects: ", subjects);
		          break;
		      }
		    });
		    //SET JSON
		    jsonObj = [{
		    		img: img,
		    		call_number: callNum,
		    		title: title,
		    		author: author,
		    		publisher: publisher,
		    		description: description,
						subjects: subjects,
		    		contents: contents
		    	
		    }];
		    //console.log(jsonObj);
		    res.writeHead(200, { 'Content-Type': 'application/json;charset=utf-8' });
		   	res.write(JSON.stringify(jsonObj));
		    res.end();

			}
		});
	});
});


http.createServer(app).listen(app.get('port'), function () {
   console.log("Express server listening on port " + app.get('port'));
});

