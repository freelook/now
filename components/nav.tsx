import _ from 'lodash';
import React from 'react';
import Link from 'next/link';
import { useAmp } from 'next/amp';
import { useRouter } from 'next/router';
import * as route from 'hooks/route';
import { IndexContext } from 'pages';
import {useInput} from 'components/input';

interface NavProps {
    ctx: IndexContext;
}

export const PATH = {
    HOME: '/',
    NEWS: '/news',
    WEB: '/web',
    ECOM: '/ecom',
    META: '/meta',
    FEED: '/feed'
};

const Nav = (props: NavProps) => {
    const input = useInput();
    const router = useRouter();
    const query = input ? `?input=${input}` : '';
    const links = [
        { href: PATH.HOME, label: _.get(props.ctx, 't.Trends', 'Trends') },
        { href: route.ifPath(router).has(PATH.NEWS) ? PATH.NEWS : `${PATH.NEWS}${query}`, label: _.get(props.ctx, 't.News', 'News') },
        { href: route.ifPath(router).has(PATH.WEB) ? PATH.WEB : `${PATH.WEB}${query}`, label: _.get(props.ctx, 't.Web', 'Web') },
        { href: route.ifPath(router).has(PATH.ECOM) ? PATH.ECOM : `${PATH.ECOM}${query}`, label: _.get(props.ctx, 't.Ecom', 'Ecom') },
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
    const isAmp = useAmp();
    return !isAmp ? 
    <a onClick={(e) => {
        e && e.preventDefault();
        route.open(props.link);
    }}>{props.children}</a> : 
    <a href={props.link} target="_blank">{props.children}</a>
};

export default Nav;
