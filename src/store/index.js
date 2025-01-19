import { createStore } from 'vuex';
import auth from './modules/auth';
import stock from './modules/stock';
import product from './modules/product';

export default createStore({
    modules: {
        auth,
        stock,
        product
    }
}); 