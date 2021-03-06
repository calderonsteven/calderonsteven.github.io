window.requestAnimFrame = (function() {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
    function( /* function */callback, /* DOMElement */element) {
        window.setTimeout(callback, 1000 / 60);
    };
})();

(function(window, document, undefined) {

    function circles(context) {
        this.init(context);
    }

    circles.prototype = {
        context: null,

        prevMouseX: null,
        prevMouseY: null,

        count: null,

        circlesPerCoord: null,

        init: function(context) {
            this.context = context;
            this.context.globalCompositeOperation = 'source-over';
        },

        destroy: function() { },

        strokeStart: function(mouseX, mouseY) {
            this.prevMouseX = mouseX;
            this.prevMouseY = mouseY;
        },

        stroke: function(mouseX, mouseY) {
            var i, dx, dy, d, cx, cy, steps, step_delta;

            this.context.lineWidth = BRUSH_SIZE;
            this.context.strokeStyle = "rgba(" + COLOR[0] + ", " + COLOR[1] + ", " + COLOR[2] + ", " + 0.1 * BRUSH_PRESSURE + ")";

            dx = mouseX - this.prevMouseX;
            dy = mouseY - this.prevMouseY;
            d = Math.sqrt(dx * dx + dy * dy) * 2;

            cx = Math.floor(mouseX / 100) * 100 + 50;
            cy = Math.floor(mouseY / 100) * 100 + 50;

            steps = Math.floor(Math.random() * 10);
            step_delta = d / steps;

            if(! this.circlesPerCoord ){
                this.circlesPerCoord = new Array();
            }
            if(! this.circlesPerCoord[cx] ){
                this.circlesPerCoord[cx] = new Array();
            }

            if(! this.circlesPerCoord[cx][cy] ){
                this.circlesPerCoord[cx][cy] = 1;
            }else{
                if( this.circlesPerCoord[cx][cy] > 7) {return;}

                ++this.circlesPerCoord[cx][cy];
            }

            for (i = 0; i < steps; i++) {
                this.context.beginPath();
                this.context.arc(cx, cy, (steps - i) * step_delta, 0, Math.PI * 2, true);
                this.context.stroke();
            }

            this.prevMouseX = mouseX;
            this.prevMouseY = mouseY;
        },

        strokeEnd: function() {

        }
    }

    function bargs(_fn) {
        var n, args = [];
        for (n = 1; n < arguments.length; n++)
            args.push(arguments[n]);
        return function() {
            return _fn.apply(this, args);
        };
    }

    var i, brush, BRUSHES = ["circles"],
        COLOR = [0, 0, 0],
        BACKGROUND_COLOR = [250, 250, 250],
        SCREEN_WIDTH = window.innerWidth,
        SCREEN_HEIGHT = window.innerHeight,
        BRUSH_SIZE = 1,
        BRUSH_PRESSURE = 1,
        container, foregroundColorSelector, backgroundColorSelector, menu, about, canvas, flattenCanvas, context, isForegroundColorSelectorVisible = false,
        isBackgroundColorSelectorVisible = false,
        isAboutVisible = false,
        isMenuMouseOver = false,
        shiftKeyIsDown = false,
        altKeyIsDown = false;

    window.harmony = function init(start) {
		if(start != true){ return; }

        var hash, palette;

        // quit if its firefox to avoid 100% cpu.
        //if (/firefox|minefield/i.test(navigator.userAgent)) return;
        // FUCK IT I"M requestANIMATIONFRRAME'ing this shit. FF CAN GET IT TOO"
        //  /document.body.style.backgroundColor = 'rgb(' + BACKGROUND_COLOR[0] + ', ' + BACKGROUND_COLOR[1] + ', ' + BACKGROUND_COLOR[2] + ')';
        container = document.createElement('div');
        container.id = "harmony";
        document.body.appendChild(container);

        canvas = document.createElement("canvas");
        canvas.width = SCREEN_WIDTH;
        canvas.height = SCREEN_HEIGHT;
        //canvas.style.cursor = 'crosshair';
        container.appendChild(canvas);

        if (!canvas.getContext) return;

        context = canvas.getContext("2d");

        flattenCanvas = document.createElement("canvas");
        flattenCanvas.width = SCREEN_WIDTH;
        flattenCanvas.height = SCREEN_HEIGHT;

        if (!brush) {
            brush = new circles(context);
        }

        window.addEventListener('mousemove', onWindowMouseMove, false);
        window.addEventListener('resize', onWindowResize, false);
        //window.addEventListener('keydown', onDocumentKeyDown, false);
        //window.addEventListener('keyup', onDocumentKeyUp, false);

        document.addEventListener('mouseout', onCanvasMouseUp, false);

        canvas.addEventListener('mousemove', onCanvasMouseMove, false);
        canvas.addEventListener('touchstart', onCanvasTouchStart, false);

        onWindowResize(null);
    }


    // WINDOW

    function onWindowMouseMove(event) {
        mouseX = event.clientX;
        mouseY = event.clientY;
    }

    function onWindowResize() {
        SCREEN_WIDTH = window.innerWidth;
        SCREEN_HEIGHT = window.innerHeight;

        /* make a copy */
        savecanvas = document.createElement("canvas");
        savecanvas.width = canvas.width;
        savecanvas.height = canvas.height;
        savecanvas.getContext("2d").drawImage(canvas, 0, 0);

        /* change the size */
        canvas.width = SCREEN_WIDTH;
        canvas.height = SCREEN_HEIGHT;

        /* draw the copy */
        context.drawImage(savecanvas, 0, 0);

        /* reset the brush (sad we lose the old random setup) */
        brush = new circles(context);
    }

    // DOCUMENT
/*
    function onDocumentMouseDown(event) {
        if (!isMenuMouseOver) event.preventDefault();
    }

    function onDocumentKeyDown(event) {
        if (shiftKeyIsDown) return;

        switch (event.keyCode) {

            case 18:
                // Alt
                altKeyIsDown = true;
                break;
        }
    }

    function onDocumentKeyUp(event) {
        switch (event.keyCode) {
            case 16:
                // Shift
                shiftKeyIsDown = false;
                foregroundColorSelector.container.style.visibility = 'hidden';
                break;
            case 18:
                // Alt
                altKeyIsDown = false;
                break;
        }
    }

    // COLOR SELECTORS

    function setForegroundColor(x, y) {
        foregroundColorSelector.update(x, y);
        COLOR = foregroundColorSelector.getColor();
        menu.setForegroundColor(COLOR);
    }

    function onForegroundColorSelectorMouseDown(event) {
        window.addEventListener('mousemove', onForegroundColorSelectorMouseMove, false);
        window.addEventListener('mouseup', onForegroundColorSelectorMouseUp, false);

        setForegroundColor(event.clientX - foregroundColorSelector.container.offsetLeft, event.clientY - foregroundColorSelector.container.offsetTop);
    }

    function onForegroundColorSelectorMouseMove(event) {
        setForegroundColor(event.clientX - foregroundColorSelector.container.offsetLeft, event.clientY - foregroundColorSelector.container.offsetTop);
    }

    function onForegroundColorSelectorMouseUp(event) {
        window.removeEventListener('mousemove', onForegroundColorSelectorMouseMove, false);
        window.removeEventListener('mouseup', onForegroundColorSelectorMouseUp, false);

        setForegroundColor(event.clientX - foregroundColorSelector.container.offsetLeft, event.clientY - foregroundColorSelector.container.offsetTop);
    }

    function onForegroundColorSelectorTouchStart(event) {
        if (event.touches.length == 1) {
            event.preventDefault();

            setForegroundColor(event.touches[0].pageX - foregroundColorSelector.container.offsetLeft, event.touches[0].pageY - foregroundColorSelector.container.offsetTop);

            window.addEventListener('touchmove', onForegroundColorSelectorTouchMove, false);
            window.addEventListener('touchend', onForegroundColorSelectorTouchEnd, false);
        }
    }

    function onForegroundColorSelectorTouchMove(event) {
        if (event.touches.length == 1) {
            event.preventDefault();

            setForegroundColor(event.touches[0].pageX - foregroundColorSelector.container.offsetLeft, event.touches[0].pageY - foregroundColorSelector.container.offsetTop);
        }
    }

    function onForegroundColorSelectorTouchEnd(event) {
        if (event.touches.length == 0) {
            event.preventDefault();

            window.removeEventListener('touchmove', onForegroundColorSelectorTouchMove, false);
            window.removeEventListener('touchend', onForegroundColorSelectorTouchEnd, false);
        }
    }


    //

    function setBackgroundColor(x, y) {
        backgroundColorSelector.update(x, y);
        BACKGROUND_COLOR = backgroundColorSelector.getColor();
        menu.setBackgroundColor(BACKGROUND_COLOR);

        document.body.style.backgroundColor = 'rgb(' + BACKGROUND_COLOR[0] + ', ' + BACKGROUND_COLOR[1] + ', ' + BACKGROUND_COLOR[2] + ')';
    }

    function onBackgroundColorSelectorMouseDown(event) {
        window.addEventListener('mousemove', onBackgroundColorSelectorMouseMove, false);
        window.addEventListener('mouseup', onBackgroundColorSelectorMouseUp, false);
    }

    function onBackgroundColorSelectorMouseMove(event) {
        setBackgroundColor(event.clientX - backgroundColorSelector.container.offsetLeft, event.clientY - backgroundColorSelector.container.offsetTop);
    }

    function onBackgroundColorSelectorMouseUp(event) {
        window.removeEventListener('mousemove', onBackgroundColorSelectorMouseMove, false);
        window.removeEventListener('mouseup', onBackgroundColorSelectorMouseUp, false);

        setBackgroundColor(event.clientX - backgroundColorSelector.container.offsetLeft, event.clientY - backgroundColorSelector.container.offsetTop);
    }


    function onBackgroundColorSelectorTouchStart(event) {
        if (event.touches.length == 1) {
            event.preventDefault();

            setBackgroundColor(event.touches[0].pageX - backgroundColorSelector.container.offsetLeft, event.touches[0].pageY - backgroundColorSelector.container.offsetTop);

            window.addEventListener('touchmove', onBackgroundColorSelectorTouchMove, false);
            window.addEventListener('touchend', onBackgroundColorSelectorTouchEnd, false);
        }
    }

    function onBackgroundColorSelectorTouchMove(event) {
        if (event.touches.length == 1) {
            event.preventDefault();

            setBackgroundColor(event.touches[0].pageX - backgroundColorSelector.container.offsetLeft, event.touches[0].pageY - backgroundColorSelector.container.offsetTop);
        }
    }

    function onBackgroundColorSelectorTouchEnd(event) {
        if (event.touches.length == 0) {
            event.preventDefault();

            window.removeEventListener('touchmove', onBackgroundColorSelectorTouchMove, false);
            window.removeEventListener('touchend', onBackgroundColorSelectorTouchEnd, false);
        }
    }
*/

    // MENU
/*
    function onMenuForegroundColor() {
        cleanPopUps();

        foregroundColorSelector.show();
        foregroundColorSelector.container.style.left = ((SCREEN_WIDTH - foregroundColorSelector.container.offsetWidth) / 2) + 'px';
        foregroundColorSelector.container.style.top = ((SCREEN_HEIGHT - foregroundColorSelector.container.offsetHeight) / 2) + 'px';

        isForegroundColorSelectorVisible = true;
    }

    function onMenuBackgroundColor() {
        cleanPopUps();

        backgroundColorSelector.show();
        backgroundColorSelector.container.style.left = ((SCREEN_WIDTH - backgroundColorSelector.container.offsetWidth) / 2) + 'px';
        backgroundColorSelector.container.style.top = ((SCREEN_HEIGHT - backgroundColorSelector.container.offsetHeight) / 2) + 'px';

        isBackgroundColorSelectorVisible = true;
    }

    function onMenuSelectorChange() {
        if (BRUSHES[menu.selector.selectedIndex] == "") return;

        brush.destroy();
        brush = eval("new " + BRUSHES[menu.selector.selectedIndex] + "(context)");

        window.location.hash = BRUSHES[menu.selector.selectedIndex];
    }

    function onMenuMouseOver() {
        isMenuMouseOver = true;
    }

    function onMenuMouseOut() {
        isMenuMouseOver = false;
    }

    function onMenuSave() {
        var context = flattenCanvas.getContext("2d");

        context.fillStyle = 'rgb(' + BACKGROUND_COLOR[0] + ', ' + BACKGROUND_COLOR[1] + ', ' + BACKGROUND_COLOR[2] + ')';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(canvas, 0, 0);

        window.open(flattenCanvas.toDataURL("image/png"), 'mywindow');
    }

    function onMenuClear() {
        context.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

        brush.destroy();
        brush = eval("new " + BRUSHES[menu.selector.selectedIndex] + "(context)");
    }
    function onMenuAbout() {
        cleanPopUps();

        isAboutVisible = true;
        about.show();
    }
*/

    // CANVAS
    function onCanvasMouseMove(event) {
        if (!brush.isStroking) {
            brush.strokeStart(event.clientX, event.clientY);
            brush.isStroking = true;

            if (window.DollarRecognizer) {
                window.Rcgnzr = new DollarRecognizer();
            }

            return;
        }

        var pts = onCanvasMouseMove.pts,
            results, x = event.clientX,
            y = event.clientY;

        // has it been 300ms since the last movement? if so lets consider it a new thing and capture
        if (onCanvasMouseMove.lastMove && (event.timeStamp - onCanvasMouseMove.lastMove) > 300) {


            if (pts && pts.length) {

                if (window.DollarRecognizer) {

                    results = Rcgnzr.Recognize(pts);

                    if (results.Name == 'star' && results.Score >= .6) window.starryEgg && starryEgg();
                }

                onCanvasMouseMove.pts = [];
            } else {

                onCanvasMouseMove.pts = [];
            }
        }

        onCanvasMouseMove.lastMove = +event.timeStamp;

        if (window.Point) {
            pts && (pts[pts.length] = new Point(x, y));
        }

        brush.stroke(x, y);
    }

    function onCanvasMouseUp() {
        brush.strokeEnd();

        window.removeEventListener('mousemove', onCanvasMouseMove, false);
        window.removeEventListener('mouseup', onCanvasMouseUp, false);
    }


    //

    function onCanvasTouchStart(event) {
        cleanPopUps();

        if (event.touches.length == 1) {
            event.preventDefault();

            brush.strokeStart(event.touches[0].pageX, event.touches[0].pageY);

            window.addEventListener('touchmove', onCanvasTouchMove, false);
            window.addEventListener('touchend', onCanvasTouchEnd, false);
        }
    }

    function onCanvasTouchMove(event) {
        if (event.touches.length == 1) {
            event.preventDefault();
            brush.stroke(event.touches[0].pageX, event.touches[0].pageY);
        }
    }

    function onCanvasTouchEnd(event) {
        if (event.touches.length == 0) {
            event.preventDefault();

            brush.strokeEnd();

            window.removeEventListener('touchmove', onCanvasTouchMove, false);
            window.removeEventListener('touchend', onCanvasTouchEnd, false);
        }
    }

    function cleanPopUps() {
        if (isForegroundColorSelectorVisible) {
            foregroundColorSelector.hide();
            isForegroundColorSelectorVisible = false;
        }

        if (isBackgroundColorSelectorVisible) {
            backgroundColorSelector.hide();
            isBackgroundColorSelectorVisible = false;
        }

        if (isAboutVisible) {
            about.hide();
            isAboutVisible = false;
        }
    }
})(this, this.document);



