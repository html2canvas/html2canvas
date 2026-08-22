import { useState } from 'react';

const makeLinks = base => [
    { href: `${base}/documentation`, text: 'About' },
    { href: `${base}/getting-started`, text: 'Getting started' },
    { href: `${base}/configuration`, text: 'Configuration' },
    { href: `${base}/features`, text: 'Features' },
    { href: `${base}/examples`, text: 'Examples' },
    { href: `${base}/proxy`, text: 'Proxy' },
    { href: `${base}/faq`, text: 'FAQ' },
];

export default function Navigation({ base = '' }) {
    const [open, setOpen] = useState(false);

    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
    const links = makeLinks(base);

    return (
        <nav className="nav-sidebar">
            <div className="nav-header">
                <img
                    src={`${base}/ic_menu_black_24px.svg`}
                    onClick={() => setOpen(s => !s)}
                    alt="Menu"
                    className="nav-menu-icon"
                />
                <a href={base + '/'}>
                    <img className="nav-logo" src={`${base}/logo.svg`} alt="html2canvas" />
                </a>
            </div>

            <ul className={open ? 'nav-links nav-links--open' : 'nav-links'}>
                {links.map(({ href, text }) => {
                    const isActive = currentPath === href || currentPath.startsWith(href + '/');
                    return (
                        <li key={href} className="nav-item">
                            <a href={href} className={isActive ? 'nav-link nav-link--active' : 'nav-link'}>
                                {text}
                            </a>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}
