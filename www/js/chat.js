define(function(require){

require(["http://rangatrade.com/socket.io/socket.io.js"],function(io){
var $ = require('zepto');
var Mustache = require('lib/mustache-wrap');
var socket = io.connect("http://rangatrade.com");
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
			var sendr = $("#user").html();
			var mess = $("#message").val();
			var line = {sender: sendr, message: mess};
			socket.emit("receive", line);
			$("#message").val("");
		}
	});
	socket.on("linkchange", function(data) {
		var view = Mustache.to_html(tmpl, data);
		$("#iframe-content").html(view);
	});
        newfunc = function(){
			var mess = $("#link").val();
			var line = {link: mess};
			socket.emit("reqchange", line);
			$("#link").val("");
	}

    });
});
});
