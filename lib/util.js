'use strict';

exports.sipError = function (message) {
    var error = new Error(message);
    error.name = 'GulpSipError';
    return error;
};

exports.extractFunctionArguments = function (fn) {
    return /[^(]*\(([^)]*)\)/.exec(Function.prototype.toString.call(fn).replace(/\/\*[\s\S]+?\*\//g, '').replace(/\/\/.*/g, ''))[1]
    .replace(/\s+/g, '').split(',').reduce(function (res, arg) { if (arg) { res.push(arg); } return res; }, []);
};

var s = '\u001b[', e = 'm',
eol = require('os').EOL,
styles = {
    reset : {start : '0'},
    re : {start : '0'},
    bold : {start : '1', end : '22'},
    bo : {start : '1', end : '22'},
    italic : {start : '3', end : '23'},
    i : {start : '3', end : '23'},
    under : {start : '4', end : '24'},
    u : {start : '4', end : '24'},
    inverse : {start : '7', end : '27'},
    inv : {start : '7', end : '27'},
    strike : {start : '9', end : '29'},
    s : {start : '9', end : '29'},
    black : {start : '30', end : '39'},
    bla : {start : '30', end : '39'},
    red : {start : '31', end : '39'},
    r : {start : '31', end : '39'},
    green : {start : '32', end : '39'},
    gre : {start : '32', end : '39'},
    yellow : {start : '33', end : '39'},
    y : {start : '33', end : '39'},
    blue : {start : '34', end : '39'},
    blu : {start : '34', end : '39'},
    magenta : {start : '35', end : '39'},
    m : {start : '35', end : '39'},
    cyan : {start : '36', end : '39'},
    c : {start : '36', end : '39'},
    white : {start : '37', end : '39'},
    w : {start : '37', end : '39'},
    gray : {start : '90', end : '39'},
    grey : {start : '90', end : '39'},
    gra : {start : '90', end : '39'},
    backBlack : {start : '40', end : '49'},
    bbla : {start : '40', end : '49'},
    backRed : {start : '41', end : '49'},
    br : {start : '41', end : '49'},
    backGreen : {start : '42', end : '49'},
    bg : {start : '42', end : '49'},
    backYellow : {start : '43', end : '49'},
    by : {start : '43', end : '49'},
    backBlue : {start : '44', end : '49'},
    bblu : {start : '44', end : '49'},
    backMagenta : {start : '45', end : '49'},
    bm : {start : '45', end : '49'},
    backCyan : {start : '46', end : '49'},
    bc : {start : '46', end : '49'},
    backWhite : {start : '47', end : '49'},
    bw : {start : '47', end : '49'}
}, commands  = {
    text : function (pass, result, text) {
        if (pass === 'start') {
            result.push(text);
        }
    },
    partial : function (pass, result, commands, raw) { // Note: Pass should always be 'start' for this as this function turns the command into a 'text' command
        var text = this.collapse(commands);
        raw.length = 0;
        raw.push('text', text);
        result.push(text);
    },
    eol : function (pass, result) {
        if (pass === 'start') {
            result.push(eol);
        }
    },
    style : function (position, result, style) {
        if (styles[style].hasOwnProperty(position)) {
            result.push(s, styles[style][position], e);
        }
    }
};

function cmd (ctx, command, position, result) {
    var commandName, commandArg;
    if (typeof command === 'string') {
        commandName = command;
    } else {
        commandName = command[0];
        commandArg = command[1];
    }
    if (commands.hasOwnProperty(commandName)) {
        commands[commandName].call(ctx, position, result, commandArg, command);
    } else {
        commands.style.call(ctx, position, result, commandName);
    }
}

function LogContext () {
    this.firstLine = this.collapse([['partial', [['text', '[']]], ['partial', ['bold', 'blue', ['text', 'sip']]], ['partial', [['text', '] ']]]]);
    this.otherLines = '      ';
    this.stack = [];
}

LogContext.prototype.collapse = function collapse (commands) {
    var self = this, result = [];
    commands.forEach(function (command) {
        cmd(self, command, 'start', result);
    });
    while (commands.length > 0) {
        cmd(self, commands.pop(), 'end', result);
    }
    return result.join('');
};

LogContext.prototype.command = function (command, argument) {
    var cmd, stack;
    if (command === 'partial') {
        cmd = [command, []];
    } else {
        if (!argument) {
            cmd = command;
        } else {
            cmd = [command, argument];
        }
    }
    if (this.partialStack.length > 0) {
        stack = this.partialStack.slice(-1)[0][1];
    } else {
        stack = this.stack;
    }
    stack.push(cmd);
    if (command === 'partial') {
        this.partialStack.push(cmd);
    }
};

function defineLogControlProperty (log, name) {
    Object.defineProperty(log, name, {
        enumerable : true,
        configurable : false,
        get : function () {
            log.ctx.command(name);
            return log;
        }
    });
}

function Log () {
    function log (msg) {
        log.ctx.command('text', msg);
        if (log.ctx.partialStack.length > 0) {
            log.ctx.collapse([log.ctx.partialStack.pop()]);
        } else {
            log.ctx.collapse(log.ctx.stack).split(eol).forEach(function (line, index) {
                if (index === 0) {
                    log.ctx.command('text', log.ctx.firstLine);
                } else {
                    log.ctx.command('text', log.ctx.otherLines);
                }
                log.ctx.command('text', line);
                log.ctx.command('eol');
            });
            log.ctx.stack.pop();
            log.ctx.stack.unshift('reset');
            console.log(log.ctx.collapse(log.ctx.stack));
        }
        return log;
    }

    Object.defineProperty(log, 'ctx', {
        enumerable : false,
        configurable : false,
        writable : false,
        value : new LogContext()
    });

    defineLogControlProperty(log, 'partial');
    defineLogControlProperty(log, 'eol');
    Object.keys(styles).forEach(function (style) {
        defineLogControlProperty(log, style);
    });
    return log;
}

exports.log = new Log();
