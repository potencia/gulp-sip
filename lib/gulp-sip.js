'use strict';

var Task = require('./task'),
util = require('./util'),
log = util.log,
sipError = util.sipError;

function GulpSip () {
    var self = this;
    Object.defineProperties(this, {
        gulp : {
            enumerable : false,
            configurable : false,
            get : function () {
                return self.plugins.gulp;
            }
        },
        plugins : {
            enumerable : false,
            configurable : false,
            writable : false,
            value : {
                gulp : require('gulp')
            }
        },
        tasks : {
            enumerable : false,
            configurable : false,
            writable : false,
            value : []
        }
    });
}

GulpSip.prototype.plugin = function (name, plugin) {
    if (name === undefined) {
        throw sipError('[ name ] and [ plugin ] are required arguments.');
    }
    if (name === 'done') {
        throw sipError('The plugin [ done ] is reserved to inject the [ done() ] callback function for asynchronous task support. ' +
                       'It cannot be used as a registered plugin name.');
    }
    if (plugin === undefined || plugin === null) {
        throw sipError('Cannot register [ ' + name + ' ] as an undefined or null object.');
    }
    if (arguments[2] !== 'allowDuplicate' && this.plugins.hasOwnProperty(name)) {
        log.yellow.partial.bold('WARNING:')(' A plugin named [ ' + name + ' ] has already been registered. Duplicate registrations are ignored.');
    } else {
        this.plugins[name] = plugin;
    }
    return this;
};

GulpSip.prototype.setGulp = function (gulp) {
    return this.plugin('gulp', gulp, 'allowDuplicate');
};

function parseTaskArguments () {
    var config, args = Object.keys(arguments).reduce(function (r, i) {
        if (this[i]) {
            r.push(this[i]);
        }
        return r;
    }.bind(arguments), []),
    idx = 0, current;

    current = args[idx++];
    if (Object.prototype.toString.call(current) === '[object Object]') {
        return current;
    }

    config = {name : current};

    current = args[idx];
    if (Object.prototype.toString.call(current) === '[object String]') {
        idx++;
        config.description = current;
    }

    current = args[idx];
    if (Object.prototype.toString.call(current) === '[object Array]') {
        idx++;
        config.dependencies = current;
    }

    current = args[idx];
    if (Object.prototype.toString.call(current) === '[object Function]') {
        config.action = current;
    }

    return config;
}

GulpSip.prototype.task = function () {
    var task = new Task(this, parseTaskArguments.apply(null, arguments));
    if (this.tasks.some(function (existingTask) {
        return existingTask.name === task.name;
    })) {
        throw sipError('The task [ ' + task.name + ' ] has already been defined. Unique task names are required.');
    } else {
        this.tasks.push(task);
    }
};

module.exports = GulpSip;
