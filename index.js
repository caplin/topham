// node topham server port -- cmd

var net = require('net');
var path = require('path');

var descriptor = require('./package.json');

var options = {};

for (var i = 2; i < process.argv.length; ++i) {
	var arg = process.argv[i];
	if (arg === '-H' || arg === '--host') {
		options.host = process.argv[++i];
	} else if (arg === '-p' || arg === '--port') {
		options.port = process.argv[++i];
	} else if (arg === '-i' || arg === '--in') {
		options.in = true;
	} else if (arg === 'serve' || arg === '-s' || arg === '--serve') {
		options.serve = true;
	} else if (arg === '-h' || arg === '--help') {
		options.help = true;
	} else {
		options.script = arg;
		options.args = process.argv.slice(i + 1);
		break;
	}
}

if (options.help || process.argv.length === 2) {
	var myName = path.basename(process.argv[1]);
	console.log(descriptor.name +" v" + descriptor.version);
	console.log("Usage:");
	console.log("\t" + myName + " [-H, --host <remote host>] [-p, --port <remote port>] [-i, --in] [-s, --serve] [-h, --help] script [arguments*]");
	console.log("\tremote host is the remote host to connect to (defaults to localhost).");
	console.log("\tremote port is the port either to connect to or to serve on (defaults to 7003).");
	console.log("\tthe 'in' flag indicates that stdin should be attached to the remote task.");
	console.log("\tthe 'serve' flag will start up a server.");
	console.log("\tscript is the script command to execute and any remaining arguments are passed to it.");
} else {
	var port = options.port === undefined ? 7003 : options.port;
	var host = options.host || "localhost";

	if (options.serve) {
		var RunnerServer = require('./lib/RunnerServer');
		var server = new RunnerServer();
		server.listen(port, function() {
			port = server.server.address().port;
			console.log("topham server started, bound to port " + port +".");
			processExec();
		});
	} else {
		processExec();
	}
}

function processExec() {
	if (options.script) {
		var socket = net.connect({
			host: host,
			port: port
		}, function() {
			var config = {
				script: options.script,
				args: options.args
			};
			socket.write(JSON.stringify(config) + "\n");
			socket.pipe(process.stdout);
			if (options.in) {
				process.stdin.pipe(socket);
			}
		});
	}
}
