import axios from '@/plugins/axios';

const state = {
  orders: [],
  activeOrder: null,
  orderDetails: [],
  loading: false,
  error: null
};

const mutations = {
  SET_ORDERS(state, orders) {
    state.orders = orders || [];
  },
  SET_ACTIVE_ORDER(state, order) {
    state.activeOrder = order;
  },
  SET_ORDER_DETAILS(state, details) {
    state.orderDetails = details || [];
  },
  ADD_ORDER_DETAIL(state, detail) {
    state.orderDetails.push(detail);
  },
  UPDATE_ORDER_DETAIL(state, updatedDetail) {
    const index = state.orderDetails.findIndex(d => d.OrderDetailId === updatedDetail.OrderDetailId);
    if (index !== -1) {
      state.orderDetails.splice(index, 1, updatedDetail);
    }
  },
  SET_LOADING(state, loading) {
    state.loading = loading;
  },
  SET_ERROR(state, error) {
    state.error = error;
  },
  ADD_ORDER(state, order) {
    state.orders.unshift(order);
  },
  UPDATE_ORDER(state, updatedOrder) {
    const index = state.orders.findIndex(o => o.OrderId === updatedOrder.OrderId);
    if (index !== -1) {
      state.orders.splice(index, 1, updatedOrder);
    }
  },
  DELETE_ORDER(state, orderId) {
    state.orders = state.orders.filter(o => o.OrderId !== orderId);
    state.orderDetails = state.orderDetails.filter(d => d.OrderId !== orderId);
  },
  DELETE_ORDER_DETAIL(state, orderDetailId) {
    state.orderDetails = state.orderDetails.filter(d => d.OrderDetailId !== orderDetailId);
  }
};

