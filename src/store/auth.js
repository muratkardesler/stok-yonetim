import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'vue-router'

export default {
  namespaced: true,
  state: {
    user: null,
    profile: null,
    company: null,
    loading: false,
    error: null
  },
  mutations: {
    SET_USER(state, user) {
      state.user = user
    },
    SET_PROFILE(state, profile) {
      state.profile = profile
    },
    SET_COMPANY(state, company) {
      state.company = company
    },
    SET_LOADING(state, loading) {
      state.loading = loading
    },
    SET_ERROR(state, error) {
      state.error = error
    }
  },
  actions: {
    async register({ commit }, { email, password, firstName, lastName, companyName, companyEmail, phone, address }) {
      try {
        commit('SET_LOADING', true)
        commit('SET_ERROR', null)

        // 1. Kullanıcı kaydı
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password
        })

        if (authError) throw authError

        // 2. Şirket kaydı
        const { data: companyData, error: companyError } = await supabase
          .from('companies')
          .insert([
            {
              name: companyName,
              email: companyEmail,
              phone,
              address
            }
          ])
          .select()
          .single()

        if (companyError) throw companyError

        // 3. Kullanıcı profili oluşturma
        const { data: userData, error: userError } = await supabase
          .from('users')
          .insert([
            {
              id: authData.user.id,
              company_id: companyData.id,
              first_name: firstName,
              last_name: lastName,
              role: 'company_owner'
            }
          ])
          .select()
          .single()

        if (userError) throw userError

        commit('SET_USER', authData.user)
        commit('SET_PROFILE', userData)
        commit('SET_COMPANY', companyData)

        return { user: authData.user, profile: userData, company: companyData }
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async login({ commit }, { email, password }) {
      try {
        commit('SET_LOADING', true)
        commit('SET_ERROR', null)

        // Önce giriş yap
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password
        })

        if (authError) throw authError

        // Session'ı kontrol et
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) throw new Error('Oturum başlatılamadı')

        // JWT token'ı ayarla
        supabase.auth.setSession(session)

        // Kullanıcı profilini al
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('*, companies(*)')
          .eq('id', authData.user.id)
          .single()

        if (profileError) throw profileError

        commit('SET_USER', authData.user)
        commit('SET_PROFILE', profile)
        commit('SET_COMPANY', profile.companies)

        return { user: authData.user, profile, company: profile.companies }
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async logout({ commit }) {
      try {
        // Önce Supabase oturumunu sonlandır
        await supabase.auth.signOut()

        // Tüm yerel state'i temizle
        commit('SET_USER', null)
        commit('SET_PROFILE', null)
        commit('SET_COMPANY', null)
        commit('SET_LOADING', false)
        commit('SET_ERROR', null)

        // Local storage'ı temizle
        localStorage.clear()
        sessionStorage.clear()

        // Çerezleri temizle
        document.cookie.split(";").forEach(function(c) { 
          document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/")
        })

        // Sayfayı yeniden yükle ve ana sayfaya yönlendir
        setTimeout(() => {
          window.location.replace('/')
        }, 100)
      } catch (error) {
        console.error('Logout error:', error)
        commit('SET_ERROR', error.message)
      }
    },

    async checkAuth({ commit }) {
      try {
        commit('SET_LOADING', true)
        
        // Get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        if (sessionError) throw sessionError

        // If no session, clear state
        if (!session) {
          commit('SET_USER', null)
          commit('SET_PROFILE', null)
          commit('SET_COMPANY', null)
          return null
        }

        // Get user data
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError) throw userError

        if (user) {
          const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('*, companies(*)')
            .eq('id', user.id)
            .single()

          if (profileError) throw profileError

          commit('SET_USER', user)
          commit('SET_PROFILE', profile)
          commit('SET_COMPANY', profile.companies)

          return { user, profile, company: profile.companies }
        }
      } catch (error) {
        console.error('Auth check error:', error)
        commit('SET_ERROR', error.message)
        
        // Clear state on error
        commit('SET_USER', null)
        commit('SET_PROFILE', null)
        commit('SET_COMPANY', null)
      } finally {
        commit('SET_LOADING', false)
      }
    }
  },
  getters: {
    isAuthenticated: (state) => !!state.user,
    isAdmin: (state) => state.profile?.role === 'admin',
    isCompanyOwner: (state) => state.profile?.role === 'company_owner',
    isCompanyUser: (state) => state.profile?.role === 'company_user',
    userFullName: (state) => state.profile ? `${state.profile.first_name} ${state.profile.last_name}` : '',
    companyName: (state) => state.company?.name || ''
  }
} 