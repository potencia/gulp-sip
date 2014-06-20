'use strict';

var util = require('./util'),
sipError = util.sipError,
extractFunctionArguments = util.extractFunctionArguments;

function Task (sip, config) {
    var toInject, inject, injectDoneAt, self = this;
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

    if (config.action !== undefined && Object.prototype.toString.call(config.action) !== '[object Function]') {
        throw sipError('The Task property [ action ] must be a function.');
    }

    if (config.hidden !== undefined && Object.prototype.toString.call(config.hidden) !== '[object Boolean]') {
        throw sipError('The Task property [ hidden ] must be a boolean.');
    }

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
        inject = [];
        toInject.forEach(function (pluginName) {
            if (pluginName === 'done') {
                inject.push(undefined);
            } else {
                if (sip.plugins.hasOwnProperty(pluginName)) {
                    inject.push(sip.plugins[pluginName]);
                } else {
                    throw sipError('Attempted to inject unregistered plugin [ ' + pluginName + ' ] into the action of task [ ' + self.name + ' ].');
                }
            }
        });
        injectDoneAt = inject.indexOf(undefined);
    }

    Object.defineProperty(self, 'inject', {
        enumerable : true,
        configurable : false,
        writable : false,
        value : inject
    });

    Object.defineProperty(self, 'injectDoneAt', {
        enumerable : true,
        configurable : false,
        writable : false,
        value : injectDoneAt
    });
}

module.exports = Task;
