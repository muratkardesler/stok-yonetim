import { createStore } from 'vuex';
import auth from './modules/auth';
import stock from './modules/stock';
import product from './modules/product';
import sales from './modules/sales';
import customer from './modules/customer';

export default createStore({
    modules: {
        auth,
        stock,
        product,
        sales,
        customer
    }
}); 