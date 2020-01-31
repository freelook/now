import _ from 'lodash';
import React, {useEffect, useState} from 'react';
import Head from 'components/head';
import { useRouter } from 'next/router';
import { Progress } from 'semantic-ui-react';

interface LayoutProps {
    children?:JSX.Element|JSX.Element[];
    head: {
        title: string;
        description: string;
        ogImage: string;
        url: string;
    };     
}

const background = '#fff';

const Layout = (props:LayoutProps) => {
    const router = useRouter();
    const [load, setLoad] = useState(false);
    const loader = () => setLoad(true);

    useEffect(() => {
        setLoad(false);
        router.events.on('routeChangeStart', loader);
        return () => router.events.off('routeChangeStart', loader);
    }, [router.asPath]);

    return (
        <section>
            <Head {...props.head} />
            <style jsx global>{`
                html, body {
                    background: ${background};
                    font-family: Roboto Mono, monospace;
                }
                .fli-loader {
                    position: fixed !important;
                    z-index: 999;
                    margin: 0 !important;
                    padding: 0 !important;
                    top: 0;
                    left: 0;
                    right: 0;
                }
                .fli-loader .bar {
                    height: 7px !important;
                }
            `}</style>
            {load && <Progress percent={90} indicating className="fli-loader" />}
            {props.children}
        </section>
    );
};

export default Layout;