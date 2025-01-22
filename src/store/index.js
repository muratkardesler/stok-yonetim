import { createStore } from 'vuex';
import auth from './modules/auth';
import stock from './modules/stock';
import product from './modules/product';
import category from './modules/category';
import sales from './modules/sales';
import customer from './modules/customer';

export default createStore({
    modules: {
        auth,
        stock,
        product,
        category,
        sales,
        customer
    }
}); 