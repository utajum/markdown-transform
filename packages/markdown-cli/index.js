#!/usr/bin/env node
/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const Logger = require('@accordproject/concerto-core').Logger;
const Commands = require('./lib/Commands');

require('yargs')
    .scriptName('markus')
    .usage('$0 <cmd> [args]')
    .command('parse', 'parse and transform sample markdown', (yargs) => {
        yargs.option('sample', {
            describe: 'path to the clause text',
            type: 'string'
        });
        yargs.option('out', {
            describe: 'path to the output file',
            type: 'string'
        });
        yargs.option('roundtrip', {
            describe: 'roundtrip',
            type: 'boolean',
            default: false
        });
        yargs.option('cicero', {
            describe: 'further transform to CiceroMark',
            type: 'boolean',
            default: false
        });
        yargs.option('slate', {
            describe: 'further transform to Slate DOM',
            type: 'boolean',
            default: false
        });
        yargs.option('html', {
            describe: 'further transform to HTML',
            type: 'boolean',
            default: false
        });
        yargs.option('noWrap', {
            describe: 'do not wrap variables as XML tags',
            type: 'boolean',
            default: false
        });
        yargs.option('noIndex', {
            describe: 'do not index ordered lists',
            type: 'boolean',
            default: false
        });
        yargs.option('verbose', {
            describe: 'verbose output',
            type: 'boolean',
            default: false
        });
    }, (argv) => {
        if (argv.verbose) {
            Logger.info(`parse sample ${argv.sample} markdown`);
        }

        try {
            argv = Commands.validateParseArgs(argv);
            const options = {};
            options.roundtrip = argv.roundtrip;
            options.cicero = argv.cicero;
            options.slate = argv.slate;
            options.html = argv.html;
            options.noWrap = argv.noWrap;
            options.noIndex = argv.noIndex;
            options.verbose = argv.verbose;
            return Commands.parse(argv.sample, argv.out, options)
                .then((result) => {
                    if(result) {Logger.info('\n'+result);}
                })
                .catch((err) => {
                    Logger.error(err.message);
                });
        } catch (err){
            Logger.error(err.message);
            return;
        }
    })
    .option('verbose', {
        alias: 'v',
        default: false
    })
    .help()
    .parse();
