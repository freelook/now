import React from 'react';
import Head from './head';

const background = '#fff';

interface LayoutProps {
    children?:JSX.Element|JSX.Element[];
    head: {
        title: string;
        description: string;
        ogImage: string;
        url: string;
    };     
}

const Layout = (props:LayoutProps) => (
  <>
    <Head {...props.head} />
    <style jsx global>{`
        html, body {
            background: ${background};
        }
    `}</style>
    {props.children}
  </>
);

export default Layout;