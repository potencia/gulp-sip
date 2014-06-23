'use strict';

var GulpSip = require('../lib/gulp-sip'),
Task = require('../lib/task'),
util = require('../lib/util'),
expect = require('chai').expect,
sinon = require('sinon');

describe('Task', function () {
    var sip, task, firstPlugin, otherPlugin;
    beforeEach(function () {
        sip = new GulpSip();
        firstPlugin = '{firstPlugin}';
        otherPlugin = '{otherPlugin}';
        sip.plugin('first', firstPlugin);
        sip.plugin('other', otherPlugin);
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

        it('should set [ registered ] to false', function () {
            task = new Task(sip, {
                name : 'taskName',
                action : function () {}
            });
            expect(task.registered).to.be.false;
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
                inject : ['first', 'other'],
                action : function () {}
            });
            expect(Object.getOwnPropertyDescriptor(task, 'inject')).to.deep.equal({
                enumerable : true,
                configurable : false,
                writable : false,
                value : [{value : firstPlugin}, {value : otherPlugin}]
            });
        });

        it('should set [ inject ] based on the definition of [ action ] when only [ action ] is provided', function () {
            task = new Task(sip, {
                name : 'taskName',
                action : function (first, other) { return [first, other]; }
            });
            expect(Object.getOwnPropertyDescriptor(task, 'inject')).to.deep.equal({
                enumerable : true,
                configurable : false,
                writable : false,
                value : [{value : firstPlugin}, {value : otherPlugin}]
            });
        });

        it('should set put [ undefined ] in the position of the argument named [ done ]', function () {
            task = new Task(sip, {
                name : 'taskName',
                action : function (first, done, other) { return [first, done, other]; }
            });
            expect(Object.getOwnPropertyDescriptor(task, 'inject')).to.deep.equal({
                enumerable : true,
                configurable : false,
                writable : false,
                value : [{value : firstPlugin}, undefined, {value : otherPlugin}]
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
                action : function (gulp, other) { return [gulp, other]; }
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
                action : function (gulp, done, other) { return [gulp, done, other]; }
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

    describe('.register()', function () {
        var gulp;
        beforeEach(function () {
            sip.config.gulp = gulp = {
                task : sinon.stub()
            };
        });

        describe('when [ registered ] is false', function () {
            beforeEach(function () {
                task = new Task(sip, {
                    name : 'some.async.task',
                    action : function () {}
                });
                task.register(sip);
            });

            it('should set [ registered ] to true', function () {
                expect(task.registered).to.be.true;
            });
        });

        describe('when [ registered ] is true', function () {
            beforeEach(function () {
                task = new Task(sip, {
                    name : 'some.async.task',
                    action : function () {}
                });
                task.registered = true;
                task.register(sip);
            });

            it('should not call [ sip.config.gulp.task ]', function () {
                expect(sip.config.gulp.task.callCount).to.equal(0);
            });
        });

        describe('when no action is set', function () {
            it('should register a task with [ name ] and [ dependencies ]', function () {
                new Task(sip, {
                    name : 'root.task',
                    dependencies : ['task.one', 'task.two']
                }).register(sip);
                expect(gulp.task.callCount).to.equal(1);
                expect(gulp.task.firstCall.args).to.deep.equal([
                    'root.task',
                    [
                        'task.one',
                        'task.two'
                    ]
                ]);
            });
        });

        describe('when an action is set and no dependencies are set', function () {
            var fn, returnValue, action, stub, passedResults;
            beforeEach(function () {
                stub = sinon.stub().returns('return value');
            });

            describe('when the action does not want a callback', function () {
                beforeEach(function () {
                    action = function (getValue) {
                        passedResults = getValue();
                        return stub.apply(this, arguments);
                    };
                    sip.plugin('getValue', function () { return 'special value'; });
                    new Task(sip, {
                        name : 'some.task',
                        description : 'Some Pig!',
                        action : action
                    }).register(sip);
                });

                it('should register a task with [ name ] and [ action ]', function () {
                    expect(gulp.task.callCount).to.equal(1);
                    expect(gulp.task.firstCall.args).to.have.length(2);
                    expect(gulp.task.firstCall.args[0]).to.equal('some.task');
                    expect(gulp.task.firstCall.args[1]).to.be.a('function');
                });

                describe('generated function', function () {
                    beforeEach(function () {
                        fn = gulp.task.firstCall.args[1];
                        returnValue = fn();
                    });

                    it('should not have zero arguments', function () {
                        expect(util.extractFunctionArguments(fn)).to.have.length(0);
                    });

                    it('should not have [ done ] in the argument list', function () {
                        expect(util.extractFunctionArguments(fn)).to.not.include('done');
                    });

                    it('should call [ task.action ]', function () {
                        expect(stub.callCount).to.equal(1);
                    });

                    it('should be called on [ gulp ]', function () {
                        expect(stub.calledOn(gulp)).to.be.true;
                    });

                    it('should return what [ task.action ] returns', function () {
                        expect(returnValue).to.equal('return value');
                    });

                    it('should pass all requested plugins to [ task.action ]', function () {
                        expect(stub.firstCall.args).to.have.length(1);
                        expect(passedResults).to.equal('special value');
                    });

                    it('should output the task description when [ sip.config.verbose ] is true and [ task.description ] is set', function () {
                        var temp = sip.config.verbose;
                        sip.config.verbose = true;
                        sinon.stub(console, 'log');
                        try {
                            fn();
                            expect(console.log.callCount).to.equal(1);
                            expect(console.log.firstCall.args).to.deep.equal(['\u001b[0m[\u001b[1m\u001b[34msip\u001b[39m\u001b[22m] ' +
                            '\u001b[90m Some Pig!\u001b[39m']);
                        } finally {
                            sip.config.verbose = temp;
                            console.log.restore();
                        }
                    });
                });
            });

            describe('when the action wants a callback', function () {
                var doneStub;
                beforeEach(function () {
                    doneStub = sinon.stub();
                    action = function (done, getValue) {
                        passedResults = getValue();
                        done('I am done');
                        return stub.apply(this, arguments);
                    };
                    sip.plugin('getValue', function () { return 'special value'; });
                    new Task(sip, {
                        name : 'some.async.task',
                        description : 'An Async Task',
                        action : action
                    }).register(sip);
                });

                it('should register a task with [ name ] and [ action ]', function () {
                    expect(gulp.task.callCount).to.equal(1);
                    expect(gulp.task.firstCall.args).to.have.length(2);
                    expect(gulp.task.firstCall.args[0]).to.equal('some.async.task');
                    expect(gulp.task.firstCall.args[1]).to.be.a('function');
                });

                describe('generated function', function () {
                    beforeEach(function () {
                        fn = gulp.task.firstCall.args[1];
                        returnValue = fn(doneStub);
                    });

                    it('should not have one argument called [ done ]', function () {
                        var args = util.extractFunctionArguments(fn);
                        expect(args).to.have.length(1);
                        expect(args[0]).to.equal('done');
                    });

                    it('should call [ task.action ]', function () {
                        expect(stub.callCount).to.equal(1);
                    });

                    it('should not return what [ task.action ] returns', function () {
                        expect(returnValue).to.be.undefined;
                    });

                    it('should be called on [ gulp ]', function () {
                        expect(stub.calledOn(gulp)).to.be.true;
                    });

                    it('should pass all requested plugins to [ task.action ]', function () {
                        expect(stub.firstCall.args).to.have.length(2);
                        expect(passedResults).to.equal('special value');
                    });

                    it('should pass the [ done ] argument in the correct position', function () {
                        expect(stub.firstCall.args[0]).to.deep.equal(doneStub);
                        expect(doneStub.callCount).to.equal(1);
                        expect(doneStub.firstCall.args).to.deep.equal(['I am done']);
                    });

                    it('should output the task description when [ sip.config.verbose ] is true and [ task.description ] is set', function () {
                        var temp = sip.config.verbose;
                        sip.config.verbose = true;
                        sinon.stub(console, 'log');
                        try {
                            fn(doneStub);
                            expect(console.log.callCount).to.equal(1);
                            expect(console.log.firstCall.args).to.deep.equal(['\u001b[0m[\u001b[1m\u001b[34msip\u001b[39m\u001b[22m] ' +
                            '\u001b[90m An Async Task\u001b[39m']);
                        } finally {
                            sip.config.verbose = temp;
                            console.log.restore();
                        }
                    });
                });
            });
        });

        describe('when an action is set and dependencies are set', function () {
            it('should register a task with [ name ] and [ action ]', function () {
                new Task(sip, {
                    name : 'complicated.root.task',
                    dependencies : ['other.root.task'],
                    action : function () {}
                }).register(sip);
                expect(gulp.task.callCount).to.equal(1);
                expect(gulp.task.firstCall.args).to.have.length(3);
                expect(gulp.task.firstCall.args[0]).to.equal('complicated.root.task');
                expect(gulp.task.firstCall.args[1]).to.deep.equal(['other.root.task']);
                expect(gulp.task.firstCall.args[2]).to.be.a('function');
            });
        });
    });
});
