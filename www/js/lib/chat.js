define(function(require){

require(["js/lib/socket-io-wrap.js"],function(io){
var $ = require('zepto');
var Mustache = require('mustache');
var socket = io.connect("http://rangatrade.com:80");
var tmpl = "<iframe src='{{link}}'></iframe>";
var newfunc;
$(document).ready(function() {
	socket.on("groupChat", function(data) {
		var tmpl = "<p>{{sender}} : {{message}}</p>"
		var html = Mustache.to_html(tmpl, data);
		$("#chatstream").append(html);
	});
	$("#send").click(function() {
		if($("#message").val()!="") {
			var sendr = "karthik";//$("#user").html();
			var mess = $("#message").val();
			var line = {sender: sendr, message: mess};
			socket.emit("receive", line);
			$("#message").val("");
		}
	});
	socket.on("linkchange", function(data) {
		var view = Mustache.to_html(tmpl, data);
                $('#iframee').attr('src',data.link);
                $('#iframee').attr('src', $('#iframee').attr('src'));
		//$("#iframe-content").html("").html(view);
	});
        
        $('#share').click(function(){
		var mess = $("#link").val();
		var line = {link: mess};
		socket.emit("reqchange", line);
		$("#link").val("");
	});

    });
});
});
