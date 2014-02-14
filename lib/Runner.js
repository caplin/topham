process.on('message', function(msg) {
	process.disconnect();
	process.argv = ["node", msg.script].concat(msg.args);
	require('module').runMain();
});