/**
* The $1 Unistroke Recognizer (JavaScript version)
*
*		Jacob O. Wobbrock
* 		The Information School
*		University of Washington
*		Mary Gates Hall, Box 352840
*		Seattle, WA 98195-2840
*		wobbrock@u.washington.edu
*
*		Andrew D. Wilson
*		Microsoft Research
*		One Microsoft Way
*		Redmond, WA 98052
*		awilson@microsoft.com
*
*		Yang Li
*		Department of Computer Science and Engineering
* 		University of Washington
*		The Allen Center, Box 352350
*		Seattle, WA 98195-2840
* 		yangli@cs.washington.edu
*/
//
// Point class
//

function Point(x, y) // constructor
{
    this.X = x;
    this.Y = y;
}
//
// Rectangle class
//

function Rectangle(x, y, width, height) // constructor
{
    this.X = x;
    this.Y = y;
    this.Width = width;
    this.Height = height;
}
//
// Template class: a unistroke template
//

function Template(name, points) // constructor
{
    this.Name = name;
    this.Points = Resample(points, NumPoints);
    var radians = IndicativeAngle(this.Points);
    this.Points = RotateBy(this.Points, -radians);
    this.Points = ScaleTo(this.Points, SquareSize);
    this.Points = TranslateTo(this.Points, Origin);
}
//
// Result class
//

