var h2cSelector, h2cOptions;
var CI = window.location.search.indexOf('selenium') !== -1;
var AUTORUN = window.location.search.indexOf('run=false') === -1;
var REFTEST = window.location.search.indexOf('reftest') !== -1;

// In reftest mode the iframe is 800×600 — constrain the body width so that
// line-wrapping and vw-based values are consistent across all environments.
// Also inject embedded fonts so visual output is identical everywhere.
if (REFTEST) {
    // Inject embedded fonts stylesheet first so @font-face rules are available
    // before any inline style computation.
    var fontLink = document.createElement('link');
    fontLink.rel = 'stylesheet';
    fontLink.href = '/tests/assets/fonts/fonts.css';
    document.head.insertBefore(fontLink, document.head.firstChild);

    var style = document.createElement('style');
    style.textContent = 'html, body { width: 800px; max-width: 800px; box-sizing: border-box; margin: 0; }';
    document.head.appendChild(style);
}

(function (document, window) {
    function loadScripts(srcs, callback) {
        var base = window.location.protocol + '//' + window.location.host;
        function loadNext(index) {
            if (index >= srcs.length) {
                callback();
                return;
            }
            var script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = base + srcs[index] + '.js?' + Math.random();
            script.onload = function () {
                loadNext(index + 1);
            };
            script.onerror = function () {
                console.error('Failed to load script: ' + script.src);
                loadNext(index + 1);
            };
            document.head.appendChild(script);
        }
        loadNext(0);
    }

    var scripts = (
        typeof Promise === 'undefined' ? ['/node_modules/es6-promise/dist/es6-promise.auto.min'] : []
    ).concat(['/node_modules/jquery/dist/jquery.min', '/dist/html2canvas']);

    window.addEventListener('unhandledrejection', function (event) {
        console.info('UNHANDLED PROMISE REJECTION:', event);
    });

    window.onload = function () {
        (function ($) {
            $.fn.html2canvas = function (options) {
                var date = new Date(),
                    $message = null,
                    timeoutTimer = false,
                    timer = date.getTime();
                options = options || {};
                var promise = html2canvas(this[0], options);
                promise['catch'](function (err) {
                    console.log('html2canvas threw an error', err);
                });

                promise.then(function (canvas) {
                    var $canvas = $(canvas),
                        finishTime = new Date();

                    $canvas
                        .addClass('html2canvas')
                        .css({
                            position: 'absolute',
                            left: 0,
                            top: 0,
                        })
                        .appendTo(document.body);
                    if (!CI) {
                        $canvas.siblings().toggle();
                        $(window).click(function (event) {
                            if (event.button === 0) {
                                var scrollTop = $(window).scrollTop();
                                $canvas.toggle().siblings().toggle();
                                $(document.documentElement).css('background', $canvas.is(':visible') ? 'none' : '');
                                $(document.body).css('background', $canvas.is(':visible') ? 'none' : '');
                                throwMessage('Canvas Render ' + ($canvas.is(':visible') ? 'visible' : 'hidden'));
                                $(window).scrollTop(scrollTop);
                            }
                        });
                        $(document.documentElement).css('background', $canvas.is(':visible') ? 'none' : '');
                        $(document.body).css('background', $canvas.is(':visible') ? 'none' : '');
                        throwMessage('Screenshot created in ' + (finishTime.getTime() - timer) + ' ms<br />', 4000);
                    } else {
                        $canvas.css('display', 'none');
                    }
                    // test if canvas is read-able
                    try {
                        $canvas[0].toDataURL();
                    } catch (e) {
                        if ($canvas[0].nodeName.toLowerCase() === 'canvas') {
                            // TODO, maybe add a bit less offensive way to present this, but still something that can easily be noticed
                            window.alert('Canvas is tainted, unable to read data');
                        }
                    }
                });

                function throwMessage(msg, duration) {
                    window.clearTimeout(timeoutTimer);
                    timeoutTimer = window.setTimeout(function () {
                        $message.fadeOut(function () {
                            $message.remove();
                            $message = null;
                        });
                    }, duration || 2000);
                    if ($message) $message.remove();
                    $message = $('<div />')
                        .html(msg)
                        .css({
                            margin: 0,
                            padding: 10,
                            background: '#000',
                            opacity: 0.7,
                            position: 'fixed',
                            top: 10,
                            right: 10,
                            fontFamily: 'Tahoma',
                            color: '#fff',
                            fontSize: 12,
                            borderRadius: 12,
                            width: 'auto',
                            height: 'auto',
                            textAlign: 'center',
                            textDecoration: 'none',
                            display: 'none',
                        })
                        .appendTo(document.body)
                        .fadeIn();
                }
            };
        })(jQuery);

        h2cSelector = typeof h2cSelector === 'undefined' ? [document.documentElement] : h2cSelector;

        if (window.setUp) {
            window.setUp();
        }

        window.run = function () {
            $(h2cSelector).html2canvas(
                $.extend(
                    {
                        logging: true,
                        proxy: 'http://localhost:8081/proxy',
                        useCORS: false,
                        removeContainer: true,
                    },
                    h2cOptions,
                    REFTEST ? { windowWidth: 800, windowHeight: 600 } : {},
                ),
            );
        };

        if (typeof dontRun === 'undefined' && AUTORUN) {
            setTimeout(window.run, 100);
        }
    };

    // Load dependencies after window.onload is defined so the callback
    // can safely fire it if the page is already complete.
    loadScripts(scripts, function () {
        if (document.readyState === 'complete' && typeof window.onload === 'function') {
            window.onload();
        }
    });
})(document, window);
