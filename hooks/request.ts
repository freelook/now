import _ from 'lodash';
import fetch from 'isomorphic-unfetch';
import objectHash from 'object-hash';

export const HEADERS = {
    json: 'application/json'
};

export const HTTP = {
    post: 'POST'
};

export const post = async (url:string, body:Object, options: {cache?: boolean|string} = {}) => {
    let result, key = '';
    const cache = _.get(options, 'cache', false);
    try {
        try {     
            if(cache) {
                key = objectHash({url, body});
                const cahcedResult = sessionStorage.getItem(key);
                if(cahcedResult) {
                    result = JSON.parse(cahcedResult);
                    return;
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
            if(cache && key) {
                sessionStorage.setItem(key, JSON.stringify(result));
            }
        } finally {}
    } finally {
        return result; 
    }
};