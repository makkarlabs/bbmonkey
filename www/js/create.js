var socket = io.connect('http://localhost');
var list = "{{#rlist}}<option>{{.}}</option>{{/rlist}}";

$(document).ready(function() {
	socket.emit('listroom', {});
	socket.on('listroom', function(data) {
		alert(data['no']);
		var rooms = Mustache.to_html(list, data);
		$('#list').html(rooms);
	});
	$("#suButton").click(function() {
		if($('#cRoom').val()) {
			var data = {};
			data.room = $('#cRoom').val();
			socket.emit('createroom', data);
			$('#cRoom').val('');
		}
	});
})