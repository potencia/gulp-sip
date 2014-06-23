'use strict';

var util = require('./util'),
eol = require('os').EOL,
log = util.log,
sipError = util.sipError,
extractFunctionArguments = util.extractFunctionArguments,
OPTIONS_ERROR = 'The Task property [ options ] must be a valid options configuration object.';

function Option (config) {
    if (config.list === undefined) {
        return (this.error = 'does not have the required property [ list ].');
    }

    if (Object.prototype.toString.call(config.list) !== '[object Array]' || !config.list.every(function (item) {
        return Object.prototype.toString.call(item) === '[object String]';
    })) {
        return (this.error = 'must have a property [ list ] which is an array of strings.');
    }

    this.list = config.list;
}

function Task (sip, config) {
    var toInject, inject, self = this;
    if (!sip) {
        throw sipError('Cannot create a Task without a sip object.');
    }

    if (!config) {
        throw sipError('Cannot create a Task without a configuration object.');
    }

    if (!config.name) {
        throw sipError('[ name ] is a mandatory property of the Task configuration object.');
    }

    if (Object.prototype.toString.call(config.name) !== '[object String]') {
        throw sipError('The Task property [ name ] must be a string.');
    }

    if (!config.action && (!config.dependencies || config.dependencies.length === 0)) {
        throw sipError('Either [ action ] or [ dependencies ] (or both) must be included in the Task configuration object.');
    }

    if (config.description !== undefined && Object.prototype.toString.call(config.description) !== '[object String]') {
        throw sipError('The Task property [ description ] must be a string.');
    }

    if (config.dependencies !== undefined) {
        if (Object.prototype.toString.call(config.dependencies) !== '[object Array]') {
            throw sipError('The Task property [ dependencies ] must be an array of strings.');
        }
        config.dependencies.forEach(function (dependency) {
            if (Object.prototype.toString.call(dependency) !== '[object String]') {
                throw sipError('The Task property [ dependencies ] must be an array of strings.');
            }
        });
    }

    if (config.options !== undefined) {
        if (Object.prototype.toString.call(config.options) !== '[object Object]') {
            throw sipError(OPTIONS_ERROR);
        }
        Object.keys(config.options).forEach(function (optionName) {
            var option, optionErr = eol + 'The option named [ ' + optionName + ' ] ';
            if (Object.prototype.toString.call(config.options[optionName]) !== '[object Object]') {
                throw sipError(OPTIONS_ERROR + optionErr + 'is not an object.');
            }
            option = new Option(config.options[optionName]);
            if (option.error) {
                throw sipError(OPTIONS_ERROR + optionErr + option.error);
            }
            config.options[optionName] = option;
        });
    }

    if (config.action !== undefined && Object.prototype.toString.call(config.action) !== '[object Function]') {
        throw sipError('The Task property [ action ] must be a function.');
    }

    if (config.hidden !== undefined && Object.prototype.toString.call(config.hidden) !== '[object Boolean]') {
        throw sipError('The Task property [ hidden ] must be a boolean.');
    }

    self.registered = false;

    Object.defineProperty(self, 'name', {
        enumerable : true,
        configurable : false,
        writable : false,
        value : config.name
    });

    Object.defineProperty(self, 'description', {
        enumerable : true,
        configurable : false,
        writable : false,
        value : config.description
    });

    Object.defineProperty(self, 'dependencies', {
        enumerable : true,
        configurable : false,
        writable : false,
        value : (config.dependencies ? config.dependencies : [])
    });

    Object.defineProperty(self, 'options', {
        enumerable : true,
        configurable : false,
        writable : false,
        value : config.options
    });

    Object.defineProperty(self, 'action', {
        enumerable : true,
        configurable : false,
        writable : false,
        value : config.action
    });

    Object.defineProperty(self, 'hidden', {
        enumerable : true,
        configurable : false,
        writable : false,
        value : !!config.hidden
    });

    Object.defineProperty(self, 'injectAt', {
        enumerable : true,
        configurable : false,
        writable : false,
        value : {}
    });

    if (self.action) {
        if (config.inject !== undefined) {
            if (Object.prototype.toString.call(config.inject) !== '[object Array]') {
                throw sipError('The Task property [ inject ] must be an array of strings.');
            }
            config.inject.forEach(function (plugin) {
                if (Object.prototype.toString.call(plugin) !== '[object String]') {
                    throw sipError('The Task property [ inject ] must be an array of strings.');
                }
            });
            toInject = config.inject;
        } else {
            toInject = extractFunctionArguments(self.action);
        }
        self.injectAt.done = -1;
        self.injectAt.options = -1;
        inject = [];
        toInject.forEach(function (pluginName, index) {
            if (!Object.keys(self.injectAt).some(function (specialName) {
                if (pluginName === specialName) {
                    self.injectAt[specialName] = index;
                    inject.push(undefined);
                    return true;
                }
                return false;
            })) {
                if (sip.plugins.hasOwnProperty(pluginName)) {
                    inject.push(sip.plugins[pluginName]);
                } else {
                    throw sipError('Attempted to inject unregistered plugin [ ' + pluginName + ' ] into the action of task [ ' + self.name + ' ].');
                }
            }
        });
    }

    if (self.options && !self.action) {
        throw sipError('Options are configured for task [ ' + self.name +
        ' ], but they will not be used as there is no action function defined for this task.');
    }

    if (self.options && self.injectAt.options  === -1) {
        throw sipError('Options are configured for task [ ' + self.name +
        ' ], but they will not be accesible to the task because the action function does not define the [ options ] argument.');
    }

    if (self.injectAt.options > -1 && !self.options) {
        throw sipError('The action for task [ ' + self.name + ' ] is defined with the [ options ] argument, but no options have been defined for the task.');
    }

    Object.defineProperty(self, 'inject', {
        enumerable : true,
        configurable : false,
        writable : false,
        value : inject
    });
}

Task.prototype.register = function (sip) {
    if (this.registered) { return; }

    var self = this, args = [self.name];
    if (self.dependencies.length > 0) {
        args.push(self.dependencies);
    }
    function outputDescription () {
        if (sip.config.verbose && self.description) {
            log.gray(' ' + self.description);
        }
    }
    function injectArguments (done) {
        var options;
        if (self.injectAt.options > -1) {
            options = {};
            Object.keys(self.options).forEach(function (optionName) {
                self.options[optionName].list.some(function (key) {
                    if (sip.env.hasOwnProperty(key)) {
                        options[optionName] = sip.env[key];
                        return true;
                    }
                    return false;
                });
            });
        }
        return self.inject.map(function (plugin, index) {
            if (index === self.injectAt.done) { return done; }
            if (index === self.injectAt.options) { return options; }
            return plugin.value;
        });
    }
    if (self.action) {
        if (self.injectAt.done === -1) {
            args.push(function () {
                outputDescription();
                return self.action.apply(sip.config.gulp, injectArguments());
            });
        } else {
            args.push(function (done) {
                outputDescription();
                self.action.apply(sip.config.gulp, injectArguments(done));
            });
        }
    }
    self.registered = true;
    sip.config.gulp.task.apply(sip.config.gulp, args);
};

module.exports = Task;
