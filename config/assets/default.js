'use strict';

module.exports = {
  client: {
    lib: {
      css: [
        'public/lib/bootstrap/dist/css/bootstrap.min.css',
        'public/lib/bootstrap/dist/css/bootstrap-theme.min.css',
        'public/lib/fullcalendar/dist/fullcalendar.min.css',
        'public/lib/angular-motion/dist/angular-motion.min.css',
        'public/lib/jquery-timepicker-jt/jquery.timepicker.css',
        'public/lib/angular-material/angular-material.min.css',
        'public/lib/font-awesome/font-awesome.min.css',
        'public/lib/angular-input-stars-directive/angular-input-stars.css',
        'public/lib/angularMultipleSelect/build/multiple-select.min.css',
        'public/lib/fullcalendar-scheduler/dist/scheduler.min.css'
      ],
      js: [
        'public/lib/jquery/dist/jquery.min.js',
        'public/lib/jquery-ui/jquery-ui.min.js',
        'public/lib/angular/angular.min.js',
        'public/lib/angular-route/angular-route.min.js',
        'public/lib/angular-resource/angular-resource.min.js',
        'public/lib/angular-animate/angular-animate.min.js',
        'public/lib/angular-ui-router/release/angular-ui-router.min.js',
        'public/lib/angular-ui-utils/ui-utils.min.js',
        'public/lib/angular-bootstrap/ui-bootstrap-tpls.min.js',
        'public/lib/angular-file-upload/dist/angular-file-upload.min.js',
        'public/lib/angular-ui-calendar/src/calendar.js',
        'public/lib/moment/min/moment.min.js',
        'public/lib/angular-moment/angular-moment.min.js',
        'public/lib/fullcalendar/dist/fullcalendar.min.js',
        'public/lib/angular-cookies/angular-cookies.min.js',
        'public/lib/angular-filter/dist/angular-filter.min.js',
        'public/lib/angular-strap/dist/angular-strap.min.js',   
        'public/lib/angular-strap/dist/angular-strap.tpl.min.js', 
        'public/lib/jquery-timepicker-jt/jquery.timepicker.min.js',
        'public/lib/angular-jquery-timepicker/src/timepickerdirective.min.js',
        'public/lib/angular-aria/angular-aria.min.js',
        'public/lib/angular-material/angular-material.min.js',
        'public/lib/angular-input-stars-directive/angular-input-stars.js',
        'public/lib/angularMultipleSelect/build/multiple-select.min.js',
        'public/lib/fullcalendar-scheduler/dist/scheduler.min.js'
      ],
      tests: ['public/lib/angular-mocks/angular-mocks.js']
    },
    css: [
      'modules/*/client/css/*.css'
    ],
    less: [
      'modules/*/client/less/*.less'
    ],
    sass: [
      'modules/*/client/scss/*.scss'
    ],
    js: [
      'modules/core/client/app/config.js',
      'modules/core/client/app/init.js',
      'modules/*/client/*.js',
      'modules/*/client/**/*.js'
    ],
    views: ['modules/*/client/views/**/*.html']
  },
  server: {
    gruntConfig: 'gruntfile.js',
    gulpConfig: 'gulpfile.js',
    allJS: ['server.js', 'config/**/*.js', 'modules/*/server/**/*.js'],
    models: 'modules/*/server/models/**/*.js',
    routes: ['modules/!(core)/server/routes/**/*.js', 'modules/core/server/routes/**/*.js'],
    sockets: 'modules/*/server/sockets/**/*.js',
    config: 'modules/*/server/config/*.js',
    policies: 'modules/*/server/policies/*.js',
    views: 'modules/*/server/views/*.html'
  }
};