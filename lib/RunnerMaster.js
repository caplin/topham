// Cluster master
var fs = require('fs'), path = require('path');
var cp = require('child_process');

var slice = Array.prototype.slice;
var runnerScript = path.join(__dirname, "Runner.js");

function RunnerMaster(paths) {
	paths = paths || module.paths;
	this.scripts = {};
	for (var i = 0; i < paths.length; ++i) {
		findScripts(paths[i], this.scripts);
	}
	this.preparedChild;
}

RunnerMaster.prototype.createChild = function() {
	return cp.fork(runnerScript, [], {
		silent: true
	});
};

RunnerMaster.prototype.withChild = function(callback) {
	var child = this.preparedChild;
	this.preparedChild = null;
	callback(child || this.createChild());
	this.preparedChild = this.createChild();
};

RunnerMaster.prototype.run = function(script, args, callback, stdout, stderr, stdin) {
	script = this.scripts[script] || script;
	args = args || [];

	this.withChild(function(child) {
		console.log("[" + child.pid + "] Running " + script +" [" + args.join(", ") + "]");

		if (stdout) {
			child.stdout.pipe(stdout);
		}
		if (stderr) {
			child.stderr.pipe(stderr);
		}
		if (stdin) {
			stdin.pipe(child.stdin);
		}

		child.on('error', function(err) {
			console.error("["+child.pid+"] ERROR: "+err);
		});

		child.on('exit', function() {
			console.log("[" + child.pid + "] Completed in "+(Date.now() - time)+"ms");
			if (callback) {
				callback();
			}
		});

		var time = Date.now();
		child.send({
			script: script,
			args: args
		});
	});
};

function findScripts(modulesDir, scripts) {
	if (fs.existsSync(modulesDir) === false) {
		return;
	}
	var packages = fs.readdirSync(modulesDir);
	for (var i = 0; i < packages.length; ++i) {
		var pckage = packages[i];
		var descriptorFile = path.join(modulesDir, pckage, "package.json");
		if (fs.existsSync(descriptorFile)) {
			var descriptor = JSON.parse(fs.readFileSync(descriptorFile, {encoding: 'utf8'}));
			for (var key in descriptor.bin) {
				scripts[key] = path.join(modulesDir, pckage, descriptor.bin[key]);
			}
		}
	}
}

module.exports = RunnerMaster;