//prior to running grunt sass execute:
//npm install grunt-contrib-compass --save-dev
module.exports = function(grunt) {
    'use strict';
    grunt.initConfig({
        compass: {
            dist: {
                options: {
                    sassDir: 'sass',
                    cssDir: 'css',
                    outputStyle: 'compressed',
                    require: 'breakpoint',
                    force: true
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-compass');
};
