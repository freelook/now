import _ from 'lodash';
import React from 'react';
import Link from 'next/link';
import * as route from 'hooks/route';
import { IndexContext } from 'pages';

interface NavProps {
    ctx: IndexContext;
}

export const PATH = {
    HOME: '/',
    NEWS: '/news',
    WEB: '/web',
    ECOM: '/ecom',
    META: '/meta'
};

const Nav = (props: NavProps) => {
    const links = [
        { href: PATH.HOME, label: _.get(props.ctx, 't.Trends', 'Trends') },
        { href: PATH.NEWS, label: _.get(props.ctx, 't.News', 'News') },
        { href: PATH.WEB, label: _.get(props.ctx, 't.Web', 'Web') },
        { href: PATH.ECOM, label: _.get(props.ctx, 't.Ecom', 'Ecom') },
    ];

    return (
        <nav>
            <ul>
                {links.map(({ href, label }, key) => (
                    <li key={`link-${key}`}>
                        <Link href={href} prefetch={false}><a>{label}</a></Link>
                    </li>
                ))}
            </ul>

            <style jsx>{`
                nav {
                    overflow-x: auto;
                    text-align: center;
                }
                ul {
                    margin: 0;
                    padding: 8px 16px 0;
                    display: flex;
                    justify-content: space-between;
                }
                li {
                    display: flex;
                    padding: 6px 8px;
                }
                a {
                    text-decoration: none;
                }
            `}</style>
        </nav>
    );
};

Nav.External = (props:{children:any; link:string;}) => {
    return <a onClick={(e) => {
        e && e.preventDefault();
        route.open(props.link);
    }}>{props.children}</a>
};

export default Nav;
