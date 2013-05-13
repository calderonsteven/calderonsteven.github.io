(function ($) {
    var timers = [];
    var currentText;
    function WriteText(text) {
        if (currentText == text) return;
        currentText = text;

        //cancel old timers
        $.each(timers, function (index, item) { clearTimeout(item); });
        timers = [];

        $('#action_description').html('');
        $.each(text, function (index, item) {
            var idTimer = setTimeout(function () { $('#action_description').append(item); }, index * 40);
            timers.push(idTimer);
        });
    }

    var Renderer = function (canvas) {
        var canvas = $(canvas).get(0)
        var ctx = canvas.getContext("2d");
        var particleSystem;
        var gfx = arbor.Graphics($(canvas).get(0));

        var that = {
            init: function (system) {
                //
                // the particle system will call the init function once, right before the
                // first frame is to be drawn. it's a good place to set up the canvas and
                // to pass the canvas size to the particle system
                //
                // save a reference to the particle system for use in the .redraw() loop
                particleSystem = system

                // inform the system of the screen dimensions so it can map coords for us.
                // if the canvas is ever resized, screenSize should be called again with
                // the new dimensions
                //particleSystem.screenSize(canvas.width, canvas.height)
                particleSystem.screenPadding(80) // leave an extra 80px of whitespace per side

				//debugger;
                //$(window).resize(that.resize)
				$('#viewportContent').resize(function(){
					debugger;					
				});
                that.resize()

                // set up some event handlers to allow for node-dragging
                that.initMouseHandling()
            },

            resize: function () {
                canvas.width = /* .80 * */$('#viewportContent').width()
                canvas.height = /* .80 * */$('#viewportContent').height()
                particleSystem.screen({ size: { width: canvas.width, height: canvas.height} })

                //console.log('canvas.width:' + canvas.width + ', canvas.height: ' + canvas.height);
                //console.log('$(window).width():' + $(window).width() + ', $(window).height(): ' + $(window).height());

                that.redraw()
            },

            redraw: function () {
                // 
                // redraw will be called repeatedly during the run whenever the node positions
                // change. the new positions for the nodes can be accessed by looking at the
                // .p attribute of a given node. however the p.x & p.y values are in the coordinates
                // of the particle system rather than the screen. you can either map them to
                // the screen yourself, or use the convenience iterators .eachNode (and .eachEdge)
                // which allow you to step through the actual node objects but also pass an
                // x,y point in the screen's coordinate system
                // 
                ctx.fillStyle = "white"
                ctx.fillRect(0, 0, canvas.width, canvas.height)

                particleSystem.eachEdge(function (edge, pt1, pt2) {
                    // edge: {source:Node, target:Node, length:#, data:{}}
                    // pt1:  {x:#, y:#}  source position in screen coords
                    // pt2:  {x:#, y:#}  target position in screen coords

                    if ((edge.source.data.alpha * edge.target.data.alpha) == 0) return;
                    gfx.line(pt1, pt2, { stroke: "#b2b19d", width: 1, alpha: edge.target.data.alpha })
                })

                particleSystem.eachNode(function (node, pt) {
                    // node: {mass:#, p:{x,y}, name:"", data:{}}
                    // pt:   {x:#, y:#}  node position in screen coords

                    var w = Math.max(20, 20 + gfx.textWidth(node.name))
                    if (node.data.alpha === 0) return

                    if (node.data.shape == 'dot') {
                        gfx.oval(pt.x - w / 2, pt.y - w / 2, w, w, { fill: node.data.color, alpha: node.data.alpha })

                        gfx.text(node.name, pt.x, pt.y + 7, { color: "white", align: "center", font: "Arial", size: 12 })
                        gfx.text(node.name, pt.x, pt.y + 7, { color: "white", align: "center", font: "Arial", size: 12 })
                        gfx.text(node.name, pt.x, pt.y + 7, { color: "white", align: "center", font: "Arial", size: 12 })
                    } else if (node.data.shape == 'rect') {
                        gfx.rect(pt.x - w / 2, pt.y - 8, w, 20, 4, { fill: node.data.color, alpha: node.data.alpha })
                        gfx.text(node.name, pt.x, pt.y + 9, { color: "white", align: "center", font: "Arial", size: 12 })
                        gfx.text(node.name, pt.x, pt.y + 9, { color: "white", align: "center", font: "Arial", size: 12 })
                    } else if (node.data.shape == 'triangle') {
                        ctx.fillStyle = node.data.color;

                        w2 = ((w / 2) + 2);
                        ctx.beginPath();
                        ctx.moveTo(pt.x, pt.y - w2);
                        ctx.lineTo(pt.x + w2, pt.y + w2 - 10);
                        ctx.lineTo(pt.x - w2, pt.y + w2 - 10);
                        ctx.closePath();
                        ctx.fill();

                        gfx.text(node.name, pt.x, pt.y + 9, { color: "white", align: "center", font: "Arial", size: 12 })
                        gfx.text(node.name, pt.x, pt.y + 9, { color: "white", align: "center", font: "Arial", size: 12 })
                        gfx.text(node.name, pt.x, pt.y + 9, { color: "white", align: "center", font: "Arial", size: 12 })
                    }
                })
            },

            initMouseHandling: function () {
                // no-nonsense drag and drop (thanks springy.js)
                var dragged = null;
                lastnode = null

                // set up a handler object that will initially listen for mousedowns then
                // for moves and mouseups while dragging
                var handler = {
                    moved: function (e) {
                        var pos = $(canvas).offset();
                        var mousePosition = arbor.Point(e.pageX - pos.left, e.pageY - pos.top)
                        var nearest = particleSystem.nearest(mousePosition);

                        if (nearest.node.data.shape == 'rect' && nearest.node.data.alpha != 0) {
                            WriteText(nearest.node.data.description);
                            //console.log(nearest.node);
                        }

                        if (!nearest.node || lastnode == nearest.node.name || nearest.node.data.shape != 'triangle') return false;

                        //Hide all "rect" nodes
                        particleSystem.eachNode(function (node) {
                            if (node.data.shape != 'rect') return;
                            particleSystem.tweenNode(node, .5, { alpha: 0 });
                        });

                        //show nodes from master node
                        if ($.inArray(nearest.node.name, ['me', 'apps', 'write']) >= 0) {
                            $.each(particleSystem.getEdgesFrom(nearest.node.name), function (index, value) {
                                //console.log(nearest.node.name);
                                lastnode = value.source.name;
                                particleSystem.tweenNode(value.target, .5, { alpha: 1 })

                                value.target.p.x = value.source.p.x + .05 * Math.random() - .025
                                value.target.p.y = value.source.p.y + .05 * Math.random() - .025
                                value.target.tempMass = .001
                            });
                        }

                        return false;
                    },
                    clicked: function (e) {
                        var pos = $(canvas).offset();
                        _mouseP = arbor.Point(e.pageX - pos.left, e.pageY - pos.top)
                        dragged = particleSystem.nearest(_mouseP);

                        if (dragged && dragged.node !== null) {
                            // while we're dragging, don't let physics move the node
                            dragged.node.fixed = true
                        }

                        $(canvas).bind('mousemove', handler.dragged)
                        $(window).bind('mouseup', handler.dropped)                        

                        return false
                    },
                    dragged: function (e) {
                        var pos = $(canvas).offset();
                        var s = arbor.Point(e.pageX - pos.left, e.pageY - pos.top)

                        if (dragged && dragged.node !== null) {
                            var p = particleSystem.fromScreen(s)
                            dragged.node.p = p
                        }

                        return false
                    },

                    dropped: function (e) {
                        if (dragged === null || dragged.node === undefined) return
                        if (dragged.node !== null) dragged.node.fixed = false
                        dragged.node.tempMass = 1000
                        dragged = null
                        $(canvas).unbind('mousemove', handler.dragged)
                        $(window).unbind('mouseup', handler.dropped)
                        _mouseP = null
                        return false
                    }
                }

                // start listening
                $(canvas).mousedown(handler.clicked);
                $(canvas).mousemove(handler.moved);

            } //,

        }
        return that
    }

    $(document).ready(function () {
        var sys = arbor.ParticleSystem(1000, 600, 0.5) // create the system with sensible repulsion/stiffness/friction
        sys.parameters({ gravity: true }) // use center-gravity to make the graph settle nicely (ymmv)
        sys.renderer = Renderer("#viewport") // our newly created renderer will have its .init() method called shortly by sys...

        var CLR = {
            branch: "#b2b19d",
            apps: "#009e7c",
            write: "#ff4b05",
            me: "#000e0c"
        }

        var theUi = {
            nodes: {
                "{ main }": { color: "red", shape: "dot", alpha: 1 },

                apps: { color: CLR.branch, shape: "triangle", alpha: 1 },
                art: { color: CLR.apps, shape: "rect", alpha: 0, description: 'Generative art & some Algorithmic art.' },
                "4fun": { color: CLR.apps, shape: "rect", alpha: 0, description: 'Coding 4 fun & some fun coding stuff.' },

                write: { color: CLR.branch, shape: "triangle", alpha: 1 },
                tumblr: { color: CLR.write, shape: "rect", alpha: 0, description: 'tumblr_blog = [re_posts, news, code]' },
                blog: { color: CLR.write, shape: "rect", alpha: 0, description: 'personal_blog = [things, and more shit]' },

                me: { color: CLR.branch, shape: "triangle", alpha: 1 },
                "about": { color: CLR.me, shape: "rect", alpha: 0, description: 'Things about me and my work' },
                contact: { color: CLR.me, shape: "rect", alpha: 0, description: 'Contant me ლ(╹◡╹ლ)' },
                social: { color: CLR.me, shape: "rect", alpha: 0, description: 'Get Social w/ me' }
            },
            edges: {
                "{ main }": {
                    apps: { length: .8 },
                    me: { length: .8 },
                    write: { length: .8 }
                },
                apps: {
                    art: {},
                    "4fun": {}
                },
                write: {
                    tumblr: {},
                    blog: {}
                },
                me: { "about": {},
                    contact: {},
                    social: {}
                }
            }
        };

        sys.graft(theUi);
    })

})(this.jQuery)