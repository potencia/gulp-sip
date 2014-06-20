'use strict';

var GulpSip = require('../lib/gulp-sip'),
Task = require('../lib/task'),
expect = require('chai').expect;

describe('Task', function () {
    var sip, task;
    beforeEach(function () {
        sip = new GulpSip();
    });

    describe('<constructor>', function () {
        it('should throw an exception when a sip object is not provided', function () {
            try {
                task = new Task();
                expect(true, 'An Error should have been thrown').to.be.false;
            } catch (error) {
                expect(error.name, error).to.equal('GulpSipError');
                expect(error.message).to.equal('Cannot create a Task without a sip object.');
            }
        });

        it('should throw an exception when a configuration object is not provided', function () {
            try {
                task = new Task(sip);
                expect(true, 'An Error should have been thrown').to.be.false;
            } catch (error) {
                expect(error.name, error).to.equal('GulpSipError');
                expect(error.message).to.equal('Cannot create a Task without a configuration object.');
            }
        });

        it('should throw an exception when [ name ] is not provided', function () {
            try {
                task = new Task(sip, {});
                expect(true, 'An Error should have been thrown').to.be.false;
            } catch (error) {
                expect(error.name, error).to.equal('GulpSipError');
                expect(error.message).to.equal('[ name ] is a mandatory property of the Task configuration object.');
            }
        });

        it('should throw an exception when both [ action ] and [ dependencies ] are not provided', function () {
            try {
                task = new Task(sip, {name : 'name'});
                expect(true, 'An Error should have been thrown').to.be.false;
            } catch (error) {
                expect(error.name, error).to.equal('GulpSipError');
                expect(error.message).to.equal('Either [ action ] or [ dependencies ] (or both) must be included in the Task configuration object.');
            }
        });

        it('should throw an exception when [ action ] is not set and [ dependencies ] is empty', function () {
            try {
                task = new Task(sip, {
                    name : 'name',
                    dependencies : []
                });
                expect(true, 'An Error should have been thrown').to.be.false;
            } catch (error) {
                expect(error.name, error).to.equal('GulpSipError');
                expect(error.message).to.equal('Either [ action ] or [ dependencies ] (or both) must be included in the Task configuration object.');
            }
        });

        it('should throw an exception when [ name ] is not a string', function () {
            try {
                task = new Task(sip, {
                    name : [],
                    action : function () {}
                });
                expect(true, 'An Error should have been thrown').to.be.false;
            } catch (error) {
                expect(error.name, error).to.equal('GulpSipError');
                expect(error.message).to.equal('The Task property [ name ] must be a string.');
            }
        });

        it('should throw an exception when [ description ] is provided and is not a string', function () {
            try {
                task = new Task(sip, {
                    name : 'name',
                    description : null,
                    action : function () {}
                });
                expect(true, 'An Error should have been thrown').to.be.false;
            } catch (error) {
                expect(error.name, error).to.equal('GulpSipError');
                expect(error.message).to.equal('The Task property [ description ] must be a string.');
            }
        });

        it('should throw an exception when [ dependencies ] is provided and is not an array', function () {
            try {
                task = new Task(sip, {
                    name : 'name',
                    dependencies : null,
                    action : function () {}
                });
                expect(true, 'An Error should have been thrown').to.be.false;
            } catch (error) {
                expect(error.name, error).to.equal('GulpSipError');
                expect(error.message).to.equal('The Task property [ dependencies ] must be an array of strings.');
            }
        });

        it('should throw an exception when [ dependencies ] is provided with a non string element', function () {
            try {
                task = new Task(sip, {
                    name : 'name',
                    dependencies : [null]
                });
                expect(true, 'An Error should have been thrown').to.be.false;
            } catch (error) {
                expect(error.name, error).to.equal('GulpSipError');
                expect(error.message).to.equal('The Task property [ dependencies ] must be an array of strings.');
            }
        });

        it('should throw an exception when [ action ] is provided and is not a function', function () {
            try {
                task = new Task(sip, {
                    name : 'name',
                    dependencies : ['other'],
                    action : null
                });
                expect(true, 'An Error should have been thrown').to.be.false;
            } catch (error) {
                expect(error.name, error).to.equal('GulpSipError');
                expect(error.message).to.equal('The Task property [ action ] must be a function.');
            }
        });

        it('should throw an exception when [ inject ] is provided and is not an array', function () {
            try {
                task = new Task(sip, {
                    name : 'name',
                    inject : null,
                    action : function () {}
                });
                expect(true, 'An Error should have been thrown').to.be.false;
            } catch (error) {
                expect(error.name, error).to.equal('GulpSipError');
                expect(error.message).to.equal('The Task property [ inject ] must be an array of strings.');
            }
        });

        it('should throw an exception when [ inject ] is provided with a non string element', function () {
            try {
                task = new Task(sip, {
                    name : 'name',
                    inject : [null],
                    action : function () {}
                });
                expect(true, 'An Error should have been thrown').to.be.false;
            } catch (error) {
                expect(error.name, error).to.equal('GulpSipError');
                expect(error.message).to.equal('The Task property [ inject ] must be an array of strings.');
            }
        });

        it('should throw an exception when [ hidden ] is provided and is not a boolean', function () {
            try {
                task = new Task(sip, {
                    name : 'name',
                    hidden : null,
                    action : function () {}
                });
                expect(true, 'An Error should have been thrown').to.be.false;
            } catch (error) {
                expect(error.name, error).to.equal('GulpSipError');
                expect(error.message).to.equal('The Task property [ hidden ] must be a boolean.');
            }
        });

        it('should set [ name ]', function () {
            task = new Task(sip, {
                name : 'taskName',
                action : function () {}
            });
            expect(Object.getOwnPropertyDescriptor(task, 'name')).to.deep.equal({
                enumerable : true,
                configurable : false,
                writable : false,
                value : 'taskName'
            });
        });

        it('should set [ description ] when provided', function () {
            task = new Task(sip, {
                name : 'name',
                description : 'taskDesc',
                action : function () {}
            });
            expect(Object.getOwnPropertyDescriptor(task, 'description')).to.deep.equal({
                enumerable : true,
                configurable : false,
                writable : false,
                value : 'taskDesc'
            });
        });

        it('should set [ description ] to undefined when not provided', function () {
            task = new Task(sip, {
                name : 'name',
                action : function () {}
            });
            expect(Object.getOwnPropertyDescriptor(task, 'description')).to.deep.equal({
                enumerable : true,
                configurable : false,
                writable : false,
                value : undefined
            });
        });

        it('should set [ dependencies ] when provided', function () {
            task = new Task(sip, {
                name : 'name',
                dependencies : ['otherTask']
            });
            expect(Object.getOwnPropertyDescriptor(task, 'dependencies')).to.deep.equal({
                enumerable : true,
                configurable : false,
                writable : false,
                value : ['otherTask']
            });
        });

        it('should set [ dependencies ] to an empty array when not provided', function () {
            task = new Task(sip, {
                name : 'name',
                action : function () {}
            });
            expect(Object.getOwnPropertyDescriptor(task, 'dependencies')).to.deep.equal({
                enumerable : true,
                configurable : false,
                writable : false,
                value : []
            });
        });

        it('should set [ inject ] when provided with [ action ]', function () {
            task = new Task(sip, {
                name : 'taskName',
                inject : ['gulp', 'gutil'],
                action : function () {}
            });
            expect(Object.getOwnPropertyDescriptor(task, 'inject')).to.deep.equal({
                enumerable : true,
                configurable : false,
                writable : false,
                value : [sip.gulp, sip.gutil]
            });
        });

        it('should set [ inject ] based on the definition of [ action ] when only [ action ] is provided', function () {
            task = new Task(sip, {
                name : 'taskName',
                action : function (gulp, gutil) { return [gulp, gutil]; }
            });
            expect(Object.getOwnPropertyDescriptor(task, 'inject')).to.deep.equal({
                enumerable : true,
                configurable : false,
                writable : false,
                value : [sip.gulp, sip.gutil]
            });
        });

        it('should set put [ undefined ] in the position of the argument named [ done ]', function () {
            task = new Task(sip, {
                name : 'taskName',
                action : function (gulp, done, gutil) { return [gulp, done, gutil]; }
            });
            expect(Object.getOwnPropertyDescriptor(task, 'inject')).to.deep.equal({
                enumerable : true,
                configurable : false,
                writable : false,
                value : [sip.gulp, undefined, sip.gutil]
            });
        });

        it('should set [ inject ] to undefined when [ action ] is not provided', function () {
            task = new Task(sip, {
                name : 'taskName',
                dependencies : ['otherTask']
            });
            expect(Object.getOwnPropertyDescriptor(task, 'inject')).to.deep.equal({
                enumerable : true,
                configurable : false,
                writable : false,
                value : undefined
            });
        });

        it('should set [ injectDoneAt ] to [ -1 ] when [ done ] is not to be injected', function () {
            task = new Task(sip, {
                name : 'taskName',
                action : function (gulp, gutil) { return [gulp, gutil]; }
            });
            expect(Object.getOwnPropertyDescriptor(task, 'injectDoneAt')).to.deep.equal({
                enumerable : true,
                configurable : false,
                writable : false,
                value : -1
            });
        });

        it('should set [ injectDoneAt ] to the position of [ done ] it is to be injected', function () {
            task = new Task(sip, {
                name : 'taskName',
                action : function (gulp, done, gutil) { return [gulp, done, gutil]; }
            });
            expect(Object.getOwnPropertyDescriptor(task, 'injectDoneAt')).to.deep.equal({
                enumerable : true,
                configurable : false,
                writable : false,
                value : 1
            });
        });

        it('should set [ injectDoneAt ] to undefined when [ inject ] is also undefined', function () {
            task = new Task(sip, {
                name : 'taskName',
                dependencies : ['otherTask']
            });
            expect(Object.getOwnPropertyDescriptor(task, 'injectDoneAt')).to.deep.equal({
                enumerable : true,
                configurable : false,
                writable : false,
                value : undefined
            });
        });

        it('should throw an Error when a plugin is not registered', function () {
            try {
                task = new Task(sip, {
                    name : 'badTask',
                    action : function (notThere) { return notThere; }
                });
                expect(true, 'An Error should have been thrown').to.be.false;
            } catch (error) {
                expect(error.name, error).to.equal('GulpSipError');
                expect(error.message).to.equal('Attempted to inject unregistered plugin [ notThere ] into the action of task [ badTask ].');
            }
        });

        it('should set [ action ] when provided', function () {
            task = new Task(sip, {
                name : 'taskName',
                action : function () {}
            });
            var descriptor = Object.getOwnPropertyDescriptor(task, 'action');
            expect(descriptor.enumerable).to.be.true;
            expect(descriptor.configurable).to.be.false;
            expect(descriptor.writable).to.be.false;
            expect(descriptor.value).to.be.a('function');
        });

        it('should set [ action ] to undefined when not provided', function () {
            task = new Task(sip, {
                name : 'taskName',
                dependencies : ['otherTask']
            });
            expect(Object.getOwnPropertyDescriptor(task, 'action')).to.deep.equal({
                enumerable : true,
                configurable : false,
                writable : false,
                value : undefined
            });
        });

        it('should set [ hidden ] when provided', function () {
            task = new Task(sip, {
                name : 'taskName',
                hidden : true,
                action : function () {}
            });
            expect(Object.getOwnPropertyDescriptor(task, 'hidden')).to.deep.equal({
                enumerable : true,
                configurable : false,
                writable : false,
                value : true
            });
        });

        it('should set [ hidden ] to [ false ] when not provided', function () {
            task = new Task(sip, {
                name : 'taskName',
                action : function () {}
            });
            expect(Object.getOwnPropertyDescriptor(task, 'hidden')).to.deep.equal({
                enumerable : true,
                configurable : false,
                writable : false,
                value : false
            });
        });
    });
});
