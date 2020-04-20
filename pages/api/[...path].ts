import React from 'react';
import _ from 'lodash';
import * as route from 'hooks/route';
import { NextApiRequest, NextApiResponse } from 'next';

import DateApi from 'functions/api/date';
import I18nLocaleApi from 'functions/api/i18n/[locale]';
import MetaImgApi from 'functions/api/meta/img/[token]';
import WebtaskApi from 'functions/api/webtask/[name]';
import EcomDealsXml from 'functions/api/ecom/deals.xml';
import EcomSitemapXml from 'functions/api/ecom/sitemap.xml';

const routes = {
    '/date': DateApi,
    '/i18n/:locale': I18nLocaleApi, 
    '/meta/img/:token': MetaImgApi,
    '/webtask/:name': WebtaskApi,
    '/ecom/deals.xml': EcomDealsXml,
    '/ecom/sitemap.xml': EcomSitemapXml
};

const All = (_req:NextApiRequest, _res:NextApiResponse) => {
    const [func, ctx] = route.resolve({query: _req.query})(routes);
    _req.query = ctx.query;
    return func(_req, _res);
};

export default All;