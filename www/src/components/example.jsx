import { useEffect, useRef, useState } from 'react';

const easing = 'cubic-bezier(0.42, 0, 0.58, 1)';
const transition = `transform 0.3s ${easing}, opacity 0.3s ${easing}`;

function CanvasOverlay({ canvas, base, onClose }) {
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
        <div className="example-overlay" ref={containerRef} onClick={onClose}>
            <img src={`${base}/ic_close_black_24px.svg`} alt="Close" className="example-overlay-close" />
        </div>
    );
}

export default function Example({ base = '' }) {
    const [open, setOpen] = useState(false);
    const [canvas, setCanvas] = useState(null);

    const handleCapture = async () => {
        try {
            const { default: html2canvas } = await import('html2canvas');
            const result = await html2canvas(document.body, {
                allowTaint: true,
                width: window.innerWidth,
                height: window.innerHeight,
                scrollX: window.pageXOffset,
                scrollY: window.pageYOffset,
                x: window.pageXOffset,
                y: window.pageYOffset,
            });

            result.style.position = 'fixed';
            result.style.top = '0';
            result.style.left = '0';
            result.style.opacity = '0';
            result.style.transform = 'scale(0)';
            result.style.zIndex = '99999999';
            result.style.transition = transition;

            setCanvas(result);
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div data-html2canvas-ignore="true">
            {canvas && <CanvasOverlay canvas={canvas} base={base} onClose={() => setCanvas(null)} />}

            <div
                className="example-fab-container"
                style={{
                    visibility: open ? 'visible' : 'hidden',
                    transition: `visibility 0.3s ${easing}`,
                }}
            >
                {/* Trigger button */}
                <div className="example-fab-anchor">
                    <div id="tryhtml2canvas" className="example-fab-btn" onClick={() => setOpen(s => !s)}>
                        <img src={`${base}/ic_camera_alt_black_24px.svg`} alt="Try html2canvas" />
                    </div>
                </div>

                {/* Expanded menu */}
                <div
                    className="example-fab-menu"
                    style={{
                        opacity: open ? 0.95 : 0,
                        transform: open ? 'scale(1)' : 'scale(0)',
                        transition,
                    }}
                >
                    <div className="example-fab-panel">
                        <h4>Try out html2canvas</h4>
                        <p>Test out html2canvas by rendering the viewport from the current page.</p>
                        <div className="example-capture-btn" onClick={handleCapture}>
                            Capture
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
