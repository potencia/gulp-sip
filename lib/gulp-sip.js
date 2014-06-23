'use strict';

var Task = require('./task'),
util = require('./util'),
log = util.log,
sipError = util.sipError;

function GulpSip () {
    Object.defineProperties(this, {
        plugins : {
            enumerable : false,
            configurable : false,
            writable : false,
            value : {
                gulp : {}
            }
        },
        tasks : {
            enumerable : false,
            configurable : false,
            writable : false,
            value : []
        },
        env : {
            enumerable : false,
            configurable : false,
            writable : false,
            value : util.env
        },
        config : {
            enumerable : false,
            configurable : false,
            writable : false,
            value : {
                gulp : null,
                env : {
                    verbose : ['v', 'verbose']
                }
            }
        }
    });
}

GulpSip.prototype.configure = function configure () {
    var result = [], ctr, len, arg;
    for (ctr = 0, len = arguments.length; ctr < len; ctr++) {
        arg = arguments[ctr];
        if (Object.prototype.toString.call(arg) === '[object Object]') {
            if (configure.configurations.gulp(arg, this.config, this)) {
                result.push(true);
            } else {
                result.push(
                    Object.keys(arg)
                    .map(configure.eachConfigOption, {configure : configure, obj : arg, sip : this})
                    .reduce(configure.eachConfigReturn, {})
                );
            }
        } else {
            result.push(false);
        }
    }
    return result;
};

GulpSip.prototype.configure.eachConfigOption = function (config) {
    var result = {key : config};
    if (this.configure.configurations.hasOwnProperty(config)) {
        result.value = this.configure.configurations[config](this.obj[config], this.sip.config, this.sip);
    }
    return result;
};

GulpSip.prototype.configure.eachConfigReturn = function (result, config) {
    result[config.key] = config.value;
    return result;
};

GulpSip.prototype.configure.configurations = {
    gulp : function gulp (obj, config, sip) {
        if (['task', 'src', 'dest', 'watch'].every(function (methodName) {
            return Object.prototype.toString.call(this[methodName]) === '[object Function]';
        }, obj)) {
            config.gulp = obj;
            sip.plugins.gulp.value = obj;
            return true;
        }
        return false;
    },
    env : function (obj, config, sip) {
        return Object.keys(obj).map(function (key) {
            var subObj = {
                key : key,
                configKey : 'env' + key[0].toUpperCase() + key.substring(1),
                config : {}
            };
            subObj.config[subObj.configKey] = obj[key];
            return subObj;
        })
        .reduce(function (result, current) {
            result[current.key] = sip.configure(current.config)[0][current.configKey];
            return result;
        }, {});
    },
    envVerbose : function (list, config) {
        if (Object.prototype.toString.call(list) === '[object Array]' && list.every(function (item) {
            return typeof item === 'string';
        })) {
            config.env.verbose = list;
        }
    }
};

GulpSip.prototype.checkEnv = function checkEnv () {
    var self = this;
    Object.keys(self.config.env).forEach(function (key) {
        if (checkEnv.configurations.hasOwnProperty(key)) {
            checkEnv.configurations[key](self.config.env[key], self.env, self.config);
        }
    });
};

GulpSip.prototype.checkEnv.configurations = {
    verbose : function (list, env, config) {
        config.verbose = list.some(function (option) { return !!env[option]; });
    }
};

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
        this.plugins[name] = {value : plugin};
    }
    return this;
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

GulpSip.prototype.run = function () {
    var self = this;
    self.configure.apply(self, arguments);
    if (!self.config.gulp) {
        throw sipError('GulpSip requires [ gulp ]. Either pass [ gulp ] to [ GulpSip.configure() ] ' +
        'before calling [ GulpSip.run() ] or pass [ gulp ] to [ GulpSip.run() ].');
    }

    self.checkEnv();

    self.tasks.forEach(function (task) {
        task.register(self);
    });
};

module.exports = GulpSip;
