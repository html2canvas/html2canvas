export default function Footer() {
    return (
        <footer
            style={{
                backgroundColor: '#558b2f',
                color: 'rgba(255,255,255, 0.8)',
                fontWeight: 300,
                minHeight: '50px',
                lineHeight: '50px',
                padding: '10px 0px'
            }}
        >
            <div
                style={{
                    margin: '0 auto',
                    fontSize: '10.5px',
                    textAlign: 'center'
                }}
                className="footer-inner"
            >
                Created by{' '}
                <a href="https://hertzen.com" style={{color: '#fff', fontWeight: 'bold'}}>
                    Niklas von Hertzen
                </a>
                . Licensed under the MIT License.
            </div>
            <style>{`
                @media (min-width: 1000px) {
                    .footer-inner {
                        text-align: left !important;
                        width: 85%;
                        font-size: 14.5px !important;
                    }
                }
            `}</style>
        </footer>
    );
}