function Result(name, score) // constructor
{
    this.Name = name;
    this.Score = score;
}
//
// DollarRecognizer class constants
//
var NumTemplates = 16;
var NumPoints = 64;
var SquareSize = 250.0;
var Origin = new Point(0, 0);
var Diagonal = Math.sqrt(SquareSize * SquareSize + SquareSize * SquareSize);
var HalfDiagonal = 0.5 * Diagonal;
var AngleRange = Deg2Rad(45.0);
var AnglePrecision = Deg2Rad(2.0);
var Phi = 0.5 * (-1.0 + Math.sqrt(5.0)); // Golden Ratio
//
// DollarRecognizer class
//

function DollarRecognizer() // constructor
{
    //
    // one predefined template for each gesture type
    //
    this.Templates = new Array();

    this.Templates[0] = new Template("star", new Array(new Point(75, 250), new Point(75, 247), new Point(77, 244), new Point(78, 242), new Point(79, 239), new Point(80, 237), new Point(82, 234), new Point(82, 232), new Point(84, 229), new Point(85, 225), new Point(87, 222), new Point(88, 219), new Point(89, 216), new Point(91, 212), new Point(92, 208), new Point(94, 204), new Point(95, 201), new Point(96, 196), new Point(97, 194), new Point(98, 191), new Point(100, 185), new Point(102, 178), new Point(104, 173), new Point(104, 171), new Point(105, 164), new Point(106, 158), new Point(107, 156), new Point(107, 152), new Point(108, 145), new Point(109, 141), new Point(110, 139), new Point(112, 133), new Point(113, 131), new Point(116, 127), new Point(117, 125), new Point(119, 122), new Point(121, 121), new Point(123, 120), new Point(125, 122), new Point(125, 125), new Point(127, 130), new Point(128, 133), new Point(131, 143), new Point(136, 153), new Point(140, 163), new Point(144, 172), new Point(145, 175), new Point(151, 189), new Point(156, 201), new Point(161, 213), new Point(166, 225), new Point(169, 233), new Point(171, 236), new Point(174, 243), new Point(177, 247), new Point(178, 249), new Point(179, 251), new Point(180, 253), new Point(180, 255), new Point(179, 257), new Point(177, 257), new Point(174, 255), new Point(169, 250), new Point(164, 247), new Point(160, 245), new Point(149, 238), new Point(138, 230), new Point(127, 221), new Point(124, 220), new Point(112, 212), new Point(110, 210), new Point(96, 201), new Point(84, 195), new Point(74, 190), new Point(64, 182), new Point(55, 175), new Point(51, 172), new Point(49, 170), new Point(51, 169), new Point(56, 169), new Point(66, 169), new Point(78, 168), new Point(92, 166), new Point(107, 164), new Point(123, 161), new Point(140, 162), new Point(156, 162), new Point(171, 160), new Point(173, 160), new Point(186, 160), new Point(195, 160), new Point(198, 161), new Point(203, 163), new Point(208, 163), new Point(206, 164), new Point(200, 167), new Point(187, 172), new Point(174, 179), new Point(172, 181), new Point(153, 192), new Point(137, 201), new Point(123, 211), new Point(112, 220), new Point(99, 229), new Point(90, 237), new Point(80, 244), new Point(73, 250), new Point(69, 254), new Point(69, 252)));


    //
    // The $1 Gesture Recognizer API begins here -- 3 methods
    //
    this.Recognize = function(points) {
        points = Resample(points, NumPoints);
        var radians = IndicativeAngle(points);
        points = RotateBy(points, -radians);
        points = ScaleTo(points, SquareSize);
        points = TranslateTo(points, Origin);

        var b = +Infinity;
        var t = 0;
        for (var i = 0; i < this.Templates.length; i++) {
            var d = DistanceAtBestAngle(points, this.Templates[i], -AngleRange, +AngleRange, AnglePrecision);
            if (d < b) {
                b = d;
                t = i;
            }
        }
        var score = 1.0 - (b / HalfDiagonal);
        return new Result(this.Templates[t].Name, score);
    };
    //
    // add/delete new templates
    //
    this.AddTemplate = function(name, points) {
        this.Templates[this.Templates.length] = new Template(name, points); // append new template
        var num = 0;
        for (var i = 0; i < this.Templates.length; i++) {
            if (this.Templates[i].Name == name) num++;
        }
        return num;
    }
    this.DeleteUserTemplates = function() {
        this.Templates.length = NumTemplates; // clear any beyond the original set
        return NumTemplates;
    }
}
//
// Private helper functions from this point down
//

