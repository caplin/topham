var net = require('net');
var RunnerMaster = require('./RunnerMaster');

function RunnerServer(master) {
	master = master || new RunnerMaster();
	this.server = net.createServer(function(socket) {
		readlineFromStream(socket, function(line) {
			try {
				var config = JSON.parse(line);
				master.run(config.script, config.args, null, socket, socket, socket);
			} catch (e) {
				console.error(e);
			}
		});
	});
	this.server.on('error', function(error) {
		console.error(error);
	});
}

RunnerServer.prototype.listen = function() {
	this.server.listen.apply(this.server, arguments);
};

function readlineFromStream(stream, callback) {
	var line = "";

	function onReadable() {
		// This won't work with characters that are not 8bit, but I'm
		// worried about consuming parts of the stream beyond the bit
		// meant for me :-(
		var buff;
		while ((buff = stream.read(1)) !== null) {
			var chr = buff.toString();
			if (chr === '\n') {
				stream.removeListener('readable', onReadable);
				callback(line);
				break;
			} else if (chr !== '\r') {
				line += chr;
			}
		}
	}
	stream.on('readable', onReadable);
}

module.exports = RunnerServer;