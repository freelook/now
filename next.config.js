require("dotenv").config();

module.exports = {
    env: [
        'WEBTASK_TOKEN',
        'WEBTASK_ENDPOINT'
    ].reduce((env, key) => { 
        env[key] = process.env[key];
        return env;
    }, {})
};
