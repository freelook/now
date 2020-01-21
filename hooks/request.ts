import fetch from 'isomorphic-unfetch';

export const HEADERS = {
    json: 'application/json'
};

export const HTTP = {
    post: 'POST'
};

export const post = async (url:string, body:object) => {
    return (await fetch(url, {
        method: HTTP.post,
        headers: {
            'Accept': HEADERS.json,
            'Content-Type': HEADERS.json
        },
        body: JSON.stringify(body)
    })).json();
};