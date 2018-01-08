/**
 * DOM manipulations helper
 */
export default class Dom {

    /**
     * Helper for making Elements with classname and attributes
     *
     * @param  {string} tagName           - new Element tag name
     * @param  {array|string} classNames  - list or name of CSS classname(s)
     * @param  {Object} attributes        - any attributes
     * @return {Element}
     */
    static make(tagName, classNames = null, attributes = {}) {

        let el = document.createElement(tagName);

        if ( Array.isArray(classNames) ) {

            el.classList.add(...classNames);

        } else if( classNames ) {

            el.classList.add(classNames);

        }

        for (let attrName in attributes) {

            el[attrName] = attributes[attrName];

        }

        return el;

    }

    /**
     * Creates Text Node with the passed content
     * @param {String} content - text content
     * @return {Text}
     */
    static text(content) {

        return document.createTextNode(content);

    }

    /**
     * Append one or several elements to the parent
     *
     * @param  {Element} parent    - where to append
     * @param  {Element|Element[]} - element ore elements list
     */
    static append(parent, elements) {

        if ( Array.isArray(elements) ) {

            elements.forEach( el => parent.appendChild(el) );

        } else {

            parent.appendChild(elements);

        }

    }

    /**
     * Selector Decorator
     *
     * Returns first match
     *
     * @param {Element} el - element we searching inside. Default - DOM Document
     * @param {String} selector - searching string
     *
     * @returns {Element}
     */
    static find(el = document, selector) {

        return el.querySelector(selector);

    }

    /**
     * Selector Decorator.
     *
     * Returns all matches
     *
     * @param {Element} el - element we searching inside. Default - DOM Document
     * @param {String} selector - searching string
     * @returns {NodeList}
     */
    static findAll(el = document, selector) {

        return el.querySelectorAll(selector);

    }

    /**
     * Search for deepest node which is Leaf.
     * Leaf is the vertex that doesn't have any child nodes
     *
     * @description Method recursively goes throw the all Node until it finds the Leaf
     *
     * @param {Element} node - root Node. From this vertex we start Deep-first search {@link https://en.wikipedia.org/wiki/Depth-first_search}
     * @param {Boolean} atLast - find last text node
     * @return {Node} - it can be text Node or Element Node, so that caret will able to work with it
     */
    static getDeepestNode(node, atLast = false) {

        if (node.childNodes.length === 0) {

            /**
             * We need to return an empty text node
             * But caret will not be placed in empty textNode, so we need textNode with zero-width char
             */
            if (this.isElement(node) && !this.isNativeInput(node)) {

                let emptyTextNode = this.text('\u200B');

                node.appendChild(emptyTextNode);

            }

            return node;

        }

        let childsLength = node.childNodes.length,
            last = childsLength - 1;

        if (atLast) {

            return this.getDeepestNode(node.childNodes[last], atLast);

        } else {

            return this.getDeepestNode(node.childNodes[0], false);

        }

    }

    /**
     * Check if object is DOM node
     *
     * @param {Object} node
     * @returns {boolean}
     */
    static isElement(node) {

        return node && typeof node === 'object' && node.nodeType && node.nodeType === Node.ELEMENT_NODE;

    }

    /**
     * Checks target if it is native input
     * @param {Element|String} target - HTML element or string
     * @return {Boolean}
     */
    static isNativeInput(target) {

        let nativeInputs = [
            'INPUT',
            'TEXTAREA'
        ];

        return target ? nativeInputs.includes(target.tagName) : false;

    }

    /**
     * Checks node if it is empty
     *
     * @description Method checks simple Node without any childs for emptiness
     * If you have Node with 2 or more children id depth, you better use {@link Dom#isEmpty} method
     *
     * @param {Node} node
     * @return {Boolean} true if it is empty
     */
    static isNodeEmpty(node) {

        let nodeText;

        if ( this.isElement(node) && this.isNativeInput(node) ) {

            nodeText = node.value;

        } else {

            nodeText = node.textContent.replace('\u200B', '');

        }

        return nodeText.trim().length === 0;

    }

    /**
     * checks node if it is doesn't have any child nodes
     * @param {Node} node
     * @return {boolean}
     */
    static isLeaf(node) {

        if (!node) {

            return false;

        }

        return node.childNodes.length === 0;

    }

    /**
     * breadth-first search (BFS)
     * {@link https://en.wikipedia.org/wiki/Breadth-first_search}
     *
     * @description Pushes to stack all DOM leafs and checks for emptiness
     *
     * @param {Node} node
     * @return {boolean}
     */
    static isEmpty(node) {

        let treeWalker = [],
            leafs = [];

        if (!node) {

            return false;

        }

        treeWalker.push(node);

        while ( treeWalker.length > 0 ) {

            if ( this.isLeaf(node) ) {

                leafs.push(node);

            }

            while ( node && node.nextSibling ) {

                node = node.nextSibling;

                if (!node) continue;

                treeWalker.push(node);

            }

            node = treeWalker.shift();

            if (!node) continue;

            node = node.firstChild;
            treeWalker.push(node);

        }

        return leafs.every( leaf => this.isNodeEmpty(leaf)) ;

    }

};