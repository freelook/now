import _ from 'lodash';
import {useEffect, useState} from 'react';
import { NextPageContext } from 'next';
import { useRouter } from 'next/router';
import fetch from 'unfetch';
import path from 'path';

const EN = 'en';
const DE = 'de';
const defaultLocale = EN;
const supportedLocales = [EN, DE];
const i18nPath = 'i18n';

const getLocale = (ctx:NextPageContext) => {
    let l = _.get(ctx, 'url.query.locale', _.get(ctx, 'query.locale'));
    return _.includes(supportedLocales, l) ? l : defaultLocale;
};

export const useLocale =(ctx:NextPageContext) => {
  return getLocale(ctx);
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
        if(ctx.req) {
            t = importTranslation(locale);
        } else {
            t = await(await fetch(`/api/${i18nPath}/${locale}`)).json();
        }
    } catch (e) {
        console.log('No i18n for locale:', locale);
    } finally {
        return t;
    }
};