const actions = {
  // Tüm siparişleri getir
  async fetchOrders({ commit }, companyId) {
    commit('SET_LOADING', true);
    try {
      console.log('Fetching orders for CompanyId:', companyId.toString());
      
      const response = await axios.get(`/orders?client_id=${process.env.VUE_APP_CLIENT_ID}&client_secret=${process.env.VUE_APP_CLIENT_SECRET}&CompanyId=${companyId.toString()}`);
      
      console.log('Orders response:', response.data);
      
      commit('SET_ORDERS', response.data || []);
      return response.data;
    } catch (error) {
      console.error('Error fetching orders:', error);
      console.error('Error response:', error.response?.data);
      commit('SET_ERROR', error.message);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  // Tek bir siparişi getir
  async fetchOrder({ commit }, { orderId }) {
    try {
      console.log('Fetching order:', orderId);
      
      const response = await axios.get(`/orders/${orderId}?client_id=${process.env.VUE_APP_CLIENT_ID}&client_secret=${process.env.VUE_APP_CLIENT_SECRET}`);
      
      console.log('Order response:', response.data);
      commit('SET_ACTIVE_ORDER', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  },

  // Sipariş detaylarını getir
  async fetchOrderDetails({ commit }, { orderId }) {
    try {
      console.log('Fetching order details for OrderId:', orderId);
      
      const response = await axios.get(`/orders/${orderId}/details?client_id=${process.env.VUE_APP_CLIENT_ID}&client_secret=${process.env.VUE_APP_CLIENT_SECRET}`);
      
      console.log('Order details response:', response.data);

      if (!response.data || !Array.isArray(response.data)) {
        console.error('Invalid response format:', response.data);
        return [];
      }

      // Backend'den gelen detayları sayısal değerlere dönüştür
      const formattedDetails = response.data.map(detail => ({
        ...detail,
        Quantity: Number(detail.Quantity || 0),
        UnitPrice: Number(detail.UnitPrice || 0),
        Discount: Number(detail.Discount || 0),
        Tax: Number(detail.Tax || 0)
      }));

      commit('SET_ORDER_DETAILS', formattedDetails);
      return formattedDetails;
    } catch (error) {
      console.error('Error fetching order details:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },

  // Siparişe ürün ekle
  async addOrderDetail({ commit }, { orderId, orderDetail }) {
    try {
      console.log('Adding order detail:', orderDetail);

      // Postman'deki gibi request body'yi hazırla
      const detailData = {
        ProductId: orderDetail.ProductId.toString(), // String olarak gönder
        Quantity: orderDetail.Quantity,
        UnitPrice: orderDetail.UnitPrice,
        Discount: orderDetail.Discount || 0,
        Tax: orderDetail.Tax || 0
      };

      console.log('Sending detail data:', detailData);

      // OrderId'yi direkt URL'de kullan
      const response = await axios.post(`/orders/${orderId}/details?client_id=${process.env.VUE_APP_CLIENT_ID}&client_secret=${process.env.VUE_APP_CLIENT_SECRET}`, detailData);

      console.log('Add order detail response:', response.data);

      if (response.data) {
        commit('ADD_ORDER_DETAIL', response.data);
        return {
          success: true,
          message: 'Ürün siparişe eklendi!',
          data: response.data
        };
      }
    } catch (error) {
      console.error('Error adding order detail:', error);
      throw error;
    }
  },

  // Sipariş detayını güncelle
  async updateOrderDetail({ commit }, { orderId, orderDetailId, orderDetail }) {
    try {
      console.log('Updating order detail:', orderDetail);

      const detailData = {
        ProductId: orderDetail.ProductId.toString(),
        Quantity: parseInt(orderDetail.Quantity),
        UnitPrice: parseFloat(orderDetail.UnitPrice),
        Discount: parseFloat(orderDetail.Discount || 0),
        Tax: parseFloat(orderDetail.Tax || 0)
      };

      const response = await axios.put(`/orders/${orderId}/details/${orderDetailId}?client_id=${process.env.VUE_APP_CLIENT_ID}&client_secret=${process.env.VUE_APP_CLIENT_SECRET}`, detailData);

      console.log('Update order detail response:', response.data);

      if (response.data) {
        commit('UPDATE_ORDER_DETAIL', response.data);
        return {
          success: true,
          message: 'Sipariş detayı güncellendi!'
        };
      }
    } catch (error) {
      console.error('Error updating order detail:', error);
      throw error;
    }
  },

  // Sipariş detayını sil
  async deleteOrderDetail({ commit }, { orderId, orderDetailId }) {
    try {
      console.log('Deleting order detail:', orderDetailId);

      const response = await axios.delete(`/orders/${orderId}/details/${orderDetailId}?client_id=${process.env.VUE_APP_CLIENT_ID}&client_secret=${process.env.VUE_APP_CLIENT_SECRET}`);

      console.log('Delete order detail response:', response.data);

      if (response.data) {
        // Silinen detayı state'den kaldır
        commit('DELETE_ORDER_DETAIL', orderDetailId);
        return {
          success: true,
          message: 'Sipariş detayı silindi!'
        };
      }
    } catch (error) {
      console.error('Error deleting order detail:', error);
      throw error;
    }
  },

  // Yeni sipariş oluştur
  async createOrder({ commit }, { order, companyId }) {
    try {
      const orderData = {
        ...order,
        OrderDate: new Date().toISOString()
      };

      console.log('Creating order with data:', orderData);
      
      const response = await axios.post(`/orders?client_id=${process.env.VUE_APP_CLIENT_ID}&client_secret=${process.env.VUE_APP_CLIENT_SECRET}`, orderData);
      
      console.log('Create order response:', response.data);
      
      // Başarılı yanıt kontrolü
      if (response.data && response.data.Status === "Success" && response.data.OrderId) {
        // Sipariş oluşturulduğunda stokları güncelle (Pending durumunda bile)
        if (order.cart && Array.isArray(order.cart)) {
          for (const item of order.cart) {
            try {
              // Ürün bilgisini al
              const productResponse = await axios.get(`/products/${item.ProductId}?client_id=${process.env.VUE_APP_CLIENT_ID}&client_secret=${process.env.VUE_APP_CLIENT_SECRET}`);
              const product = productResponse.data;
              
              // Yeni stok miktarını hesapla
              const newStock = product.StockQuantity - item.quantity;
              
              // Stok güncelleme
              await axios.put(`/products/${item.ProductId}?client_id=${process.env.VUE_APP_CLIENT_ID}&client_secret=${process.env.VUE_APP_CLIENT_SECRET}`, {
                ...product,
                StockQuantity: newStock
              });

              console.log(`Updated stock for product ${item.ProductId}: ${newStock}`);
            } catch (error) {
              console.error(`Error updating stock for product ${item.ProductId}:`, error);
              throw new Error(`Ürün stok güncellemesi başarısız: ${item.Name}`);
            }
          }
        }

        return {
          success: true,
          data: {
            ...orderData,
            OrderId: response.data.OrderId
          },
          message: response.data.Message
        };
      } else {
        throw new Error('Sipariş oluşturulamadı: ' + (response.data?.Message || 'Geçersiz yanıt'));
      }
    } catch (error) {
      console.error('Error creating order:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },

  // Siparişi güncelle
  async updateOrder({ commit }, { order, companyId }) {
    try {
      // Siparişi güncelle
      const updateData = {
        TotalAmount: order.TotalAmount || 0,
        Status: order.Status || 'Pending',
        PaymentMethod: order.PaymentMethod || 'Cash',
        Notes: order.Notes || ''
      };

      console.log('Updating order with data:', updateData);

      // Sipariş güncelleme isteği
      const response = await axios.put(`/orders/${order.OrderId}?client_id=${process.env.VUE_APP_CLIENT_ID}&client_secret=${process.env.VUE_APP_CLIENT_SECRET}`, updateData);

      console.log('Update order response:', response.data);

      if (response.data) {
        commit('UPDATE_ORDER', response.data);
        return {
          success: true,
          message: 'Sipariş başarıyla güncellendi!'
        };
      } else {
        throw new Error('Sipariş güncellenemedi');
      }
    } catch (error) {
      console.error('Error updating order:', error);
      throw error;
    }
  },

  // Siparişi sil
  async deleteOrder({ commit }, orderId) {
    try {
      console.log('Deleting order:', orderId);

      await axios.delete(`/orders/${orderId}?client_id=${process.env.VUE_APP_CLIENT_ID}&client_secret=${process.env.VUE_APP_CLIENT_SECRET}`);

      commit('DELETE_ORDER', orderId);
      return {
        success: true,
        message: 'Sipariş başarıyla silindi!'
      };
    } catch (error) {
      console.error('Error deleting order:', error);
      throw error;
    }
  }
};

const getters = {
  getOrders: state => state.orders,
  getActiveOrder: state => state.activeOrder,
  getOrderDetails: state => state.orderDetails,
  isLoading: state => state.loading,
  getError: state => state.error,
  
  // Toplam satış (sadece tamamlanan siparişler)
  getTotalSales: (state) => {
    return state.orders
      .filter(order => order.Status === 'Completed')
      .reduce((total, order) => total + order.TotalAmount, 0);
  },

  // Bugünkü satışlar (sadece tamamlanan siparişler)
  getTodaySales: (state) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return state.orders
      .filter(order => {
        const orderDate = new Date(order.OrderDate);
        orderDate.setHours(0, 0, 0, 0);
        return orderDate.getTime() === today.getTime() && order.Status === 'Completed';
      })
      .reduce((total, order) => total + order.TotalAmount, 0);
  },

  // Ortalama sipariş tutarı (son 30 gün, sadece tamamlanan siparişler)
  getAverageOrderAmount: (state) => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const completedOrders = state.orders.filter(order => {
      const orderDate = new Date(order.OrderDate);
      return orderDate >= thirtyDaysAgo && order.Status === 'Completed';
    });

    if (completedOrders.length === 0) return 0;
    
    const total = completedOrders.reduce((sum, order) => sum + order.TotalAmount, 0);
    return total / completedOrders.length;
  },

  // Sipariş durumuna göre filtreleme
  getOrdersByStatus: (state) => (status) => {
    return state.orders.filter(order => order.Status === status);
  },

  // Tarih aralığına göre filtreleme
  getOrdersByDateRange: (state) => (startDate, endDate) => {
    return state.orders.filter(order => {
      const orderDate = new Date(order.OrderDate);
      return orderDate >= startDate && orderDate <= endDate;
    });
  }
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}; 