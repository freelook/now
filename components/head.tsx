import _ from 'lodash';
import React from 'react';
import { useAmp } from 'next/amp';
import NextHead from 'next/head';
import { buildUrl } from 'hooks/route';
import { useRouter } from 'next/router';
import { supportedLocales } from 'hooks/locale';

export interface HeadPropsType {
  title: string;
  description: string;
  image?: string
};

export const FLI_DOMAIN = 'freelook-now.herokuapp.com';

const Head = (props: HeadPropsType) => {
    const isAmp = useAmp();
    const router = useRouter();
    const url = `https://${FLI_DOMAIN}${router.asPath}`; 
    const title = props.title || '';
    const description = props.description || '';
    const image = props.image || '' ;   
    return (
        <NextHead>
            <title>{title}</title>
            <link rel="icon" href="/static/favicon.ico" />
            {!isAmp ? <link rel="stylesheet" href="//cdn.jsdelivr.net/npm/semantic-ui@2.4.2/dist/semantic.min.css" /> : null}
            <link rel="canonical" href={`https://${FLI_DOMAIN}${buildUrl(router, {query: {locale: '', amp: ''} })}`} />
            {!isAmp ? <link rel="amphtml" href={`https://${FLI_DOMAIN}${buildUrl(router, {query: {locale: '', amp: '1'} })}`} /> : null}
            {_.map(supportedLocales, (l)=> {
                const props = {
                    key: l,
                    rel: "alternate",
                    hrefLang: l,
                    href: `https://${FLI_DOMAIN}${buildUrl(router, {query: {locale: l} })}`
                };
                return <link {...props} />;
            })}
            <meta charSet="UTF-8" />
            {!isAmp ? <meta name="viewport" content="width=device-width,initial-scale=1" />: null}
            <meta name="robots" content="index,follow" />
            <meta name="google-site-verification" content="3mHDDzJ0pnhPM5k2nydyYC28H_AP9oqjoIaVXum05DM" />
            <meta name="msvalidate.01" content="36AC47E1042C4DBD8923DEEE0F9FC843" />
            <meta name="yandex-verification" content="a496d068d44f4568" />
            <meta name="facebook-domain-verification" content="fny9bkfd56o6r6df4usw3gft8epjtc" />
            <meta name="description" content={description} />
            <meta property="og:url" content={url} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            {image ? <meta property="og:image" content={image} /> : null}
            {isAmp ? <script async custom-element="amp-form" src="https://cdn.ampproject.org/v0/amp-form-0.1.js"></script> : null}
            {isAmp ? <style jsx global>{`
                .fli-input > input { width:100%; }
                .segment { margin: 15px; }
                .fli-items.grid { column-gap: 5px; }
                .fli-items.grid .column { break-inside: avoid-column; }
                .center { text-align: center; }
                .list > .item { display: inline-block; margin: 3px; }
                .amp-container { position: relative; width: 250px; height: 200px; }
                .amp-container amp-img.contain img { object-fit: contain; }
                .icon.external:after { content: '>'; }
                .icon { padding: 1px; }
                .icon.search:before { content: '+'; }
                .icon.images:before { content: '#'; }
                .icon.cart:before { content: '%'; }
            `}</style>: null}
        </NextHead>
    );
}

export default Head;
