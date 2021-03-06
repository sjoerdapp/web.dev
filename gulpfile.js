/*
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const del = require('del');
const gulp = require('gulp');
const spawn = require('child_process').spawn;
const eslint = require('gulp-eslint');

const DEST = './build/';

gulp.task('clean', () => del([DEST]));

gulp.task('build', () => {
  const childProcess = spawn('node', ['./lib/index.js']);

  childProcess.stdout.on('data', (data) => {
    process.stdout.write(data.toString('utf-8'));
  });

  childProcess.stderr.on('data', (data) => {
    process.stderr.write(data.toString('utf-8'));
  });

  return childProcess;
});

gulp.task(
  'watch',
  gulp.series('build', () => {
    // TODO(ericbidelman): Don't rebuild all files if only 1 changes.
    gulp.watch(
      'content/**/*.{md,html}',
      {
        read: false, // Optimization. Not accessing file.contents.
        ignoreInitial: true,
      },
      gulp.series('build'),
    );
  }),
);

gulp.task('lint', () => {
  return (
    gulp
      .src([
        'gulpfile.js',
        '{lib,server}/{*.js,*.mjs,!(deps)/**/*.js}',
        '!glitches/**/*.{js,mjs}',
        '!lib/devsite.js',
        '!lib/local-devsite.js'])
      // eslint() attaches the lint output to the "eslint" property
      // of the file object so it can be used by other modules.
      .pipe(eslint())
      // eslint.format() outputs the lint results to the console.
      // Alternatively use eslint.formatEach().
      .pipe(eslint.format())
      // To have the process exit with an error code (1) on
      // lint error, return the stream and pipe to failAfterError last.
      .pipe(eslint.failAfterError())
  );
});

gulp.task('default', gulp.series('clean', 'build'));
