import _ from 'lodash';
import fetch from 'isomorphic-unfetch';
import fetchJsonp from 'fetch-jsonp';
import objectHash from 'object-hash';

export const FLI_CACHE_KEY = 'fli_cache';
export const FLI_CACHE_RESULT_KEY = 'fli_cache_result';
export const HEADERS = {
    json: 'application/json'
};

export const HTTP = {
    post: 'POST',
    get: 'GET',
    jsonp: 'JSONP'
};

export const cleanCache = () => {
try {
  if(sessionStorage) {
    const now  = Date.now();
    _.chain(sessionStorage).keys().each((key) => {
        const item = sessionStorage.getItem(key);
        if(item) {
            if(_.get(JSON.parse(item), FLI_CACHE_KEY, 0) < now) {
                sessionStorage.removeItem(key);
            }
        }
    }).value();
  }
} finally {}
};

const _fetch = async (params: {
    url:string; 
    method: string; 
    body?:Object; 
    options: {cache?: boolean|string, jsonpCallback?: string};
}) => {
    let result, key = '';
    const cache = _.get(params.options, 'cache', false);
    try {
        try {     
            if(cache && sessionStorage) {
                _.delay(() => cleanCache(), 1000);
                key = objectHash({url: params.url, body: params.body});
                const cachedResult = sessionStorage.getItem(key);
                if(cachedResult) {
                    const parsedResult = JSON.parse(cachedResult);
                    if(_.get(parsedResult, FLI_CACHE_KEY, 0) < Date.now()) {
                        sessionStorage.removeItem(key);
                    } else {
                        result = parsedResult;
                        return;
                    }
                }
            }
        } finally {}
        result = _.isEqual(params.method, HTTP.jsonp) ? 
        await (await fetchJsonp(params.url, {
            jsonpCallbackFunction: _.get(params.options, 'jsonpCallback')
        })).json()
        : 
        await (await fetch(params.url, {
            method: params.method,
            headers: {
                'Accept': HEADERS.json,
                'Content-Type': HEADERS.json
            },
            body: params.body ? JSON.stringify(params.body) : null
        })).json();
        try {
            if(cache && sessionStorage && key) {
                if(_.isArray(result)) {
                    result = {[FLI_CACHE_RESULT_KEY]: result};
                }
                result[FLI_CACHE_KEY] = Date.now() + 3600000; // one hour
                sessionStorage.setItem(key, JSON.stringify(result));
            }
        } finally {}
    } finally {
        return _.get(result, FLI_CACHE_RESULT_KEY, result); 
    }
};

export const post = async (url:string, body:Object, options: {cache?: boolean|string} = {}) => {
    return _fetch({
        method: HTTP.post, url, body, options
    });
};

export const get = async (url:string, options: {cache?: boolean|string} = {}) => {
    return _fetch({
        method: HTTP.get, url, options
    });
};

export const jsonp = async (url:string, options: {cache?: boolean|string, jsonpCallback?: string} = {}) => {
    return _fetch({
        method: HTTP.jsonp, url, options
    });
};
