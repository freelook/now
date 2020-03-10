import _ from 'lodash';
import { NextPageContext } from 'next';
import { setCookie, parseCookies } from 'nookies'
import * as render from 'hooks/render';
import * as request from 'hooks/request';
import * as route from 'hooks/route';
import { redirect, buildUrl } from 'hooks/route';

export const localeDelimiter = '.';
export const EN = 'en';
export const ES = 'es';
export const FR = 'fr';
export const IT = 'it';
export const DE = 'de';
export const PL = 'pl';
export const UK = 'uk';
export const RU = 'ru';
export const defaultLocale = EN;
export const defaultGeo = 'us';
export const supportedLocales = [EN, ES, FR, IT, DE, PL, UK, RU];
export const lng = [
  { code: EN, text: 'English' },
  { code: ES, text: 'Español' },
  { code: FR, text: 'Français' },
  { code: IT, text: 'Italiano' },
  { code: DE, text: 'Deutsch' },
  { code: PL, text: 'Polski' },
  { code: UK, text: 'Українська' },
  { code: RU, text: 'Русский' }, 
];
export const geo = [
  { code: undefined, text: 'Global' },
  { code: 'au', text: 'Australia' },
  { code: 'ca', text: 'Canada' },
  { code: defaultGeo, text: 'United States' },
  { code: 'gb', text: 'United Kingdom' },
  { code: 'mx', text: 'Mexico' },
  { code: 'es', text: 'Spain' },
  { code: 'fr', text: 'France' },
  { code: 'it', text: 'Italy' },
  { code: 'de', text: 'Germany' },
  { code: 'pl', text: 'Poland' },
  { code: 'ua', text: 'Ukraine' },
  { code: 'ru', text: 'Russia' },
];
export const i18nPath = 'i18n';

const getCookieLocale = (ctx:NextPageContext) => {
    return _.get(parseCookies(ctx), 'locale', '');
}
const getRouteLocale = (ctx:NextPageContext) => {
    return route.query(ctx).locale;
};
export const getLocale = (ctx:NextPageContext) => {
    return getRouteLocale(ctx) || getCookieLocale(ctx) || defaultLocale;
};
export const splitLocale = (ctx:NextPageContext|string) => {
    let locale = _.isString(ctx) ? ctx : getLocale(ctx);
    return locale.split(localeDelimiter);
};
export const getLng = (ctx:NextPageContext|string) => {
    return splitLocale(ctx)[0];
};
export const getGeo = (ctx:NextPageContext|string) => {
    return splitLocale(ctx)[1];
};
const needToSet = (ctx:NextPageContext) => {
    return !!getRouteLocale(ctx) || !getCookieLocale(ctx);
};
const isSupported = (locale:string, list:string[] = supportedLocales ) => {
    let [l, g] = splitLocale(locale);
    return _.includes(list, l) && (g ? _.some(geo, (v) => v.code === g ) : true);
}

export const useLocale =(ctx:NextPageContext, list:string[] = supportedLocales ) => {
  let locale = getLocale(ctx);
  if(needToSet(ctx)) {
    if(!isSupported(locale, list)) {
        return redirect(ctx).to(buildUrl(ctx, {query: { locale: defaultLocale} }) as string);
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
    const locale = getLng(ctx);
    let t = {};
    try {
        if(render.isSSR(ctx)) {
            t = importTranslation(locale);
        } else {
            t = await request.post(`/api/${i18nPath}/${locale}`, {}, {cache: true});
        }
    } catch (e) {
        console.log('No i18n for locale:', locale);
    } finally {
        return t;
    }
};