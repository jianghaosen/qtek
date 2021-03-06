define(function(require){

    'use strict';

    var Graph = require('./Graph');
    var TexturePool = require('./TexturePool');
    var FrameBuffer = require('../FrameBuffer');

    /**
     * Compositor provide graph based post processing
     *
     * @constructor qtek.compositor.Compositor
     * @extends qtek.compositor.Graph
     *
     */
    var Compositor = Graph.extend(function() {
        return {
            // Output node
            _outputs: [],

            _texturePool: new TexturePool(),

            _frameBuffer: new FrameBuffer({
                depthBuffer: false
            })
        };
    },
    /** @lends qtek.compositor.Compositor.prototype */
    {
        addNode: function(node) {
            Graph.prototype.addNode.call(this, node);
            node._compositor = this;
        },
        /**
         * @param  {qtek.Renderer} renderer
         */
        render: function(renderer, frameBuffer) {
            if (this._dirty) {
                this.update();
                this._dirty = false;

                this._outputs.length = 0;
                for (var i = 0; i < this.nodes.length; i++) {
                    if (!this.nodes[i].outputs) {
                        this._outputs.push(this.nodes[i]);
                    }
                }
            }

            for (var i = 0; i < this.nodes.length; i++) {
                // Update the reference number of each output texture
                this.nodes[i].beforeFrame();
            }

            for (var i = 0; i < this._outputs.length; i++) {
                this._outputs[i].updateReference();
            }

            for (var i = 0; i < this._outputs.length; i++) {
                this._outputs[i].render(renderer, frameBuffer);
            }

            for (var i = 0; i < this.nodes.length; i++) {
                // Clear up
                this.nodes[i].afterFrame();
            }
        },

        allocateTexture: function (parameters) {
            return this._texturePool.get(parameters);
        },

        releaseTexture: function (parameters) {
            this._texturePool.put(parameters);
        },

        getFrameBuffer: function () {
            return this._frameBuffer;
        },

        /**
         * Dispose compositor
         * @param {WebGLRenderingContext|qtek.Renderer} renderer
         */
        dispose: function (renderer) {
            this._texturePool.clear(renderer.gl || renderer);
        }
    });

    return Compositor;
});