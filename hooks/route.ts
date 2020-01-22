import _ from 'lodash';
import { isSSR } from 'hooks/render';
import Router, { NextRouter } from 'next/router';
import { NextPageContext } from 'next';
import querystring, { ParsedUrlQuery } from 'querystring';

export const mergeQuery = (q:ParsedUrlQuery = {}, params:Object) => {
    return _.chain({}).assign(q, params).omitBy(_.isEmpty).value();
}

export const buildUrl = (router:NextRouter|NextPageContext, params:{query?: ParsedUrlQuery}) => {
    return `${router.pathname}?${querystring.stringify(mergeQuery(
        _.get(router, 'query', {}), params.query || {}
    ))}`
};

export const redirect = (ctx: NextPageContext) => ({ to: (url:string) => {
    console.log('redirect to: ', url);
    if (isSSR(ctx) && ctx.res) {
        ctx.res.writeHead(302, { Location: url });
        ctx.res.end();
    } else {
        Router.replace(url);
    }
}});
