define(function(require){

require(["js/lib/socket-io-wrap.js"],function(io){
var $ = require('zepto');
//var anim = require('lib/layouts/anim.js')
var Mustache = require('mustache');
var socket = io.connect("http://rangatrade.com:80");
var tmpl = "<iframe src='{{link}}'></iframe>";
var list = "{{#rlist}}<option>{{.}}</option>{{/rlist}}";
var roomname = null;
$(document).ready(function() {
    $("#nick").focus();
    $('enterRoom').hide();
	socket.emit('listroom', {});
	socket.on('listroom', function(data) {
		var rooms = Mustache.to_html(list, data);
		$('#list').html(rooms);
	});

	$("#suButton").click(function(e) {
        e.preventDefault();
		if($('#cRoom').val()) {
			var data = {};
			data.room = $('#cRoom').val();
			socket.emit('createroom', data);
			$('#cRoom').val('');
		}
	});
    
    $('#list').change(function() {
        var data = {};
        data.room = $('#list').val();
        data.key = key;
        data.nick = nick;
        if(roomname) {
            var roomdata = {};
            roomdata.room = roomname;
            socket.emit('leaveroom', roomdata);
        }
        socket.emit('joinroom',data);
        socket.once('joinroom', function(data) {
            $('#chatstream').html('');
            $('#iframee').attr('src','');
            $('#url').html('');
            roomname = $('#list').val();
            $('#enterRoom').show();
        });
    });


	socket.on("groupChat", function(data) {
		var tmpl = "<p class='arrow_box'>{{sender}} : {{message}}</p>"
		var html = Mustache.to_html(tmpl, data);
		$("#chatstream").append(html);
	});
	$("#send").click(function() {
		if($("#message").val()!="") {
			var sendr = nick;//$("#user").html();
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
                var urlshow = data.link;
                if(data.link.length > 20) {
                    urlshow = data.link.substring(0,20)+'...';
                }
                $('#url').html(urlshow);
                $('#url').attr('href',data.link);
		//$("#iframe-content").html("").html(view);
	});
        
        $('#share').click(function(){
		var linktext = $("#link").val();
        var protre = new RegExp('^(http(s|)://)',["i"]);
        //protre returns true if url starts with http:// or https://
        var url = linktext;
        if(protre.test(linktext) === false){
            //add protocol suffix if not present
            url = 'http://'+linktext;
        }

		var line = {link: url};
		socket.emit("reqchange", line);
		$("#link").val("");
	});

        $('#nicksubmit').click(function(){
              if($('#nick').val().length < 5){
                $("#nickok").attr("disabled", "disabled");
                $("div.nick_cg").addClass("error");
                $("span.help-inline").html("Nickname cannot be less than 5 characters.");
              }
              else{
                $("div.nick_cg").removeClass("error");
                $("span.help-inline").html("");
                $.getJSON("http://rangatrade.com/nickserv?nick="+$('#nick').val(), 
                    function(data){
                        console.log(data);
                        if(data.errorcode === 0)
                        {
                            key = data.key;
                            nick = data.nick;
                            $('#nickok').removeAttr("disabled");
                            $("#nickok").trigger("click", []);
                        }
                        else
                        {
                            $("div.nick_cg").addClass("error");
                            $("span.help-inline").html("Nickname already taken.");
                            $("#nickok").attr("disabled","disabled");
                        }
                });
              }
         });
        $('#nickok').click(function(){
            $('#nickhome').removeClass("home");
            $('#roomshome').addClass("home").removeClass("rooms");
            $("#roomshome > header > div > .back").hide();
        });

    });
});
});
