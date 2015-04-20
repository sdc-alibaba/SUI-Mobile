/*!
 * Ratchet's Gruntfile
 * http://goratchet.com
 * Copyright 2015 Connor Sears
 * Licensed under MIT (https://github.com/twbs/ratchet/blob/master/LICENSE)
 */

/* jshint node: true */
module.exports = function (grunt) {
  'use strict';

  // Force use of Unix newlines
  grunt.util.linefeed = '\n';

  RegExp.quote = function (string) {
    return string.replace(/[-\\^$*+?.()|[\]{}]/g, '\\$&');
  };

  var generateRatchiconsData = require('./grunt/ratchicons-data-generator.js');

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    // Metadata.
    meta: {
      distPath:       'dist/',
      doclessetsPath: 'docs/assets/',
      docsDistPath:   'docs/dist/',
      docsPath:       'docs/',
      jsPath:         'js/',
      srcPath:        'less/'
    },

    banner: '/*!\n' +
            ' * =====================================================\n' +
            ' * SUI v<%= pkg.version %> (<%= pkg.homepage %>)\n' +
            ' * Copyright <%= grunt.template.today("yyyy") %> <%= pkg.author %>\n' +
            ' * Licensed under <%= pkg.license %> (https://github.com/twbs/ratchet/blob/master/LICENSE)\n' +
            ' *\n' +
            ' * v<%= pkg.version %> designed by @connors.\n' +
            ' * =====================================================\n' +
            ' */\n',

    clean: {
      dist: ['<%= meta.distPath %>', '<%= meta.docsDistPath %>']
    },

    concat: {
      ratchet: {
        options: {
          banner: '<%= banner %>'
        },
        src: [
          'js/common.js',
          'js/modals.js',
          'js/popovers.js',
          'js/push.js',
          'js/segmented-controllers.js',
          'js/sliders.js',
          'js/toggles.js'
        ],
        dest: '<%= meta.distPath %>js/<%= pkg.name %>.js'
      }
    },

    less: {
      core: {
        src: 'less/ratchet.less',
        dest: '<%= meta.distPath %>css/<%= pkg.name %>.css'
      },
      docs: {
        src: 'less/docs.less',
        dest: '<%= meta.doclessetsPath %>css/docs.css'
      }
    },

    usebanner: {
      dist: {
        options: {
          position: 'top',
          banner: '<%= banner %>'
        },
        files: {
          src: [
            '<%= meta.distPath %>css/*.css',
            '<%= meta.doclessetsPath %>css/docs.css'
          ]
        }
      }
    },

    csscomb: {
      options: {
        config: 'less/.csscomb.json'
      },
      core: {
        files: {
          '<%= less.core.dest %>': '<%= less.core.dest %>'
        }
      },
      docs: {
        files: {
          '<%= less.docs.dest %>': '<%= less.docs.dest %>'
        }
      }
    },

    copy: {
      fonts: {
        expand: true,
        src: 'fonts/*',
        dest: '<%= meta.distPath %>'
      },
      img: {
        expand: true,
        src: 'img/*',
        dest: '<%= meta.distPath %>'
      },
      docs: {
        expand: true,
        cwd: '<%= meta.distPath %>',
        src: [
          '**/*'
        ],
        dest: '<%= meta.docsDistPath %>'
      }
    },

    autoprefixer: {
      options: {
        browsers: [
          'Android 2.3',
          'Android >= 4',
          'Chrome >= 20',
          'Firefox >= 24', // Firefox 24 is the latest ESR
          'Explorer >= 9',
          'iOS >= 6',
          'Opera >= 12',
          'Safari >= 6'
        ]
      },
      core: {
        src: '<%= less.core.dest %>'
      },
      docs: {
        src: '<%= less.docs.dest %>'
      }
    },

    cssmin: {
      options: {
        keepSpecialComments: '*' // keep all important comments
      },
      ratchet: {
        src: '<%= meta.distPath %>css/<%= pkg.name %>.css',
        dest: '<%= meta.distPath %>css/<%= pkg.name %>.min.css'
      },
      docs: {
        src: [
          '<%= meta.doclessetsPath %>css/docs.css',
          '<%= meta.doclessetsPath %>css/pygments-manni.css'
        ],
        dest: '<%= meta.doclessetsPath %>css/docs.min.css'
      }
    },

    uglify: {
      options: {
        banner: '<%= banner %>',
        compress: {
          warnings: false
        },
        mangle: true,
        preserveComments: false
      },
      ratchet: {
        src: '<%= concat.ratchet.dest %>',
        dest: '<%= meta.distPath %>js/<%= pkg.name %>.min.js'
      },
      docs: {
        src: [
          '<%= meta.doclessetsPath %>js/docs.js',
          '<%= meta.doclessetsPath %>js/fingerblast.js'
        ],
        dest: '<%= meta.doclessetsPath %>js/docs.min.js'
      }
    },

    watch: {
      options: {
        hostname: 'localhost',
        livereload: true,
        port: 8000
      },
      js: {
        files: '<%= meta.jsPath %>**/*.js',
        tasks: ['dist-js', 'copy']
      },
      css: {
        files: '<%= meta.srcPath %>**/*.less',
        tasks: ['dist-css', 'copy']
      },
      html: {
        files: '<%= meta.docsPath %>**',
        tasks: ['jekyll']
      }
    },

    jekyll: {
      docs: {}
    },

    jshint: {
      options: {
        jshintrc: 'js/.jshintrc'
      },
      grunt: {
        src: ['Gruntfile.js', 'grunt/*.js']
      },
      src: {
        src: 'js/*.js'
      },
      docs: {
        src: ['<%= meta.doclessetsPath %>/js/docs.js', '<%= meta.doclessetsPath %>/js/fingerblast.js']
      }
    },

    jscs: {
      options: {
        config: 'js/.jscsrc'
      },
      grunt: {
        src: '<%= jshint.grunt.src %>'
      },
      src: {
        src: '<%= jshint.src.src %>'
      },
      docs: {
        src: '<%= jshint.docs.src %>'
      }
    },

    csslint: {
      options: {
        csslintrc: 'less/.csslintrc'
      },
      src: [
        '<%= meta.distPath %>/css/<%= pkg.name %>.css'
      ],
      docs: {
        options: {
          ids: false
        },
        src: ['<%= meta.doclessetsPath %>/css/docs.css']
      }
    },

    sed: {
      versionNumber: {
        pattern: (function () {
          var old = grunt.option('oldver');
          return old ? RegExp.quote(old) : old;
        })(),
        replacement: grunt.option('newver'),
        recursive: true
      }
    },

    connect: {
      site: {
        options: {
          base: '_site/',
          hostname: 'localhost',
          livereload: true,
          open: true,
          port: 8000
        }
      }
    }
  });

  // Load the plugins
  require('load-grunt-tasks')(grunt);
  require('time-grunt')(grunt);

  // Default task(s).
  grunt.registerTask('dist-css', ['less', 'autoprefixer', 'usebanner', 'csscomb', 'cssmin']);
  grunt.registerTask('dist-js', ['concat', 'uglify']);
  grunt.registerTask('dist', ['clean', 'dist-css', 'dist-js', 'copy', 'build-ratchicons-data']);
  grunt.registerTask('validate-html', ['jekyll']);
  grunt.registerTask('build', ['dist']);
  grunt.registerTask('default', ['dist']);
  grunt.registerTask('test', ['dist', 'csslint', 'jshint', 'jscs', 'validate-html']);
  grunt.registerTask('server', ['dist', 'jekyll', 'connect', 'watch']);

  grunt.registerTask('build-ratchicons-data', generateRatchiconsData);

  // Version numbering task.
  // grunt change-version-number --oldver=A.B.C --newver=X.Y.Z
  // This can be overzealous, so its changes should always be manually reviewed!
  grunt.registerTask('change-version-number', 'sed');
};
