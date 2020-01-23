import _ from 'lodash';
import React from 'react';
import Link from 'next/link';
import { IndexContext } from 'pages';

interface NavProps {
    ctx: IndexContext;
}

export const PATH = {
    HOME: '/',
    ECOM: '/ecom'
};

const Nav = (props: NavProps) => {
    const links = [
        { href: PATH.HOME, label: _.get(props.ctx, 't.Home', 'Home') },
        { href: PATH.ECOM, label: _.get(props.ctx, 't.Ecom', 'Ecom') },
    ];

    return (
        <nav>
            <ul>
                {links.map(({ href, label }, key) => (
                    <li key={`link-${key}`}>
                        <Link href={href}><a>{label}</a></Link>
                    </li>
                ))}
            </ul>

            <style jsx>{`
                nav {
                    text-align: center;
                }
                ul {
                    display: flex;
                    justify-content: space-between;
                }
                nav > ul {
                    padding: 4px 16px;
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
}

export default Nav;
