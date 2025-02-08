<template>
  <div class="dashboard-layout">
    <main class="main-content">
      <div class="min-h-screen bg-gray-50 p-4 sm:p-6">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Stok Yönetimi</h1>
            <p class="mt-1 text-gray-600">Stok yönetimi işlemlerinizi buradan gerçekleştirebilirsiniz</p>
          </div>
        </div>

        <!-- Navigation -->
        <div class="bg-white rounded-lg shadow mb-6">
          <nav class="flex flex-col sm:flex-row">
            <router-link 
              to="/stok/urunler"
              class="px-6 py-3 text-gray-600 hover:text-indigo-600 hover:bg-gray-50 border-b sm:border-b-0 sm:border-r border-gray-200 flex items-center space-x-2"
              active-class="text-indigo-600 bg-indigo-50"
            >
              <i class="fas fa-box"></i>
              <span>Ürünler</span>
            </router-link>
            
            <router-link 
              to="/stok/kategoriler"
              class="px-6 py-3 text-gray-600 hover:text-indigo-600 hover:bg-gray-50 border-b sm:border-b-0 sm:border-r border-gray-200 flex items-center space-x-2"
              active-class="text-indigo-600 bg-indigo-50"
            >
              <i class="fas fa-folder-tree"></i>
              <span>Kategoriler</span>
            </router-link>
            
            <router-link 
              to="/stok/paketler"
              class="px-6 py-3 text-gray-600 hover:text-indigo-600 hover:bg-gray-50 border-b sm:border-b-0 sm:border-r border-gray-200 flex items-center space-x-2"
              active-class="text-indigo-600 bg-indigo-50"
            >
              <i class="fas fa-box-open"></i>
              <span>Paketler</span>
            </router-link>
            
            <router-link 
              to="/stok/urun-medya"
              class="px-6 py-3 text-gray-600 hover:text-indigo-600 hover:bg-gray-50 flex items-center space-x-2"
              active-class="text-indigo-600 bg-indigo-50"
            >
              <i class="fas fa-images"></i>
              <span>Ürün Medya</span>
            </router-link>
          </nav>
        </div>

        <!-- Router View for Sub-pages -->
        <router-view></router-view>
      </div>
    </main>
  </div>
</template>

<script>
export default {
  name: 'Stock'
}
</script>

<style scoped>
.router-link-active {
  @apply text-indigo-600 bg-indigo-50;
}
</style> 