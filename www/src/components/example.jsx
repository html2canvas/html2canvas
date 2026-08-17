import {useEffect, useRef, useState} from 'react';

function CanvasOverlay({canvas, onClose}) {
    const containerRef = useRef(null);

    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.appendChild(canvas);
            setTimeout(() => {
                canvas.style.opacity = '1';
                canvas.style.transform = 'scale(0.8)';
            }, 10);
        }
    }, [canvas]);

    return (
        <div
            style={{
                background: 'rgba(0, 0, 0, 0.5)',
                position: 'fixed',
                top: 0,
                left: 0,
                zIndex: 99999998,
                width: '100%',
                height: '100%'
            }}
            ref={containerRef}
            onClick={onClose}
        >
            <img
                src="/ic_close_black_24px.svg"
                alt="Close"
                style={{position: 'absolute', right: '20px', top: '20px', cursor: 'pointer'}}
            />
        </div>
    );
}

export default function Example() {
    const [open, setOpen] = useState(false);
    const [canvas, setCanvas] = useState(null);

    const handleCapture = async () => {
        try {
            const {default: html2canvas} = await import('html2canvas');
            const result = await html2canvas(document.body, {
                allowTaint: true,
                width: window.innerWidth,
                height: window.innerHeight,
                scrollX: window.pageXOffset,
                scrollY: window.pageYOffset,
                x: window.pageXOffset,
                y: window.pageYOffset
            });

            result.style.position = 'fixed';
            result.style.top = '0';
            result.style.left = '0';
            result.style.opacity = '0';
            result.style.transform = 'scale(0)';
            result.style.zIndex = '99999999';
            result.style.transition =
                'transform 0.3s cubic-bezier(0.42, 0, 0.58, 1),opacity 0.3s cubic-bezier(0.42, 0, 0.58, 1)';

            setCanvas(result);
        } catch (e) {
            console.error(e);
        }
    };

    const easing = 'cubic-bezier(0.42, 0, 0.58, 1)';
    const transition = `transform 0.3s ${easing}, opacity 0.3s ${easing}`;

    return (
        <div data-html2canvas-ignore="true">
            {canvas && <CanvasOverlay canvas={canvas} onClose={() => setCanvas(null)} />}

            {/* Floating button container */}
            <div
                style={{
                    width: '800px',
                    height: '800px',
                    position: 'fixed',
                    zIndex: 1000,
                    right: '-348.4px',
                    bottom: '-327.2px',
                    visibility: open ? 'visible' : 'hidden',
                    transition: `visibility 0.3s ${easing}`
                }}
            >
                {/* Trigger button */}
                <div
                    style={{
                        position: 'absolute',
                        top: '344px',
                        left: '344px',
                        width: '112px',
                        height: '112px',
                        borderRadius: '50%',
                        zIndex: 100001
                    }}
                >
                    <div
                        id="tryhtml2canvas"
                        onClick={() => setOpen((s) => !s)}
                        style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            width: '56px',
                            height: '56px',
                            backgroundColor: '#33691e',
                            position: 'absolute',
                            left: '50%',
                            top: '50%',
                            cursor: 'pointer',
                            transform: 'translate(-50%, -50%)',
                            borderRadius: '50%',
                            visibility: 'visible',
                            boxShadow:
                                '0 2px 2px 0 rgba(0,0,0,0.14), 0 1px 5px 0 rgba(0,0,0,0.12), 0 3px 1px -2px rgba(0,0,0,0.2)'
                        }}
                    >
                        <img
                            src="/ic_camera_alt_black_24px.svg"
                            style={{width: '30px', height: '30px', flex: 1, margin: 0}}
                            alt="Try html2canvas"
                        />
                    </div>
                </div>

                {/* Expanded menu */}
                <div
                    style={{
                        backgroundColor: '#33691e',
                        borderRadius: '50%',
                        opacity: open ? 0.95 : 0,
                        transition,
                        transform: open ? 'scale(1)' : 'scale(0)',
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        zIndex: 100000
                    }}
                >
                    <div
                        style={{
                            width: '456px',
                            height: '600px',
                            right: '56px',
                            bottom: '56px',
                            padding: '56px',
                            position: 'fixed',
                            left: 0,
                            color: '#fff'
                        }}
                    >
                        <h4>Try out html2canvas</h4>
                        <p style={{color: '#fff'}}>
                            Test out html2canvas by rendering the viewport from the current page.
                        </p>
                        <div
                            onClick={handleCapture}
                            style={{
                                padding: '4px 8px',
                                margin: '10px',
                                border: '2px solid #fff',
                                color: '#fff',
                                display: 'inline-block',
                                cursor: 'pointer'
                            }}
                        >
                            Capture
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