function Resample(points, n) {
    var I = PathLength(points) / (n - 1); // interval length
    var D = 0.0;
    var newpoints = new Array(points[0]);
    for (var i = 1; i < points.length; i++) {
        var d = Distance(points[i - 1], points[i]);
        if ((D + d) >= I) {
            var qx = points[i - 1].X + ((I - D) / d) * (points[i].X - points[i - 1].X);
            var qy = points[i - 1].Y + ((I - D) / d) * (points[i].Y - points[i - 1].Y);
            var q = new Point(qx, qy);
            newpoints[newpoints.length] = q; // append new point 'q'
            points.splice(i, 0, q); // insert 'q' at position i in points s.t. 'q' will be the next i
            D = 0.0;
        } else D += d;
    }
    // somtimes we fall a rounding-error short of adding the last point, so add it if so
    if (newpoints.length == n - 1) {
        newpoints[newpoints.length] = new Point(points[points.length - 1].X, points[points.length - 1].Y);
    }
    return newpoints;
}

function IndicativeAngle(points) {
    var c = Centroid(points);
    return Math.atan2(c.Y - points[0].Y, c.X - points[0].X);
}

function RotateBy(points, radians) {
    var c = Centroid(points);
    var cos = Math.cos(radians);
    var sin = Math.sin(radians);

    var newpoints = new Array();
    for (var i = 0; i < points.length; i++) {
        var qx = (points[i].X - c.X) * cos - (points[i].Y - c.Y) * sin + c.X
        var qy = (points[i].X - c.X) * sin + (points[i].Y - c.Y) * cos + c.Y;
        newpoints[newpoints.length] = new Point(qx, qy);
    }
    return newpoints;
}

