function SequenceEventExecutor(context) {
	this.context = context;
	this.events = [];
}

SequenceEventExecutor.prototype.addEvent = function(func) {
	var args = [];
	for (var i = 1; i < arguments.length; i++)
		args.push(arguments[i]);
	this.events.push([func, args]);
}

SequenceEventExecutor.prototype.execute = function(callback) {

	var args = (callback) ? [] : null;
	var fn = (callback) ? callback : null ;

	for (var i = this.events.length - 1; i >= 0; i--) {
		
		tmpArgs = this.events[i][1];
		if (fn) tmpArgs.push(fn);
		if (args) tmpArgs.push(args);

		fn = this.events[i][0];
		args = tmpArgs;
	}

	fn.apply(this.context, args);
}

SequenceEventExecutor.prototype.callbackAlert = function(message, callback, cbArgs) {
	$.featherlight($('<div>'+message+'</div>'), {});
	if (callback && cbArgs)
		callback.call(cbArgs);
}