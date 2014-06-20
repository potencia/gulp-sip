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
        var descriptor = Object.getOwnPropertyDescriptor(sip, 'plugins');
        expect(descriptor.enumerable).to.be.false;
        expect(descriptor.configurable).to.be.false;
        expect(descriptor.writable).to.be.false;
        expect(descriptor.value).to.be.an('object');
    });

    it('should have array property [ tasks ]', function () {
        var descriptor = Object.getOwnPropertyDescriptor(sip, 'tasks');
        expect(descriptor.enumerable).to.be.false;
        expect(descriptor.configurable).to.be.false;
        expect(descriptor.writable).to.be.false;
        expect(descriptor.value).to.be.an('array');
        expect(sip.tasks).to.have.length(0);
    });

    describe('index', function () {
        beforeEach(function () {
            sip = require('../index');
        });

        it('should export an instance of GulpSip', function () {
            expect(sip).to.deep.equal(new GulpSip());
        });
    });

    describe('.gulp <getter>', function () {
        it('should be a special property', function () {
            var descriptor = Object.getOwnPropertyDescriptor(sip, 'gulp');
            expect(descriptor.enumerable).to.be.false;
            expect(descriptor.configurable).to.be.false;
            expect(descriptor).to.not.have.property('writable');
            expect(descriptor).to.not.have.property('value');
            expect(descriptor).to.have.property('get');
            expect(descriptor).to.not.have.property('set');
        });

        it('should return the value of [ .plugins.gulp ]', function () {
            sip.plugins.gulp = '{{Test}}';
            expect(sip.gulp).to.equal('{{Test}}');
            sip.plugins.gulp = '{{Object}}';
            expect(sip.gulp).to.equal('{{Object}}');
        });

        it('should default to the gulp library', function () {
            expect(sip.gulp).to.deep.equal(require('gulp'));
        });
    });

    describe('.setGulp()', function () {
        it('should return [ this ]', function () {
            expect(sip.setGulp('{Something}')).to.deep.equal(sip);
        });

        it('should set the passed value to [ sip.plugins.gulp ]', function () {
            sip.setGulp('{Something}');
            expect(sip.plugins.gulp).to.equal('{Something}');
        });
    });

    describe('.plugin()', function () {
        it('should return [ this ]', function () {
            expect(sip.plugin('test', '{Something}')).to.deep.equal(sip);
        });

        it('should set the passed plugin to the passed name on [ sip.plugins ]', function () {
            sip.plugin('test', '{Test}');
            expect(sip.plugins.test).to.equal('{Test}');
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
                expect(sip.plugins.test).to.equal('{Something}');
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