function ScaleTo(points, size) // non-uniform scale; assumes 2D gestures (i.e., no lines)
{
    var B = BoundingBox(points);
    var newpoints = new Array();
    for (var i = 0; i < points.length; i++) {
        var qx = points[i].X * (size / B.Width);
        var qy = points[i].Y * (size / B.Height);
        newpoints[newpoints.length] = new Point(qx, qy);
    }
    return newpoints;
}

function TranslateTo(points, pt) // translates points' centroid
{
    var c = Centroid(points);
    var newpoints = new Array();
    for (var i = 0; i < points.length; i++) {
        var qx = points[i].X + pt.X - c.X;
        var qy = points[i].Y + pt.Y - c.Y;
        newpoints[newpoints.length] = new Point(qx, qy);
    }
    return newpoints;
}

function DistanceAtBestAngle(points, T, a, b, threshold) {
    var x1 = Phi * a + (1.0 - Phi) * b;
    var f1 = DistanceAtAngle(points, T, x1);
    var x2 = (1.0 - Phi) * a + Phi * b;
    var f2 = DistanceAtAngle(points, T, x2);
    while (Math.abs(b - a) > threshold) {
        if (f1 < f2) {
            b = x2;
            x2 = x1;
            f2 = f1;
            x1 = Phi * a + (1.0 - Phi) * b;
            f1 = DistanceAtAngle(points, T, x1);
        } else {
            a = x1;
            x1 = x2;
            f1 = f2;
            x2 = (1.0 - Phi) * a + Phi * b;
            f2 = DistanceAtAngle(points, T, x2);
        }
    }
    return Math.min(f1, f2);
}

