import React from 'react';
import _ from 'lodash';
import * as route from 'hooks/route';

import News from 'functions/news';
import NewsSeo from 'functions/news/[seo]';
import Web from 'functions/web';
import WebImages from 'functions/web/images';
import WebSeo from 'functions/web/[seo]';
import Ecom from 'functions/ecom';
import EcomSeo from 'functions/ecom/[seo]';
import Deals from 'functions/ecom/deals';
import DealsSeo from 'functions/ecom/deals/[seo]';
import EcomItem from 'functions/ecom/it/[asin]';
import EcomItemSeo from 'functions/ecom/it/[asin]/[seo]';
import Feed from 'functions/feed/[token]';
import Meta from 'functions/meta/[token]';

const routes = {
    '/news': News,
    '/news/:seo': NewsSeo,
    '/web': Web,
    '/web/images': WebImages,
    '/web/:seo': WebSeo,
    '/ecom': Ecom,
    '/ecom/deals': Deals,
    '/ecom/deals/:seo': DealsSeo,
    '/ecom/:seo': EcomSeo,
    '/ecom/it/:asin': EcomItem,
    '/ecom/it/:asin/:seo': EcomItemSeo,
    '/feed/:token': Feed,
    '/meta/:token': Meta
};

export const config = { amp: 'hybrid' };

const All = (_ctx:any) => {
    const [func, ctx] = route.resolve(_ctx)(routes);
    return func(ctx);
};

All.getInitialProps = (_ctx:any) => {
    const [func, ctx] = route.resolve(_ctx)(routes);
    return _.isFunction(func.getInitialProps) ? func.getInitialProps(ctx) : {};
};

export default All;
