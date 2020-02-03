import _ from 'lodash';
import fetch from 'isomorphic-unfetch';
import objectHash from 'object-hash';

export const FLI_CACHE_KEY = 'fli_cache';
export const HEADERS = {
    json: 'application/json'
};

export const HTTP = {
    post: 'POST'
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

export const post = async (url:string, body:Object, options: {cache?: boolean|string} = {}) => {
    let result, key = '';
    const cache = _.get(options, 'cache', false);
    try {
        try {     
            if(cache && sessionStorage) {
                _.delay(() => cleanCache(), 1000);
                key = objectHash({url, body});
                const cahcedResult = sessionStorage.getItem(key);
                if(cahcedResult) {
                    const parsedResult = JSON.parse(cahcedResult);
                    if(_.get(parsedResult, FLI_CACHE_KEY, 0) < Date.now()) {
                        sessionStorage.removeItem(key);
                    } else {
                        result = parsedResult;
                        return;
                    }
                }
            }
        } finally {}
        result =  await (await fetch(url, {
            method: HTTP.post,
            headers: {
                'Accept': HEADERS.json,
                'Content-Type': HEADERS.json
            },
            body: JSON.stringify(body)
        })).json();
        try {
            if(cache && sessionStorage && key) {
                result[FLI_CACHE_KEY] = Date.now() + 3600000; // one hour
                sessionStorage.setItem(key, JSON.stringify(result));
            }
        } finally {}
    } finally {
        return result; 
    }
};
