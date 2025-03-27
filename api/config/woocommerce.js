const WooCommerceRestApi = require('@woocommerce/woocommerce-rest-api').default;

const wooConfig = {
    url: process.env.WOOCOMMERCE_URL,
    consumerKey: process.env.WOOCOMMERCE_CONSUMER_KEY,
    consumerSecret: process.env.WOOCOMMERCE_CONSUMER_SECRET,
    version: 'wc/v3'
};

const WooCommerce = new WooCommerceRestApi(wooConfig);

module.exports = WooCommerce; 