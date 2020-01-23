require("dotenv").config();

// !!! Do not export env for client side
module.exports = {
    env: {
        WEBTASK_TOKEN: '',
        WEBTASK_ENDPOINT: ''
    }
};
