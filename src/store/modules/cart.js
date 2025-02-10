export default {
  namespaced: true,
  
  state: () => ({
    items: [],
    taxRate: 18,
    discountRate: 0
  }),

  getters: {
    cartItems: state => state.items,
    
    itemCount: state => state.items.reduce((total, item) => total + item.quantity, 0),
    
    subtotal: state => state.items.reduce((total, item) => 
      total + (Number(item.price) * item.quantity), 0
    ),
    
    tax: (state, getters) => getters.subtotal * (state.taxRate / 100),
    
    discount: (state, getters) => {
      const subtotalWithTax = getters.subtotal + getters.tax
      return subtotalWithTax * (state.discountRate / 100)
    },
    
    total: (state, getters) => getters.subtotal + getters.tax - getters.discount
  },

  mutations: {
    ADD_TO_CART(state, item) {
      const existingItem = state.items.find(i => 
        i.type === item.type && i.id === item.id
      )

      if (existingItem) {
        existingItem.quantity++
      } else {
        state.items.push(item)
      }
    },

    REMOVE_FROM_CART(state, { type, id }) {
      const index = state.items.findIndex(item => 
        item.type === type && item.id === id
      )
      if (index > -1) {
        state.items.splice(index, 1)
      }
    },

    INCREMENT_QUANTITY(state, { type, id }) {
      const item = state.items.find(i => i.type === type && i.id === id)
      if (item) {
        item.quantity++
      }
    },

    DECREMENT_QUANTITY(state, { type, id }) {
      const item = state.items.find(i => i.type === type && i.id === id)
      if (item && item.quantity > 1) {
        item.quantity--
      }
    },

    CLEAR_CART(state) {
      state.items = []
    },

    SET_TAX_RATE(state, rate) {
      state.taxRate = rate
    },

    SET_DISCOUNT_RATE(state, rate) {
      state.discountRate = rate
    }
  },

  actions: {
    addToCart({ commit }, item) {
      commit('ADD_TO_CART', item)
    },

    removeFromCart({ commit }, item) {
      commit('REMOVE_FROM_CART', item)
    },

    incrementQuantity({ commit }, item) {
      commit('INCREMENT_QUANTITY', item)
    },

    decrementQuantity({ commit }, item) {
      commit('DECREMENT_QUANTITY', item)
    },

    clearCart({ commit }) {
      commit('CLEAR_CART')
    },

    setTaxRate({ commit }, rate) {
      commit('SET_TAX_RATE', rate)
    },

    setDiscountRate({ commit }, rate) {
      commit('SET_DISCOUNT_RATE', rate)
    }
  }
} 