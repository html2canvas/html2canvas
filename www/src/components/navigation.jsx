import {useState} from 'react';

const links = [
    {href: '/documentation', text: 'About'},
    {href: '/getting-started', text: 'Getting started'},
    {href: '/configuration', text: 'Configuration'},
    {href: '/features', text: 'Features'},
    {href: '/proxy', text: 'Proxy'},
    {href: '/faq', text: 'FAQ'}
];

export default function Navigation() {
    const [open, setOpen] = useState(false);

    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';

    return (
        <nav
            style={{
                fontSize: '13px',
                backgroundColor: '#fff'
            }}
            className="nav-sidebar"
        >
            <div
                style={{
                    background: '#558b2f',
                    alignItems: 'center',
                    padding: '24px 30px 24px 0px',
                    display: 'flex'
                }}
                className="nav-header"
            >
                <img
                    src="/ic_menu_black_24px.svg"
                    onClick={() => setOpen((s) => !s)}
                    alt="Menu"
                    style={{
                        width: '50px',
                        cursor: 'pointer',
                        margin: '0 20px 0'
                    }}
                    className="nav-menu-icon"
                />
                <a href="/">
                    <img src="/logo.svg" style={{margin: 0}} alt="html2canvas" />
                </a>
            </div>

            <ul
                style={{
                    listStyle: 'none',
                    margin: 0,
                    padding: 0
                }}
                className={open ? 'nav-links nav-links--open' : 'nav-links'}
            >
                {links.map(({href, text}) => {
                    const isActive = currentPath === href || currentPath.startsWith(href + '/');
                    return (
                        <li key={href} style={{padding: 0, margin: 0}}>
                            <a
                                href={href}
                                style={{
                                    lineHeight: '44px',
                                    height: '44px',
                                    padding: '0 30px',
                                    display: 'block',
                                    fontWeight: '500',
                                    transition: '.3s ease-out',
                                    backgroundColor: isActive ? '#7cb342' : undefined,
                                    color: isActive ? '#fff' : 'rgba(0,0,0,0.87)',
                                    textDecoration: 'none'
                                }}
                                className="nav-link"
                            >
                                {text}
                            </a>
                        </li>
                    );
                })}
            </ul>

            <style>{`
                .nav-sidebar {
                    position: relative;
                }
                .nav-menu-icon {
                    display: block;
                }
                .nav-links {
                    display: none;
                }
                .nav-links--open {
                    display: block !important;
                }
                .nav-link:hover {
                    background-color: rgba(0,0,0,0.05);
                }
                @media (min-width: 1000px) {
                    .nav-sidebar {
                        position: fixed !important;
                        top: 0;
                        left: 0;
                        width: 300px;
                        box-shadow: 0 2px 2px 0 rgba(0,0,0,0.14), 0 1px 5px 0 rgba(0,0,0,0.12), 0 3px 1px -2px rgba(0,0,0,0.2);
                        height: 100%;
                        z-index: 100;
                    }
                    .nav-header {
                        padding: 24px 30px 24px 30px !important;
                    }
                    .nav-menu-icon {
                        display: none !important;
                    }
                    .nav-links {
                        display: block !important;
                    }
                }
            `}</style>
        </nav>
    );
}
