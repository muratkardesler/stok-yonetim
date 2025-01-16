import { createStore } from 'vuex';
import stock from './modules/stock';

export default createStore({
    modules: {
        stock
    }
}); 