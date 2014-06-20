'use strict';

var extractFunctionArguments = require('../lib/util').extractFunctionArguments,
log = require('../lib/util').log,
specialCases = require('./spec-special.js'),
expect = require('chai').expect,
sinon = require('sinon'),
eol = require('os').EOL;

describe('util', function () {
    var args;
    describe('.extractFunctionArguments()', function () {
        it('should handle no arguments', function () {
            args = extractFunctionArguments(function () {});
            expect(args).to.be.an('array');
            expect(args).to.have.length(0);
        });

        it('should handle one argument', function () {
            args = extractFunctionArguments(function (gulp) { return gulp; });
            expect(args).to.be.an('array');
            expect(args).to.deep.equal(['gulp']);
        });

        it('should handle two arguments', function () {
            args = extractFunctionArguments(function (a,b) { return a + b; });
            expect(args).to.be.an('array');
            expect(args).to.deep.equal(['a', 'b']);
        });

        it('should handle space in the argument definition', function () {
            args = extractFunctionArguments(specialCases.stangeSpacesInFunctionDef);
            expect(args).to.be.an('array');
            expect(args).to.deep.equal(['a', 'b']);

            args = extractFunctionArguments(
                function (
                    a,
                    b
                ) { return a + b; });
            expect(args).to.be.an('array');
            expect(args).to.deep.equal(['a', 'b']);
        });

        it('should handle multiline comments in the argument definition', function () {
            args = extractFunctionArguments(function (/*a, b*/) {});
            expect(args).to.be.an('array');
            expect(args).to.deep.equal([]);

            args = extractFunctionArguments(
                function (
                    /*a,
                    b*/
                ) {});
            expect(args).to.be.an('array');
            expect(args).to.deep.equal([]);
        });

        it('should handle inline comments in the argument definition', function () {
            args = extractFunctionArguments(
                function (
                    a, // First Arg
                    b  // Second Arg
                ) { return a + b; });
            expect(args).to.be.an('array');
            expect(args).to.deep.equal(['a', 'b']);
        });

        it('should handle all strangeness in argument definition at once', function () {
            args = extractFunctionArguments(specialCases.allIssuesInOneFunctionDef);
            expect(args).to.be.an('array');
            expect(args).to.deep.equal(['a', 'b']);
        });
    });

    describe('log', function () {
        beforeEach(function () {
            sinon.stub(console, 'log');
        });

        afterEach(function () {
            console.log.restore();
            log.ctx.stack.length = 0;
            log.ctx.subStack.length = 0;
        });

        it('should be a function', function () {
            expect(log).to.be.a('function');
        });

        it('should write to console.log', function () {
            log('test');
            expect(console.log.callCount).to.equal(1);
            expect(console.log.firstCall.args).to.deep.equal(['\u001b[0m[\u001b[1m\u001b[34msip\u001b[39m\u001b[22m] test']);
        });

        it('should return the [ log ] function', function () {
            expect(log('test')).to.deep.equal(log);
        });

        it('should write a margin to each line after the first', function () {
            log('two' + eol + 'lines');
            expect(console.log.callCount).to.equal(1);
            expect(console.log.firstCall.args).to.deep.equal(['\u001b[0m[\u001b[1m\u001b[34msip\u001b[39m\u001b[22m] two' + eol + '      lines']);
        });

        describe('ctx property', function () {
            it('should be a special property', function () {
                var descriptor = Object.getOwnPropertyDescriptor(log, 'ctx');
                expect(descriptor.enumerable).to.be.false;
                expect(descriptor.configurable).to.be.false;
                expect(descriptor.writable).to.be.false;
                expect(descriptor.value).to.be.an('object');
            });

            it('should have a [ firstLine ] property', function () {
                expect(log.ctx.firstLine).to.equal('[\u001b[1m\u001b[34msip\u001b[39m\u001b[22m] ');
            });

            it('should have a [ otherLines ] property', function () {
                expect(log.ctx.otherLines).to.equal('      ');
            });

            it('should have a [ stack ] array property', function () {
                expect(log.ctx).to.have.property('stack');
                expect(log.ctx.stack).to.be.an('array');
                expect(log.ctx.stack).to.have.length(0);
            });

            it('should have a [ subStack ] array property', function () {
                expect(log.ctx).to.have.property('subStack');
                expect(log.ctx.stack).to.be.an('array');
                expect(log.ctx.stack).to.have.length(0);
            });
        });

        describe('partial property', function () {
            it('should be a special property', function () {
                var descriptor = Object.getOwnPropertyDescriptor(log, 'partial');
                expect(descriptor.enumerable).to.be.true;
                expect(descriptor.configurable).to.be.false;
                expect(descriptor.writable).to.be.undefined;
                expect(descriptor.set).to.be.undefined;
                expect(descriptor.get).to.be.a('function');
            });

            it('should return the [ log ] function', function () {
                expect(log.partial).to.deep.equal(log);
            });

            it('should start a [ partial ] command on the stack and add it to the substack', function () {
                log.partial;
                expect(log.ctx.stack).to.deep.equal([['partial', []]]);
                expect(log.ctx.subStack).to.deep.equal([['partial', []]]);
            });

            it('when executed, should only collapse back the latest [ partial ] command', function () {
                log.partial('something');
                expect(log.ctx.stack).to.deep.equal([['text', 'something']]);
                expect(log.ctx.subStack).to.have.length(0);
                log.partial.partial;
                expect(log.ctx.subStack).to.deep.equal([['partial', [['partial', []]]], ['partial', []]]);
                log(' else')(' entirely');
                expect(log.ctx.stack).to.deep.equal([['text', 'something'], ['text', ' else entirely']]);
                expect(log.ctx.subStack).to.have.length(0);
                log();
                expect(console.log.callCount).to.equal(1);
                expect(console.log.firstCall.args).to.deep.equal(['\u001b[0m[\u001b[1m\u001b[34msip\u001b[39m\u001b[22m] something else entirely']);
            });
        });

        describe('done property', function () {
            it('should be a special property', function () {
                var descriptor = Object.getOwnPropertyDescriptor(log, 'partial');
                expect(descriptor.enumerable).to.be.true;
                expect(descriptor.configurable).to.be.false;
                expect(descriptor.writable).to.be.undefined;
                expect(descriptor.set).to.be.undefined;
                expect(descriptor.get).to.be.a('function');
            });

            it('should return the [ log ] function', function () {
                expect(log.done).to.deep.equal(log);
            });

            it('should truncate the substack and output the text', function () {
                log.partial.bold.partial.red.partial('get me outa here!');
                expect(log.ctx.subStack).to.deep.equal([
                    ['partial', ['bold', ['partial', ['red', ['text', 'get me outa here!']]]]],
                    ['partial', ['red', ['text', 'get me outa here!']]]
                ]);
                log.done;
                expect(log.ctx.subStack).to.have.length(0);
                expect(console.log.callCount).to.equal(1);
                expect(console.log.firstCall.args).to.deep.equal(['\u001b[0m[\u001b[1m\u001b[34msip\u001b[39m\u001b[22m] ' +
                '\u001b[1m\u001b[31mget me outa here!\u001b[39m\u001b[22m']);
            });
        });

        describe('firstline property', function () {
            var realFirstLine;

            beforeEach(function () {
                realFirstLine = log.ctx.firstLine;
            });

            afterEach(function () {
                log.ctx.firstLine = realFirstLine;
            });

            it('should be a special property', function () {
                var descriptor = Object.getOwnPropertyDescriptor(log, 'firstline');
                expect(descriptor.enumerable).to.be.true;
                expect(descriptor.configurable).to.be.false;
                expect(descriptor.writable).to.be.undefined;
                expect(descriptor.set).to.be.undefined;
                expect(descriptor.get).to.be.a('function');
            });

            it('should return the [ log ] function', function () {
                expect(log.firstline).to.deep.equal(log);
            });

            it('should start a [ firstline ] command on the stack and add it to the substack', function () {
                log.firstline;
                expect(log.ctx.stack).to.deep.equal([['firstline', []]]);
                expect(log.ctx.subStack).to.deep.equal([['firstline', []]]);
            });

            it('when executed, should only collapse back the latest [ firstline ] command and save the result to [ log.ctx.firstLine ]', function () {
                log.firstline.bold;
                expect(log.ctx.subStack).to.deep.equal([['firstline', ['bold']]]);
                log('logstart ');
                expect(log.ctx.firstLine).to.equal('\u001b[1mlogstart \u001b[22m');
                expect(log.ctx.stack).to.deep.equal([]);
                expect(log.ctx.subStack).to.have.length(0);
                log('First Line Change Test');
                expect(console.log.callCount).to.equal(1);
                expect(console.log.firstCall.args).to.deep.equal(['\u001b[0m\u001b[1mlogstart \u001b[22mFirst Line Change Test']);
            });
        });

        describe('otherlines property', function () {
            var realOtherLines;

            beforeEach(function () {
                realOtherLines = log.ctx.otherLines;
            });

            afterEach(function () {
                log.ctx.otherLines = realOtherLines;
            });

            it('should be a special property', function () {
                var descriptor = Object.getOwnPropertyDescriptor(log, 'otherlines');
                expect(descriptor.enumerable).to.be.true;
                expect(descriptor.configurable).to.be.false;
                expect(descriptor.writable).to.be.undefined;
                expect(descriptor.set).to.be.undefined;
                expect(descriptor.get).to.be.a('function');
            });

            it('should return the [ log ] function', function () {
                expect(log.otherlines).to.deep.equal(log);
            });

            it('should start a [ otherlines ] command on the stack and add it to the substack', function () {
                log.otherlines;
                expect(log.ctx.stack).to.deep.equal([['otherlines', []]]);
                expect(log.ctx.subStack).to.deep.equal([['otherlines', []]]);
            });

            it('when executed, should only collapse back the latest [ otherlines ] command and save the result to [ log.ctx.otherLines ]', function () {
                log.otherlines.red.partial.backCyan('-')('---- ');
                expect(log.ctx.otherLines).to.equal('\u001b[31m\u001b[46m-\u001b[49m---- \u001b[39m');
                expect(log.ctx.stack).to.deep.equal([]);
                expect(log.ctx.subStack).to.have.length(0);
                log.eol('Other Line Test');
                expect(console.log.callCount).to.equal(1);
                expect(console.log.firstCall.args).to.deep.equal(['\u001b[0m[\u001b[1m\u001b[34msip\u001b[39m\u001b[22m] ' +
                eol + '\u001b[31m\u001b[46m-\u001b[49m---- \u001b[39mOther Line Test']);
            });
        });

        describe('alllines property', function () {
            var realFirstLine, realOtherLines;

            beforeEach(function () {
                realFirstLine = log.ctx.firstLine;
                realOtherLines = log.ctx.otherLines;
            });

            afterEach(function () {
                log.ctx.firstLine = realFirstLine;
                log.ctx.otherLines = realOtherLines;
            });

            it('should be a special property', function () {
                var descriptor = Object.getOwnPropertyDescriptor(log, 'alllines');
                expect(descriptor.enumerable).to.be.true;
                expect(descriptor.configurable).to.be.false;
                expect(descriptor.writable).to.be.undefined;
                expect(descriptor.set).to.be.undefined;
                expect(descriptor.get).to.be.a('function');
            });

            it('should return the [ log ] function', function () {
                expect(log.alllines).to.deep.equal(log);
            });

            it('should start a [ alllines ] command on the stack and add it to the substack', function () {
                log.alllines;
                expect(log.ctx.stack).to.deep.equal([['alllines', []]]);
                expect(log.ctx.subStack).to.deep.equal([['alllines', []]]);
            });

            it(
            'when executed, should only collapse back the latest [ alllines ] command and save the result to [ log.ctx.firstLine ] and [ log.ctx.otherLines ]',
            function () {
                log.alllines.magenta(':: ');
                expect(log.ctx.otherLines).to.equal('\u001b[35m:: \u001b[39m');
                expect(log.ctx.stack).to.deep.equal([]);
                expect(log.ctx.subStack).to.have.length(0);
                log.partial('All Lines 1').eol('All Lines 2');
                expect(console.log.callCount).to.equal(1);
                expect(console.log.firstCall.args).to.deep.equal(['\u001b[0m\u001b[35m:: \u001b[39mAll Lines 1' + eol + '\u001b[35m:: \u001b[39mAll Lines 2']);
            });
        });

        describe('standard log control property (eol)', function () {
            it('should be a special property', function () {
                var descriptor = Object.getOwnPropertyDescriptor(log, 'eol');
                expect(descriptor.enumerable).to.be.true;
                expect(descriptor.configurable).to.be.false;
                expect(descriptor.writable).to.be.undefined;
                expect(descriptor.set).to.be.undefined;
                expect(descriptor.get).to.be.a('function');
            });

            it('should return the [ log ] function', function () {
                expect(log.eol).to.deep.equal(log);
            });

            it('should add the [ eol ] command to the stack', function () {
                log.eol;
                expect(log.ctx.stack).to.deep.equal(['eol']);
            });
        });

        it('should be able to combine any log control property', function () {
            log.blue.partial.bold('Title').eol('Body');
            expect(console.log.callCount).to.equal(1);
            expect(console.log.firstCall.args).to.deep.equal(['\u001b[0m[\u001b[1m\u001b[34msip\u001b[39m\u001b[22m] \u001b[34m\u001b[1mTitle\u001b[22m' +
            eol + '      Body\u001b[39m']);
        });

        it('should have all control properties', function () {
            expect(log).to.have.property('reset');
            expect(log).to.have.property('re');
            expect(log).to.have.property('bold');
            expect(log).to.have.property('bo');
            expect(log).to.have.property('italic');
            expect(log).to.have.property('i');
            expect(log).to.have.property('under');
            expect(log).to.have.property('u');
            expect(log).to.have.property('inverse');
            expect(log).to.have.property('inv');
            expect(log).to.have.property('strike');
            expect(log).to.have.property('s');
            expect(log).to.have.property('black');
            expect(log).to.have.property('bla');
            expect(log).to.have.property('red');
            expect(log).to.have.property('r');
            expect(log).to.have.property('green');
            expect(log).to.have.property('gre');
            expect(log).to.have.property('yellow');
            expect(log).to.have.property('y');
            expect(log).to.have.property('blue');
            expect(log).to.have.property('blu');
            expect(log).to.have.property('magenta');
            expect(log).to.have.property('m');
            expect(log).to.have.property('cyan');
            expect(log).to.have.property('c');
            expect(log).to.have.property('white');
            expect(log).to.have.property('w');
            expect(log).to.have.property('gray');
            expect(log).to.have.property('grey');
            expect(log).to.have.property('gra');
            expect(log).to.have.property('backBlack');
            expect(log).to.have.property('bbla');
            expect(log).to.have.property('backRed');
            expect(log).to.have.property('br');
            expect(log).to.have.property('backGreen');
            expect(log).to.have.property('bg');
            expect(log).to.have.property('backYellow');
            expect(log).to.have.property('by');
            expect(log).to.have.property('backBlue');
            expect(log).to.have.property('bblu');
            expect(log).to.have.property('backMagenta');
            expect(log).to.have.property('bm');
            expect(log).to.have.property('backCyan');
            expect(log).to.have.property('bc');
            expect(log).to.have.property('backWhite');
            expect(log).to.have.property('bw');
            log();
            console.log.reset();

            log.reset.backBlack
            .partial.bold('bold')
            .partial(' ').partial.italic('italic')
            .partial(' ').partial.under('under')
            .partial(' ').partial.inverse('inverse')
            .partial(' ').partial.strike('strike')
            .eol
            .partial(' ').partial.red('red')
            .partial(' ').partial.green('green')
            .partial(' ').partial.yellow('yellow')
            .partial(' ').partial.blue('blue')
            .partial(' ').partial.magenta('magenta')
            .partial(' ').partial.cyan('cyan')
            .partial(' ').partial.white('white')
            .partial(' ').partial.gray('gray')
            .eol
            .partial.black
            .partial(' ').partial.backRed('backRed')
            .partial(' ').partial.backGreen('backGreen')
            .partial(' ').partial.backYellow('backYellow')
            .partial(' ').partial.backBlue('backBlue')
            .eol
            .partial(' ').partial.backMagenta('backMagenta')
            .partial(' ').partial.backCyan('backCyan')
            .partial(' ').partial.backWhite('backWhite')
            ().re.bbla
            .eol
            .partial(' ').partial.bo('bo')
            .partial(' ').partial.i('i')
            .partial(' ').partial.u('u')
            .partial(' ').partial.inv('inv')
            .partial(' ').partial.s('s')
            .eol
            .partial(' ').partial.r('r')
            .partial(' ').partial.gre('gre')
            .partial(' ').partial.y('y')
            .partial(' ').partial.blu('blu')
            .partial(' ').partial.m('m')
            .partial(' ').partial.c('c')
            .partial(' ').partial.w('w')
            .partial(' ').partial.grey('grey')
            .partial(' ').partial.gra('gra')
            .eol
            .partial.bla
            .partial(' ').partial.br('br')
            .partial(' ').partial.bg('bg')
            .partial(' ').partial.by('by')
            .partial(' ').partial.bblu('bblu')
            .partial(' ').partial.bm('bm')
            .partial(' ').partial.bc('bc')
            .partial(' ').partial.bw('bw')
            ()
            .eol
            (' normal');
            expect(console.log.callCount).to.equal(1);
            expect(console.log.firstCall.args).to.deep.equal(['\u001b[0m[\u001b[1m\u001b[34msip\u001b[39m\u001b[22m] ' +
            '\u001b[0m\u001b[40m' +              // .reset.backBlack
            '\u001b[1mbold\u001b[22m ' +         // .partial.bold('bold').partial(' ')
            '\u001b[3mitalic\u001b[23m ' +       // .partial.italic('italic').partial(' ')
            '\u001b[4munder\u001b[24m ' +        // .partial.under('under').partial(' ')
            '\u001b[7minverse\u001b[27m ' +      // .partial.inverse('inverse').partial(' ')
            '\u001b[9mstrike\u001b[29m' +        // .partial.strike('strike')
            eol + '       ' +                    // .eol.partial(' ')
            '\u001b[31mred\u001b[39m ' +         // .partial.red('red').partial(' ')
            '\u001b[32mgreen\u001b[39m ' +       // .partial.green('green').partial(' ')
            '\u001b[33myellow\u001b[39m ' +      // .partial.yellow('yellow').partial(' ')
            '\u001b[34mblue\u001b[39m ' +        // .partial.blue('blue').partial(' ')
            '\u001b[35mmagenta\u001b[39m ' +     // .partial.magenta('magenta').partial(' ')
            '\u001b[36mcyan\u001b[39m ' +        // .partial.cyan('cyan').partial(' ')
            '\u001b[37mwhite\u001b[39m ' +       // .partial.white('white').partial(' ')
            '\u001b[90mgray\u001b[39m' +         // .partial.gray('gray')
            eol + '      ' +                     // .eol
            '\u001b[30m ' +                      // .partial.black.partial(' ')
            '\u001b[41mbackRed\u001b[49m ' +     // .partial.backRed('backRed').partial(' ')
            '\u001b[42mbackGreen\u001b[49m ' +   // .partial.backGreen('backGreen').partial(' ')
            '\u001b[43mbackYellow\u001b[49m ' +  // .partial.backYellow('backYellow').partial(' ')
            '\u001b[44mbackBlue\u001b[49m' +     // .partial.backBlue('backBlue')
            eol + '       ' +                    // .eol.partial(' ')
            '\u001b[45mbackMagenta\u001b[49m ' + // .partial.backMagenta('backMagenta').partial(' ')
            '\u001b[46mbackCyan\u001b[49m ' +    // .partial.backCyan('backCyan').partial(' ')
            '\u001b[47mbackWhite\u001b[49m' +    // .partial.backWhite('backWhite')
            '\u001b[39m' +                       // END .partial.black
            '\u001b[0m\u001b[40m' +              // .re.bbla
            eol + '       ' +                    // .eol.partial(' ')
            '\u001b[1mbo\u001b[22m ' +           // .partial.bo('bo').partial(' ')
            '\u001b[3mi\u001b[23m ' +            // .partial.i('i').partial(' ')
            '\u001b[4mu\u001b[24m ' +            // .partial.u('u').partial(' ')
            '\u001b[7minv\u001b[27m ' +          // .partial.inv('inv').partial(' ')
            '\u001b[9ms\u001b[29m' +             // .partial.s('s')
            eol + '       ' +                    // .eol.partial(' ')
            '\u001b[31mr\u001b[39m ' +           // .partial.r('r').partial(' ')
            '\u001b[32mgre\u001b[39m ' +         // .partial.gre('gre').partial(' ')
            '\u001b[33my\u001b[39m ' +           // .partial.y('y').partial(' ')
            '\u001b[34mblu\u001b[39m ' +         // .partial.blu('blu').partial(' ')
            '\u001b[35mm\u001b[39m ' +           // .partial.m('m').partial(' ')
            '\u001b[36mc\u001b[39m ' +           // .partial.c('c').partial(' ')
            '\u001b[37mw\u001b[39m ' +           // .partial.w('w').partial(' ')
            '\u001b[90mgrey\u001b[39m ' +        // .partial.grey('grey').partial(' ')
            '\u001b[90mgra\u001b[39m' +          // .partial.gra('gra')
            eol + '      ' +                     // .eol
            '\u001b[30m ' +                      // .partial.bla.partial(' ')
            '\u001b[41mbr\u001b[49m ' +          // .partial.br('br').partial(' ')
            '\u001b[42mbg\u001b[49m ' +          // .partial.bg('bg').partial(' ')
            '\u001b[43mby\u001b[49m ' +          // .partial.by('by').partial(' ')
            '\u001b[44mbblu\u001b[49m ' +        // .partial.bblu('bblu').partial(' ')
            '\u001b[45mbm\u001b[49m ' +          // .partial.bm('bm').partial(' ')
            '\u001b[46mbc\u001b[49m ' +          // .partial.bc('bc').partial(' ')
            '\u001b[47mbw\u001b[49m' +           // .partial.bw('bw')
            '\u001b[39m' +                       // END .partial.bla
            eol + '      ' +                     // .eol
            ' normal' +                          // (' normal')
            '\u001b[49' +                        // END .bbla
            'm\u001b[49m'                        // END .backBlack
            ]);
        });
    });
});
