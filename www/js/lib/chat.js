define(function(require){

require(["js/lib/socket-io-wrap.js"],function(io){
var $ = require('zepto');
var Mustache = require('mustache');
var socket = io.connect("http://rangatrade.com:80");
var selectframe = " <select name='rooms' id='list' size='5'> </select>"
var list = "{{#rlist}}<option>{{.}}</option>{{/rlist}}";
var roomname = null;
var loading_gif = "<img class='loading_gif' src='img/round-loader.gif'/>";

$.fn.scrollToBottom = function(duration) {
    var $el = this;
    var el  = $el[0];
    var startPosition = el.scrollTop;
    var delta = el.scrollHeight - $el.height() - startPosition;

    var startTime = Date.now();

    function scroll() {
        var fraction = Math.min(1, (Date.now() - startTime) / duration);

        el.scrollTop = delta * fraction + startPosition;

        if(fraction < 1) {
            setTimeout(scroll, 10);
        }
    }
    scroll();
};

$(document).ready(function() {
    $('#enterRoom').hide();
    $('#enterroom_loader').hide();
	
        $('#nicksubmit').click(function(){
              if($('#nick').val().length < 5){
                $("#nickok").attr("disabled", "disabled");
                $("div.nick_cg").addClass("error");
                $("span.help-inline").html("Nickname cannot be less than 5 characters.");
              }
              else{

                $("div.nick_cg").removeClass("error");
                $("span.help-inline").html(loading_gif);
                $(this).attr('disabled', 'disabled');
                $.getJSON("http://rangatrade.com/nickserv?nick="+$('#nick').val(), 
                    function(data){
                        console.log(data);
                        if(data.errorcode === 0)
                        {
                            key = data.key;
                            nick = data.nick;
                            console.log(data);
                            socket.emit("setnick", data);
                            socket.once("setnick", function(data){
                                console.log(data);
                                if(data.errno === undefined)
                                {                                                        
                                    $('#nickok').removeAttr("disabled");
                                    $("#nickok").trigger('click');
                                    $("span.help-inline").html('Available');
                                    $("#roomshome > header > div > .back").hide();
                                    socket.emit('listroom', {});
	                                socket.on('listroom', function(data) {

		                                var rooms = Mustache.to_html(list, data);
                                        $('#list').removeClass('hidden'); 
		                                $('#roomlist_loader').hide();
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
                                        $('#enterRoom').hide();
                                        $('#enterroom_loader').show();
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
                                            $('#enterroom_loader').hide();
                                            $('#enterRoom').show();
                                        });
                                    });


	                                socket.on("groupChat", function(data) {
                                        var tmpl_you = "<div class='arrow_box_right you'><strong>{{sender}}</strong> : <p class='dialogue'>&nbsp{{message}}</p></div><br>";
                                        var tmpl_me = "<div class='arrow_box_left you'><strong>Me</strong> : <p class='dialogue'>&nbsp{{message}}</p></div><br>";

                                        if(nick === data.sender){
                                            var html = Mustache.to_html(tmpl_me, data);
                                        }
                                        else{
                                            var html = Mustache.to_html(tmpl_you, data);
                                        }
		                                $("#chatstream").append(html);
                                        var $el = $('#chatstream');
                                        //var el = $el[0]; /* Actual DOM element */
                                        /* Scroll to bottom */
                                        //el.scrollTop = el.scrollHeight - $el.height();
	                                $el.scrollToBottom(500);
	                                });
	                                $("#send").click(function() {
		                                if($("#message").val()!="") {
			                                var sendr = nick;
			                                var mess = $("#message").val();
			                                var line = {sender: sendr, message: mess};
			                                socket.emit("receive", line);
			                                $("#message").val("");
		                                }
	                                });
	                                socket.on("linkchange", function(data) {
                                                $('p.apology').css('display', 'none');
                                                $('#iframee').attr('src',data.link);
                                                $('#iframee').attr('src', $('#iframee').attr('src'));
                                                var urlshow = data.link;
                                                if(data.link.length > 20) {
                                                    urlshow = data.link.substring(0,20)+'...';
                                                }
                                                $('#url').html(urlshow);
                                                $('#url').attr('href',data.link);
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

                                }
                                else
                                {
                                    $("div.nick_cg").addClass("error");
                                    $("span.help-inline").html("Nickname registration failed, please try again.");
                                    $("#nickok").attr("disabled","disabled");

                                }
                            });
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
        });
    });
});
