import _ from 'lodash';
import url from 'url';
import btoa from 'btoa';
import atob from 'atob';
import { isSSR, APIContext } from 'hooks/render';
import Router, { NextRouter, useRouter } from 'next/router';
import { LinkProps } from 'next/link';
import { NextPageContext } from 'next';
import querystring, { ParsedUrlQuery } from 'querystring';

const MAX_PREV_HISTORY = 3;

export const query = (ctx?: NextPageContext) => {
    if(ctx) {
        return _.get(ctx, 'query', 
            _.get(ctx, 'url.query', {}
        ));
    }
    const router = useRouter();
    return _.get(router, 'query', {});
};

export const parseUrl = (router: NextRouter|NextPageContext) => {
    const parseQueryString = true;
    const asPath = _.get(router, 'asPath', '');
    return url.parse(asPath, parseQueryString) || {};
};

export const urlQuery = (router: NextRouter|NextPageContext) => {
    return parseUrl(router).query || {};
};

export const urlPath = (router: NextRouter|NextPageContext) => {
    return (parseUrl(router).pathname || '').replace(/ /mig, '%20');
};

export const ifPath = (router: NextRouter|NextPageContext) => ({ has : (path:string) => {
    return _.includes(urlPath(router), path);
}});

export const stringifyQuery = (query:ParsedUrlQuery) => {
    return querystring.stringify(query as querystring.ParsedUrlQueryInput);
};

export const mergeQuery = (q:ParsedUrlQuery = {}, params:Object)  => {
    return _.chain({}).assign(q, params).omitBy(_.isEmpty).value();
};

export const buildUrl = (
    router: NextRouter|NextPageContext, 
    params: {
        query?: ParsedUrlQuery,
        newQuery?: ParsedUrlQuery,
        pathname?: string;
        asObject?: boolean
}): LinkProps['href'] => {
    const pathname = _.get(params, 'pathname', urlPath(router));
    const query = params.newQuery || mergeQuery(urlQuery(router), params.query || {});
    if(params.asObject) {
        return { pathname, query };
    }
    const qs = stringifyQuery(query as ParsedUrlQuery);
    return `${pathname}${qs ? '?'.concat(qs) : ''}`;
};

export const redirect = (ctx: NextPageContext|APIContext) => ({ to: (url:string) => {
    console.log('redirect to: ', url);
    if (isSSR(ctx) && ctx.res) {
        ctx.res.writeHead(302, { Location: url });
        ctx.res.end();
    } else {
        Router.replace(url);
    }
}});

export const slug = (node:Object, path:string) => _.chain(node).get(path, '').trim()
.replace(/\/|&|%|\?/mig, '')
.replace(/(-|–)+/mig, ' ')
.replace(/( )+/mig, '-')
.value();

export const encode = (str:string) => {
    let token = '';
    try {
        token = btoa(str).replace(/\//mig, '+');
    } finally {}
    return token;
};
export const decode = (token:string) => {
    let str = '';
        try {
            str = atob(token.replace(/\+/mig, '/'));
    } finally {}
    return str;
};

export const open = (url:string) => {
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
};

export const replace = (url:string) => {
    window.location.href = url;
};

export const prev = (path?:string) => {
    const w = window as any;
    w.prev = w.prev || [];
    if(path) {
        if(w.prev.lenght > MAX_PREV_HISTORY) {
            w.prev.lenght = MAX_PREV_HISTORY;
        }
        w.prev.push(path);
    } 
    return w.prev;
};
