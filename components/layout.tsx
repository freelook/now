import _ from 'lodash';
import React, {useEffect, useState} from 'react';
import Head, {HeadPropsType} from 'components/head';
import { useRouter } from 'next/router';
import { Progress } from 'semantic-ui-react';
import * as analytics from 'hooks/analytics';
import * as route from 'hooks/route';

interface LayoutProps {
    children?:JSX.Element|JSX.Element[];
    head: HeadPropsType;     
}

const background = '#fff';

const Layout = (props:LayoutProps) => {
    const router = useRouter();
    const [load, setLoad] = useState(false);
    const loader = (asPath:string) => {
        if(asPath !== router.asPath) {
            setLoad(true);
        }
    };

    useEffect(() => {
        setLoad(false);
        analytics.log();
        router.events.on('routeChangeStart', loader);
        route.prev(router.asPath);
        return () => router.events.off('routeChangeStart', loader);
    }, [router.asPath]);

    return (
        <section>
            <Head {...props.head} />
            <style jsx global>{`
                html, body {
                    overflow: auto;
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
                    height: 3px !important;
                }
            `}</style>
            {load && <Progress percent={90} indicating className="fli-loader" />}
            {props.children}
        </section>
    );
};

export default Layout;