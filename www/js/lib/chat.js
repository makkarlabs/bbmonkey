define(function(require){

require(["js/lib/socket-io-wrap.js"],function(io){
var $ = require('zepto');
var Mustache = require('mustache');
var socket = io.connect("http://rangatrade.com:80");
var tmpl = "<iframe src='{{link}}'></iframe>";
var list = "{{#rlist}}<option>{{.}}</option>{{/rlist}}";
var roomname = null;
$(document).ready(function() {

    $('enterRoom').hide();
	socket.emit('listroom', {});
	socket.on('listroom', function(data) {
		alert(data['no']);
		var rooms = Mustache.to_html(list, data);
		$('#list').html(rooms);
	});

	$("#suButton").click(function(e) {
        e.preventDefault();
        alert("rangatrade");
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
            roomdata.room = roomname
            socket.emit('leaveroom', roomdata);
        }
        socket.emit('joinroom',data);
        socket.once('joinroom', function(data) {
            $('#chatstream').html('');
            $('#iframee').attr('src','');
            roomname = $('#list').val();
            $('#enterRoom').show();
        });
    });


	socket.on("groupChat", function(data) {
		var tmpl = "<p>{{sender}} : {{message}}</p>"
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
		//$("#iframe-content").html("").html(view);
	});
        
        $('#share').click(function(){
		var mess = $("#link").val();
		var line = {link: mess};
		socket.emit("reqchange", line);
		$("#link").val("");
	});
        $('#nicksubmit').click(function(){
              if($('#nick').val().length < 5){
            
              }
              else{
                $.getJSON("http://rangatrade.com/nickserv?nick="+$('#nick').val(), 
                    function(data){
                        console.log(data);
                        if(data.errorcode === 0)
                        {
                            key = data.key;
                            nick = data.nick;
                            $('#nickok').removeAttr("disabled");
                        }
                        else
                        {
                            //Error classes
                        }
                });
              }
         });
         $('#nick:first').trigger('change');


    });
});
});
