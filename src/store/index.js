import { createStore } from 'vuex';
import auth from './auth';
import stock from './modules/stock';
import product from './modules/product';
import sales from './modules/sales';
import customer from './modules/customer';
import cart from './modules/cart';

export default createStore({
    modules: {
        auth,
        stock,
        product,
        sales,
        customer,
        cart
    }
}); 