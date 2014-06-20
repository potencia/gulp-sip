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

exports.env = require('minimist')(process.argv.slice(2));

var s = '\u001b[', e = 'm',
eol = require('os').EOL,
styles = {
    reset : {start : '0'},
    bold : {start : '1', end : '22'},
    italic : {start : '3', end : '23'},
    under : {start : '4', end : '24'},
    inverse : {start : '7', end : '27'},
    strike : {start : '9', end : '29'},
    black : {start : '30', end : '39'},
    red : {start : '31', end : '39'},
    green : {start : '32', end : '39'},
    yellow : {start : '33', end : '39'},
    blue : {start : '34', end : '39'},
    magenta : {start : '35', end : '39'},
    cyan : {start : '36', end : '39'},
    white : {start : '37', end : '39'},
    gray : {start : '90', end : '39'},
    backBlack : {start : '40', end : '49'},
    backRed : {start : '41', end : '49'},
    backGreen : {start : '42', end : '49'},
    backYellow : {start : '43', end : '49'},
    backBlue : {start : '44', end : '49'},
    backMagenta : {start : '45', end : '49'},
    backCyan : {start : '46', end : '49'},
    backWhite : {start : '47', end : '49'}
}, commands = {
    text : function (pass, result, text) {
        if (pass === 'start') {
            result.push(text);
        }
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
}, subCommands = {
    partial : function (pass, result, commands, raw) {
        // Note: [ pass ] should always be 'start' for this as this
        //       function turns the command into a 'text' command
        var text = this.collapse(commands);
        raw.length = 0;
        raw.push('text', text);
        result.push(text);
    },
    firstline : function (pass, result, commands, raw) {
        // Note: This command does not effect the [ result ],
        //       only the [ firstLine ] property of ctx
        //       It also should only ever fire with pass ==== 'start'
        this.firstLine = this.collapse(commands);
        raw.length = 0;
        raw.push('empty');
    },
    otherlines : function (pass, result, commands, raw) {
        // Note: This command does not effect the [ result ],
        //       only the [ otherLines ] property of ctx
        //       It also should only ever fire with pass ==== 'start'
        this.otherLines = this.collapse(commands);
        raw.length = 0;
        raw.push('empty');
    },
    alllines : function (pass, result, commands, raw) {
        // Note: This command does not effect the [ result ],
        //       only the [ firstLine ] and [ otherLines ] properties of ctx
        //       It also should only ever fire with pass ==== 'start'
        this.firstLine = this.otherLines = this.collapse(commands);
        raw.length = 0;
        raw.push('empty');
    },
    empty : function () {
        // Note: This command does nothing. It is a way for other
        //       subCommands to be removed from later processing
    }
};

/*********************** Set up style aliases ***********************/
styles.re = styles.reset;
styles.bo = styles.bold;
styles.i = styles.italic;
styles.u = styles.under;
styles.inv = styles.inverse;
styles.s = styles.strike;
styles.bla = styles.black;
styles.r = styles.red;
styles.gre = styles.green;
styles.y = styles.yellow;
styles.blu = styles.blue;
styles.m = styles.magenta;
styles.c = styles.cyan;
styles.w = styles.white;
styles.grey = styles.gray;
styles.gra = styles.gray;
styles.bbla = styles.backBlack;
styles.br = styles.backRed;
styles.bg = styles.backGreen;
styles.by = styles.backYellow;
styles.bblu = styles.backBlue;
styles.bm = styles.backMagenta;
styles.bc = styles.backCyan;
styles.bw = styles.backWhite;

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
        if (subCommands.hasOwnProperty(commandName)) {
            subCommands[commandName].call(ctx, position, result, commandArg, command);
        } else {
            commands.style.call(ctx, position, result, commandName);
        }
    }
}

function LogContext () {
    this.firstLine = '';
    this.otherLines = '';
    this.stack = [];
    this.subStack = [];
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
    var cmd, stack, sub = subCommands.hasOwnProperty(command);
    if (sub) {
        cmd = [command, []];
    } else {
        if (!argument) {
            cmd = command;
        } else {
            cmd = [command, argument];
        }
    }
    if (this.subStack.length > 0) {
        stack = this.subStack.slice(-1)[0][1];
    } else {
        stack = this.stack;
    }
    stack.push(cmd);
    if (sub) {
        this.subStack.push(cmd);
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

function filterEmptyCommands (command) {
    return !(Object.prototype.toString.call(command) === '[object Array]' && command[0] === 'empty');
}

function Log () {
    function log (msg) {
        log.ctx.command('text', msg);
        if (log.ctx.subStack.length > 0) {
            log.ctx.collapse([log.ctx.subStack.pop()]);
            log.ctx.stack = log.ctx.stack.filter(filterEmptyCommands);
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

    Object.defineProperties(log, {
        ctx : {
            enumerable : false,
            configurable : false,
            writable : false,
            value : new LogContext()
        },
        done : {
            enumerable : true,
            configurable : false,
            get : function () {
                log.ctx.subStack.length = 0;
                return log();
            }
        }
    });

    defineLogControlProperty(log, 'partial');
    defineLogControlProperty(log, 'firstline');
    defineLogControlProperty(log, 'otherlines');
    defineLogControlProperty(log, 'alllines');
    defineLogControlProperty(log, 'eol');
    Object.keys(styles).forEach(function (style) {
        defineLogControlProperty(log, style);
    });
    return log;
}

exports.log = new Log();
exports.log.firstline.partial('[').partial.bold.blue('sip')('] ');
exports.log.otherlines('      ');
