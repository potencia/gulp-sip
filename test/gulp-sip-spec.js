'use strict';

var GulpSip = require('../lib/gulp-sip'),
Task = require('../lib/task'),
expect = require('chai').expect,
sinon = require('sinon');

describe('GulpSip', function () {
    var sip;

    beforeEach(function () {
        sip = new GulpSip();
    });

    it('should have object property [ plugins ]', function () {
        expect(Object.getOwnPropertyDescriptor(sip, 'plugins')).to.deep.equal({
            enumerable : false,
            configurable : false,
            writable : false,
            value : {
                gulp : {}
            }
        });
    });

    it('should have array property [ tasks ]', function () {
        expect(Object.getOwnPropertyDescriptor(sip, 'tasks')).to.deep.equal({
            enumerable : false,
            configurable : false,
            writable : false,
            value : []
        });
    });

    it('should have a property [ env ]', function () {
        expect(Object.getOwnPropertyDescriptor(sip, 'env')).to.deep.equal({
            enumerable : false,
            configurable : false,
            writable : false,
            value : require('../lib/util').env
        });
    });

    it('should have a property [ config ]', function () {
        expect(Object.getOwnPropertyDescriptor(sip, 'config')).to.deep.equal({
            enumerable : false,
            configurable : false,
            writable : false,
            value : {
                gulp : null,
                verbose : false
            }
        });
    });

    describe('index', function () {
        beforeEach(function () {
            sip = require('../index');
        });

        it('should export an instance of GulpSip', function () {
            expect(sip).to.deep.equal(new GulpSip());
        });
    });

    describe('.configure()', function () {
        it('should use ducktyping to detect if arguments[0] is [ gulp ]', function () {
            var fakeGulp1 = {
                task : function () {},
                src : function () {},
                dest : function () {},
                watch : function () {},
                num : 1
            }, fakeGulp2 = {
                task : function () {},
                src : function () {},
                dest : function () {},
                watch : function () {},
                num : 2
            };

            expect(sip.config.gulp).to.be.null;
            sip.configure(fakeGulp1);
            expect(sip.config.gulp).to.deep.equal(fakeGulp1);
            sip.configure({});
            expect(sip.config.gulp).to.deep.equal(fakeGulp1);
            sip.configure(null, fakeGulp2, null);
            expect(sip.config.gulp).to.deep.equal(fakeGulp2);
            sip.configure();
            expect(sip.config.gulp).to.deep.equal(fakeGulp2);
        });

        it('should assume non-gulp objects are configuration objects', function () {
            sip.configure({
                verboseEnv : ['verboseOptionShouldBeSet'],
                notAConfigurationOption : false
            });
            expect(sip.config.verbose).to.be.false;
        });

        describe('verboseEnv', function () {
            it('should ignore anything other than an array', function () {
                sip.config.verbose = null;
                sip.configure({
                    verboseEnv : {key : true}
                });
                expect(sip.config.verbose).to.be.null;
            });

            it('should set [ sip.config.verbose ] if none of the list are present on the command line', function () {
                sip.config.verbose = null;
                sip.configure({
                    verboseEnv : [1, 2, 3, function () {}]
                });
                expect(sip.config.verbose).to.be.false;
            });

            it('should set [ sip.config.verbose ] if any of the list are present on the command line', function () {
                sip.config.verbose = null;
                sip.env.verboseOptionShouldBeSet = true;
                sip.configure({
                    verboseEnv : [1, 2, 3, 'verboseOptionShouldBeSet']
                });
                delete sip.env.verboseOptionShouldBeSet;
                expect(sip.config.verbose).to.be.true;
            });
        });
    });

    describe('.plugin()', function () {
        it('should return [ this ]', function () {
            expect(sip.plugin('test', '{Something}')).to.deep.equal(sip);
        });

        it('should set the passed plugin to the passed name on [ sip.plugins ]', function () {
            sip.plugin('test', '{Test}');
            expect(sip.plugins.test).to.deep.equal({value : '{Test}'});
        });

        it('should throw and Error when the name is [ done ]', function () {
            try {
                sip.plugin('done', '{Test}');
                expect(true, 'An Error should have been thrown').to.be.false;
            } catch (error) {
                expect(error.name, error).to.equal('GulpSipError');
                expect(error.message).to.equal('The plugin [ done ] is reserved to inject the [ done() ] callback function for asynchronous task support. ' +
                                               'It cannot be used as a registered plugin name.');
            }
        });

        it('should throw and Error when the plugin is [ null ]', function () {
            try {
                sip.plugin('test', null);
                expect(true, 'An Error should have been thrown').to.be.false;
            } catch (error) {
                expect(error.name, error).to.equal('GulpSipError');
                expect(error.message).to.equal('Cannot register [ test ] as an undefined or null object.');
            }
        });

        it('should throw and Error when the plugin is [ undefined ]', function () {
            try {
                sip.plugin('test');
                expect(true, 'An Error should have been thrown').to.be.false;
            } catch (error) {
                expect(error.name, error).to.equal('GulpSipError');
                expect(error.message).to.equal('Cannot register [ test ] as an undefined or null object.');
            }
        });

        it('should throw and Error when no arguments are passed', function () {
            try {
                sip.plugin();
                expect(true, 'An Error should have been thrown').to.be.false;
            } catch (error) {
                expect(error.name, error).to.equal('GulpSipError');
                expect(error.message).to.equal('[ name ] and [ plugin ] are required arguments.');
            }
        });

        describe('duplicate registration', function () {
            beforeEach(function () {
                sinon.stub(console, 'log');
            });

            afterEach(function () {
                console.log.restore();
            });

            it('should ignore duplicate plugin registrations', function () {
                sip.plugin('test', '{Something}');
                sip.plugin('test', '{Something Else}');
                expect(sip.plugins.test).to.deep.equal({value : '{Something}'});
            });

            it('should output a warning message when a plugin is name is reused', function () {
                sip.plugin('test', '{Something}');
                expect(console.log.callCount).to.equal(0);
                sip.plugin('test', '{Something Else}');
                expect(console.log.callCount).to.equal(1);
                expect(console.log.firstCall.args[0]).to.equal('\u001b[0m[\u001b[1m\u001b[34msip\u001b[39m\u001b[22m] \u001b[33m\u001b[1mWARNING:\u001b[22m ' +
                'A plugin named [ test ] has already been registered. Duplicate registrations are ignored.\u001b[39m');
            });
        });
    });

    describe('.task()', function () {
        it('should add a Task object in the [ sip.tasks ] array', function () {
            sip.task('name', function action () {});
            expect(sip.tasks).to.have.length(1);
            expect(sip.tasks[0]).to.be.an.instanceOf(Task);
        });

        it('should accept a configuration object as it\'s only argument', function () {
            sip.task({
                name : 'name',
                action : function () {}
            });
            expect(sip.tasks[0].name).to.equal('name');
            expect(sip.tasks[0].action).to.be.a('function');
        });

        it('should accept a string [ name ] as it\'s first argument', function () {
            sip.task('name', function action () {});
            expect(sip.tasks[0].name).to.equal('name');
        });

        it('should accept an optional string [ description ] after the [ name ] argument', function () {
            sip.task('name', 'desc', function action () {});
            expect(sip.tasks[0].name).to.equal('name');
            expect(sip.tasks[0].description).to.equal('desc');
            expect(sip.tasks[0].action).to.be.a('function');
        });

        it('should accept an optional array [ dependencies ] after the [ name ] argument', function () {
            sip.task('name', ['other']);
            expect(sip.tasks[0].name).to.equal('name');
            expect(sip.tasks[0].dependencies).to.deep.equal(['other']);
        });

        it('should accept an optional function [ action ] as after the [ name ] argument', function () {
            sip.task('name', function action () {});
            expect(sip.tasks[0].name).to.equal('name');
            expect(sip.tasks[0].action).to.be.a('function');
        });

        it('should accept an optional array [ dependencies ] after the [ description ] argument', function () {
            sip.task('name', 'desc', ['other']);
            expect(sip.tasks[0].name).to.equal('name');
            expect(sip.tasks[0].description).to.equal('desc');
            expect(sip.tasks[0].dependencies).to.deep.equal(['other']);
        });

        it('should accept an optional function [ action ] as after the [ description ] argument', function () {
            sip.task('name', 'desc', function action () {});
            expect(sip.tasks[0].name).to.equal('name');
            expect(sip.tasks[0].description).to.equal('desc');
            expect(sip.tasks[0].action).to.be.a('function');
        });

        it('should accept an optional function [ action ] as after the [ dependencies ] argument', function () {
            sip.task('name', 'desc', ['other'], function action () {});
            expect(sip.tasks[0].name).to.equal('name');
            expect(sip.tasks[0].description).to.equal('desc');
            expect(sip.tasks[0].dependencies).to.deep.equal(['other']);
            expect(sip.tasks[0].action).to.be.a('function');
        });

        it('should ignore null and undefined arguments', function () {
            sip.task(null, 'name', null, undefined, null, function action () {}, undefined);
            expect(sip.tasks[0].name).to.equal('name');
            expect(sip.tasks[0].action).to.be.a('function');
        });

        it('should throw and Error when the name matches an already registered task', function () {
            try {
                sip.task('duplicate', function () {});
                sip.task('duplicate', function () {});
                expect(true, 'An Error should have been thrown').to.be.false;
            } catch (error) {
                expect(error.name, error).to.equal('GulpSipError');
                expect(error.message).to.equal('The task [ duplicate ] has already been defined. Unique task names are required.');
            }
        });
    });
});
