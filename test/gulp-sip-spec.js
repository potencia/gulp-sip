'use strict';

var GulpSip = require('../lib/gulp-sip'),
Task = require('../lib/task'),
expect = require('chai').expect,
sinon = require('sinon');

describe('GulpSip', function () {
    var sip, gulpImpersonator;

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
                env : {
                    verbose : ['v', 'verbose']
                }
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
        var fakeOption1, fakeOption2, config;
        beforeEach(function () {
            fakeOption1 = sinon.stub();
            fakeOption2 = sinon.stub();
            sip.configure.configurations.fakeOption1 = fakeOption1;
            sip.configure.configurations.fakeOption2 = fakeOption2;
            gulpImpersonator = {
                task : function () {},
                src : function () {},
                dest : function () {},
                watch : function () {}
            };
            config = {env : {}};
        });

        afterEach(function () {
            delete sip.configure.configurations.fakeOption1;
            delete sip.configure.configurations.fakeOption2;
        });

        it('should have an object property [ configurations ]', function () {
            expect(sip.configure).to.have.property('configurations');
            expect(sip.configure.configurations).to.be.an('object');
        });

        describe('return value', function () {
            it('should be an array', function () {
                expect(sip.configure()).to.be.an('array');
            });

            it('should have an element for each argument passed', function () {
                expect(sip.configure(null)).to.have.length(1);
                expect(sip.configure(null, {})).to.have.length(2);
            });

            it('should return false for arguments that are not objects', function () {
                expect(sip.configure(1)).to.deep.equal([false]);
                expect(sip.configure('')).to.deep.equal([false]);
                expect(sip.configure(false)).to.deep.equal([false]);
                expect(sip.configure(null)).to.deep.equal([false]);
                expect(sip.configure(undefined)).to.deep.equal([false]);
                expect(sip.configure([])).to.deep.equal([false]);
            });

            it('should return an object for arguments that are configuration objects', function () {
                expect(sip.configure({})[0]).to.be.an('object');
            });

            describe('object return value', function () {
                it('should have matching keys to the object passed in', function () {
                    expect(Object.keys(sip.configure({
                        something : true,
                        other : false
                    })[0])).to.have.members(['something', 'other']);
                });

                it('should result in each [ return[key] ] being the return value of [ sip.configure.configuration[key]() ]', function () {
                    fakeOption1.returns('1');
                    fakeOption2.returns(true);
                    expect(sip.configure({
                        something : true,
                        fakeOption1 : false,
                        fakeOption2 : 256
                    })).to.deep.equal([{
                        something : undefined,
                        fakeOption1 : '1',
                        fakeOption2 : true
                    }]);
                });
            });

            describe('valid gulp object return value', function () {
                it('should be [ true ]', function () {
                    expect(sip.configure(gulpImpersonator)[0]).to.be.true;
                });
            });
        });

        describe('with configuration object', function () {
            it('should call for each [ configuration[key] ] it should call the function [ sip.configure.configuration[key]() ]', function () {
                sip.configure({
                    fakeOption1 : true,
                    fakeOption2 : true
                }, {
                    fakeOption1 : true
                });
                expect(fakeOption1.callCount).to.equal(2);
                expect(fakeOption2.callCount).to.equal(1);
            });

            it('should pass the values [ configuration[key], sip.config, sip ] to [ sip.configure.configuration[key]() ]', function () {
                sip.configure({
                    fakeOption1 : true,
                    fakeOption2 : false
                }, {
                    fakeOption1 : 1
                });
                expect(fakeOption1.firstCall.args).to.deep.equal([true, sip.config, sip]);
                expect(fakeOption1.secondCall.args).to.deep.equal([1, sip.config, sip]);
                expect(fakeOption2.firstCall.args).to.deep.equal([false, sip.config, sip]);
            });

            it('should ignore [ key ] values that have no corresponding [ sip.configure.configuration[key] ]', function () {
                sip.configure({
                    fakeOption3 : true,
                    fakeOption2 : false
                }, {
                    fakeOption1 : 1
                });
                expect(fakeOption1.callCount).to.equal(1);
                expect(fakeOption2.callCount).to.equal(1);
            });
        });

        describe('with valid gulp object', function () {
            it('should not treat the argument like a configuration object', function () {
                gulpImpersonator.fakeOption1 = true;
                sip.configure(gulpImpersonator);
                expect(fakeOption1.callCount).to.equal(0);
            });

            it('should set [ sip.config ] with the valid gulp object', function () {
                sip.configure(gulpImpersonator);
                expect(sip.config.gulp).to.deep.equal(gulpImpersonator);
            });
        });

        describe('configurations', function () {
            describe('gulp', function () {
                var fakeSip;
                beforeEach(function () {
                    fakeSip = {plugins : {gulp : {}}};
                });

                it('should return true when ducktyping determines that [ gulp ] is a valid gulp object', function () {
                    expect(sip.configure.configurations.gulp(gulpImpersonator, config, fakeSip)).to.be.true;
                });

                it('should return false when ducktyping determines that [ gulp ] is not a valid gulp object', function () {
                    expect(sip.configure.configurations.gulp({}, config, fakeSip)).to.be.false;
                });

                it('should set [ sip.config.gulp ] to [ gulp ] when ducktyping determines that [ gulp ] is a valid gulp object', function () {
                    sip.configure.configurations.gulp(gulpImpersonator, config, fakeSip);
                    expect(config.gulp).to.deep.equal(gulpImpersonator);
                });

                it('should set [ sip.plugins.gulp.value ] to [ gulp ] when ducktyping determines that [ gulp ] is a valid gulp object', function () {
                    sip.configure.configurations.gulp(gulpImpersonator, config, fakeSip);
                    expect(fakeSip.plugins.gulp.value).to.deep.equal(gulpImpersonator);
                });

                it('should not set [ sip.config.gulp ] to [ gulp ] when ducktyping determines that [ gulp ] is a not valid gulp object', function () {
                    sip.configure.configurations.gulp({}, config, fakeSip);
                    expect(config.gulp).to.be.undefined;
                });
            });

            describe('env', function () {
                var envFakeOption;
                beforeEach(function () {
                    envFakeOption = sinon.stub().returns('fakeReturn');
                    sip.configure.configurations.envFakeOption = envFakeOption;
                });

                afterEach(function () {
                    delete sip.configure.configurations.envFakeOption;
                });

                it('should call the envKey configuration for each key', function () {
                    sip.configure({
                        env : {
                            fakeOption : true
                        }
                    });
                    expect(envFakeOption.callCount).to.equal(1);
                });

                it('should return the results in an object', function () {
                    expect(sip.configure({
                        env : {
                            fakeOption : true
                        }
                    })).to.deep.equal([{
                        env : {
                            fakeOption : 'fakeReturn'
                        }
                    }]);
                });
            });

            describe('envVerbose', function () {
                it('should ignore any value that is not an array of strings', function () {
                    sip.configure.configurations.envVerbose(1, config);
                    sip.configure.configurations.envVerbose([1, 3], config);
                    sip.configure.configurations.envVerbose(['1', false], config);
                    expect(config.env.verbose).to.be.undefined;
                });

                it('should set [ sip.config.env.verbose ] to the provided list', function () {
                    sip.configure.configurations.envVerbose([], config);
                    expect(config.env.verbose).to.be.deep.equal([]);
                    sip.configure.configurations.envVerbose(['VERBOSE', 'VERB'], config);
                    expect(config.env.verbose).to.be.deep.equal(['VERBOSE', 'VERB']);
                });

                it('should be called on [ sip.configure({env.verbose: ?}) ]', function () {
                    sinon.spy(sip.configure.configurations, 'envVerbose');
                    sip.configure({env : {verbose : []}});
                    expect(sip.configure.configurations.envVerbose.callCount).to.equal(1);
                    sip.configure.configurations.envVerbose.restore();
                });
            });
        });
    });

    describe('.checkEnv()', function () {
        var fakeEnvOption;
        beforeEach(function () {
            fakeEnvOption = sinon.stub();
            sip.checkEnv.configurations.fakeEnvOption = fakeEnvOption;
        });

        afterEach(function () {
            delete sip.checkEnv.configurations.fakeEnvOption;
        });

        it('should call sip.checkEnv.configurations[key] for each key in sip.config.env', function () {
            sip.config.env.fakeEnvOption = true;
            sip.checkEnv();
            delete sip.config.env.fakeEnvOption;
            expect(fakeEnvOption.callCount).to.equal(1);
            expect(fakeEnvOption.firstCall.args).to.deep.equal([true, sip.env, sip.config]);
        });

        it('should ignore any key that does not have a corresponding function', function () {
            sip.config.env.randomEnvOption = true;
            sip.checkEnv();
        });

        describe('configurations', function () {
            var config;
            beforeEach(function () {
                config = {};
            });

            describe('verbose', function () {
                it('should set [ sip.config.verbose ] to true if any of the [ sip.config.env.verbose ] list are present in [ sip.env ]', function () {
                    sip.checkEnv.configurations.verbose(['verbose', 'verboseOption', 'notQuiet'], {verboseOption : 'loud'}, config);
                    expect(config.verbose).to.be.true;
                });

                it('should set [ sip.config.verbose ] to false if none of the [ sip.config.env.verbose ] list are present in [ sip.env ]', function () {
                    sip.checkEnv.configurations.verbose(['verbose', 'verboseOption', 'notQuiet'], {shh : true}, config);
                    expect(config.verbose).to.be.false;
                });
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

    describe('.run()', function () {
        beforeEach(function () {
            gulpImpersonator = {
                task : sinon.stub(),
                src : function () {},
                dest : function () {},
                watch : function () {}
            };
        });

        it('should throw an Error when gulp is not set', function () {
            try {
                sip.run();
                expect(true, 'An Error should have been thrown').to.be.false;
            } catch (error) {
                expect(error.name, error).to.equal('GulpSipError');
                expect(error.message).to.equal('GulpSip requires [ gulp ]. Either pass [ gulp ] to [ GulpSip.configure() ] ' +
                'before calling [ GulpSip.run() ] or pass [ gulp ] to [ GulpSip.run() ].');
            }
        });

        it('should not throw an Error when gulp is previously set', function () {
            try {
                sip.configure(gulpImpersonator);
                sip.run();
            } catch (error) {
                expect(error).to.be.undefined;
            }
        });

        it('should not throw an Error when gulp is passed', function () {
            try {
                sip.run(gulpImpersonator);
            } catch (error) {
                expect(error).to.be.undefined;
            }
        });

        it('should pass all arguments to [ sip.configure ]', function () {
            sinon.spy(sip, 'configure');
            sip.run(1, 2, 3, 4, gulpImpersonator);
            expect(sip.configure.callCount).to.equal(1);
            expect(sip.configure.firstCall.args).to.deep.equal([1, 2, 3, 4, gulpImpersonator]);
            sip.configure.restore();
        });

        it('should call [ sip.checkEnv ]', function () {
            sinon.spy(sip, 'checkEnv');
            sip.run(gulpImpersonator);
            expect(sip.checkEnv.callCount).to.equal(1);
            sip.checkEnv.restore();
        });

        it('should cause [ gulp.task ] to be called once for each Task created by [ sip.tasks ]', function () {
            sip.task('first', function () {});
            sip.task('second', function () {});
            sip.task('third', function () {});
            sip.run(gulpImpersonator);
            expect(gulpImpersonator.task.callCount).equal(3);
            expect(gulpImpersonator.task.getCall(0).args[0]).equal('first');
            expect(gulpImpersonator.task.getCall(1).args[0]).equal('second');
            expect(gulpImpersonator.task.getCall(2).args[0]).equal('third');
        });

        it('when run a second time should not cause [ gulp.task ] to be called an already registered tasks', function () {
            sip.configure(gulpImpersonator);
            sip.task('first', function () {});
            sip.task('second', function () {});
            sip.run();
            expect(gulpImpersonator.task.callCount).equal(2);
            expect(gulpImpersonator.task.getCall(0).args[0]).equal('first');
            expect(gulpImpersonator.task.getCall(1).args[0]).equal('second');
            gulpImpersonator.task.reset();
            sip.task('third', function () {});
            sip.task('fourth', function () {});
            sip.run();
            expect(gulpImpersonator.task.callCount).equal(2);
            expect(gulpImpersonator.task.getCall(0).args[0]).equal('third');
            expect(gulpImpersonator.task.getCall(1).args[0]).equal('fourth');
        });
    });
});
