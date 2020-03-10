import _ from 'lodash';
import React from 'react';
import NextHead from 'next/head';
import { buildUrl } from 'hooks/route';
import { useRouter } from 'next/router';
import { supportedLocales } from 'hooks/locale';

export interface HeadPropsType {
  title: string;
  description: string;
  image?: string
};

export const FLI_DOMAIN = 'freelook.now.sh';

const Head = (props: HeadPropsType) => {
    const router = useRouter();
    const url = `https://${FLI_DOMAIN}${router.asPath}`; 
    const title = props.title || '';
    const description = props.description || '';
    const image = props.image || '' ;   
    return (
        <NextHead>
            <title>{title}</title>
            <link rel="icon" href="/static/favicon.ico" />
            <link rel="stylesheet" href="//cdn.jsdelivr.net/npm/semantic-ui@2.4.2/dist/semantic.min.css" />
            <link rel="canonical" href={`https://${FLI_DOMAIN}${buildUrl(router, {query: {locale: ''} })}`} />
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
            <meta name="viewport" content="width=device-width,initial-scale=1" />
            <meta name="google-site-verification" content="5TUCUwv0Gd1iR99AyKGk47oJnx4931mvYoNyTKM2MNM" />
            <meta name="msvalidate.01" content="36AC47E1042C4DBD8923DEEE0F9FC843" />
            <meta name="yandex-verification" content="aa19f081865997ad" />
            <meta name="description" content={description} />
            <meta property="og:url" content={url} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            {image ? <meta property="og:image" content={image} /> : null}
        </NextHead>
    );
}

export default Head;
