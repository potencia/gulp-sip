'use strict';

var sip = require('./index'),
expect = require('chai').expect;

describe('gulp-sip', function () {
    it('should have a property [ gulp ]', function () {
        expect(sip).to.have.property('gulp');
        expect(sip.gulp).to.have.property('task');
    });

    it('should have a property [ gutil ]', function () {
        expect(sip).to.have.property('gutil');
        expect(sip.gutil).to.have.property('log');
    });
});
