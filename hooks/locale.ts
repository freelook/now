import _ from 'lodash';
import {useEffect, useState} from 'react';
import { NextPageContext } from 'next';
import { useRouter } from 'next/router';
import fetch from 'isomorphic-unfetch';
import { setCookie, parseCookies } from 'nookies'
import * as render from 'hooks/render';
import { redirect, buildUrl } from 'hooks/route';

export const EN = 'en';
export const ES = 'es';
export const DE = 'de';
export const defaultLocale = EN;
export const supportedLocales = [EN, ES, DE];
export const i18nPath = 'i18n';

const getCookieLocale = (ctx:NextPageContext) => {
    return _.get(parseCookies(ctx), 'locale', '');
}
const getRouteLocale = (ctx:NextPageContext) => {
    return render.qs(ctx).locale;
};
export const getLocale = (ctx:NextPageContext) => {
    return getRouteLocale(ctx) || getCookieLocale(ctx) || defaultLocale;
};
const needToSet = (ctx:NextPageContext) => {
    return !!getRouteLocale(ctx) || !getCookieLocale(ctx);
};
const isSupported = (locale:string, list:string[] = supportedLocales ) => {
    return _.includes(list, locale);
}

export const useLocale =(ctx:NextPageContext, list:string[] = supportedLocales ) => {
  let locale = getLocale(ctx);
  if(needToSet(ctx)) {
    if(!isSupported(locale, list)) {
        return redirect(ctx).to(buildUrl(ctx, {query: { locale: defaultLocale} }));
    }
    setCookie(ctx, 'locale', locale, {});
  }
  return locale;
};

export const importTranslation = async (locale: string) => {
    let t = {};
    try {
        t = (await import(`../${i18nPath}/${locale}.json`)).default || {};
    } finally {
        return t;
    }
};

export const useTranslation = async (ctx:NextPageContext) => {
    const locale = getLocale(ctx);
    let t = {};
    try {
        if(render.isSSR(ctx)) {
            t = importTranslation(locale);
        } else {
            t = await (await fetch(`/api/${i18nPath}/${locale}`)).json();
        }
    } catch (e) {
        console.log('No i18n for locale:', locale);
    } finally {
        return t;
    }
};