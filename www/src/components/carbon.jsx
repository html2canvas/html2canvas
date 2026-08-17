import {useEffect, useRef} from 'react';

export default function Carbon({style}) {
    const containerRef = useRef(null);

    useEffect(() => {
        if (containerRef.current && !document.getElementById('_carbonads_js')) {
            const script = document.createElement('script');
            script.src =
                '//cdn.carbonads.com/carbon.js?zoneid=1673&serve=C6AILKT&placement=html2canvashertzencom';
            script.async = true;
            script.id = '_carbonads_js';
            containerRef.current.appendChild(script);
        }
    }, []);

    return <div ref={containerRef} style={style} />;
}
