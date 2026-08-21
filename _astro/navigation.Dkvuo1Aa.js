import{j as n}from"./jsx-runtime.ClP7wGfN.js";import{r}from"./index.DK-fsZOb.js";const l=[{href:"/documentation",text:"About"},{href:"/getting-started",text:"Getting started"},{href:"/configuration",text:"Configuration"},{href:"/features",text:"Features"},{href:"/proxy",text:"Proxy"},{href:"/faq",text:"FAQ"}];function x(){const[i,s]=r.useState(!1),a=typeof window<"u"?window.location.pathname:"";return n.jsxs("nav",{style:{fontSize:"13px",backgroundColor:"#fff"},className:"nav-sidebar",children:[n.jsxs("div",{style:{background:"#558b2f",alignItems:"center",padding:"24px 30px 24px 0px",display:"flex"},className:"nav-header",children:[n.jsx("img",{src:"/ic_menu_black_24px.svg",onClick:()=>s(t=>!t),alt:"Menu",style:{width:"50px",cursor:"pointer",margin:"0 20px 0"},className:"nav-menu-icon"}),n.jsx("a",{href:"/",children:n.jsx("img",{src:"/logo.svg",style:{margin:0},alt:"html2canvas"})})]}),n.jsx("ul",{style:{listStyle:"none",margin:0,padding:0},className:i?"nav-links nav-links--open":"nav-links",children:l.map(({href:t,text:o})=>{const e=a===t||a.startsWith(t+"/");return n.jsx("li",{style:{padding:0,margin:0},children:n.jsx("a",{href:t,style:{lineHeight:"44px",height:"44px",padding:"0 30px",display:"block",fontWeight:"500",transition:".3s ease-out",backgroundColor:e?"#7cb342":void 0,color:e?"#fff":"rgba(0,0,0,0.87)",textDecoration:"none"},className:"nav-link",children:o})},t)})}),n.jsx("style",{children:`
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
            `})]})}export{x as default};
