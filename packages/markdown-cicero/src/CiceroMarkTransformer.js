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

const { ModelManager, Factory, Serializer } = require('@accordproject/concerto-core');

const CommonMarkTransformer = require('@accordproject/markdown-common').CommonMarkTransformer;
const { commonMarkModel } = require('@accordproject/markdown-common').Models;

const ToCiceroVisitor = require('./ToCiceroVisitor');
const FromCiceroVisitor = require('./FromCiceroVisitor');
const { ciceroMarkModel } = require('./Models');

/**
 * Converts a CiceroMark DOM to/from a
 * CommonMark DOM.
 *
 * Converts a CiceroMark DOM to/from a markdown string.
 */
class CiceroMarkTransformer {
    /**
     * Construct the parser.
     * @param {object} [options] configuration options
     */
    constructor() {

        // Setup for Nested Parsing
        this.commonMark = new CommonMarkTransformer({ tagInfo: true });

        // Setup for validation
        this.modelManager = new ModelManager();
        this.modelManager.addModelFile(commonMarkModel, 'commonmark.cto');
        this.modelManager.addModelFile(ciceroMarkModel, 'ciceromark.cto');
        const factory = new Factory(this.modelManager);
        this.serializer = new Serializer(factory, this.modelManager);
    }
    /**
     * Converts a markdown string to a CiceroMark DOM
     * @param {string} markdown a markdown string
     * @param {string} [format] result format, defaults to 'concerto'. Pass
     * 'json' to return the JSON data.
     * @returns {*} concertoObject concerto ciceromark object
     */
    fromMarkdown(markdown, format='concerto') {
        const commonMarkDom = this.commonMark.fromMarkdown(markdown, 'json');
        return this.fromCommonMark(commonMarkDom, format);
    }

    /**
     * Converts a CommonMark DOM to a CiceroMark DOM
     * @param {*} input - CiceroMark DOM (in JSON or as a Concerto object)
     * @param {string} [format] result format, defaults to 'concerto'. Pass
     * 'json' to return the JSON data.
     * @returns {*} CiceroMark DOM
     */
    fromCommonMark(input, format='concerto') {

        if(!input.getType) {
            input = this.serializer.fromJSON(input);
        }

        // Add Cicero nodes
        const parameters = {
            ciceroMark: this,
            commonMark: this.commonMark,
            modelManager : this.modelManager,
            serializer : this.serializer,
        };
        const visitor = new ToCiceroVisitor();
        input.accept( visitor, parameters );

        if(format === 'concerto') {
            return input;
        }
        else {
            return this.serializer.toJSON(input);
        }
    }

    /**
     * Converts a CiceroMark DOM to a markdown string
     * @param {*} input CiceroMark DOM
     * @param {object} [options] configuration options
     * @returns {*} markdown string
     */
    toMarkdown(input, options) {
        const commonMarkDom = this.toCommonMark(input, 'json', options);
        return this.commonMark.toMarkdown(commonMarkDom);
    }

    /**
     * Retrieve the serializer used by the parser
     *
     * @returns {*} a serializer capable of dealing with the Concerto
     * object returns by parse
     */
    getSerializer() {
        return this.serializer;
    }

    /**
     * Converts a CiceroMark DOM to a CommonMark DOM
     * @param {*} input CiceroMark DOM
     * @param {string} [format] result format, defaults to 'concerto'. Pass
     * 'json' to return the JSON data.
     * @param {object} [options] configuration options
     * @returns {*} json commonmark object
     */
    toCommonMark(input, format='concerto', options = {}) {

        if(!input.getType) {
            input = this.serializer.fromJSON(input);
        }

        // Add Cicero nodes
        const parameters = {
            commonMark: this.commonMark,
            modelManager : this.modelManager,
            serializer : this.serializer
        };
        const visitor = new FromCiceroVisitor(options);
        input.accept( visitor, parameters );

        if(format === 'concerto') {
            return input;
        }
        else {
            return this.serializer.toJSON(input);
        }
    }
}

module.exports = CiceroMarkTransformer;
