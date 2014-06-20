'use strict';

var Task = require('./task'),
util = require('./util'),
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
        gutil : {
            enumerable : false,
            configurable : false,
            get : function () {
                return self.plugins.gutil;
            }
        },
        plugins : {
            enumerable : false,
            configurable : false,
            writable : false,
            value : {
                gulp : require('gulp'),
                gutil : require('gulp-util')
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
        this.gutil.log(
            this.gutil.colors.yellow(
                this.gutil.colors.bold('WARNING:') + ' A plugin named [ ' + name + ' ] has already been registered. Duplicate registrations are ignored.'));
    } else {
        this.plugins[name] = plugin;
    }
    return this;
};

GulpSip.prototype.setGulp = function (gulp) {
    return this.plugin('gulp', gulp, 'allowDuplicate');
};

GulpSip.prototype.setGulpUtil = function (gutil) {
    return this.plugin('gutil', gutil, 'allowDuplicate');
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
    this.tasks.push(task);
};

module.exports = GulpSip;