function DistanceAtAngle(points, T, radians) {
    var newpoints = RotateBy(points, radians);
    return PathDistance(newpoints, T.Points);
}

function Centroid(points) {
    var x = 0.0,
        y = 0.0;
    for (var i = 0; i < points.length; i++) {
        x += points[i].X;
        y += points[i].Y;
    }
    x /= points.length;
    y /= points.length;
    return new Point(x, y);
}

function BoundingBox(points) {
    var minX = +Infinity,
        maxX = -Infinity,
        minY = +Infinity,
        maxY = -Infinity;
    for (var i = 0; i < points.length; i++) {
        if (points[i].X < minX) minX = points[i].X;
        if (points[i].X > maxX) maxX = points[i].X;
        if (points[i].Y < minY) minY = points[i].Y;
        if (points[i].Y > maxY) maxY = points[i].Y;
    }
    return new Rectangle(minX, minY, maxX - minX, maxY - minY);
}

function PathDistance(pts1, pts2) {
    var d = 0.0;
    for (var i = 0; i < pts1.length; i++) // assumes pts1.length == pts2.length
        d += Distance(pts1[i], pts2[i]);
    return d / pts1.length;
}

function PathLength(points) {
    var d = 0.0;
    for (var i = 1; i < points.length; i++)
        d += Distance(points[i - 1], points[i]);
    return d;
}

function Distance(p1, p2) {
    var dx = p2.X - p1.X;
    var dy = p2.Y - p1.Y;
    return Math.sqrt(dx * dx + dy * dy);
}

function Deg2Rad(d) {
    return (d * Math.PI / 180.0);
}

function Rad2Deg(r) {
    return (r * 180.0 / Math.PI);
}





// this part is just the easter egg for erasure. you dont need it.

function starryEgg() {
    /*
    if (document.getElementById('erasure')) return;

    // console.log('sing a songggggg')
    var div = document.createElement('div');
    // thx digitalfiz for the much preferred iframe embed :D
    div.innerHTML = '<iframe width="384" height="313" src="http://www.youtube.com/v/LwWZI_k3Vlg=en_US&fs=1&autoplay=1" frameborder="0" allowfullscreen></iframe>';
    document.body.appendChild(div);
    div.style.position = 'fixed';
    div.style.bottom = '250px';
    div.style.left = '50%';
    div.style.marginLeft = '-190px';
    */
}



setTimeout(harmony, 100);