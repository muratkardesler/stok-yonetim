<template>
    <div>
      <h1>Üyelik Formu</h1>
      <form @submit.prevent="submitForm">
        <div>
          <label>Ad Soyad</label>
          <input v-model="form.name" required />
        </div>
        <div>
          <label>Firma / Şahıs Adı</label>
          <input v-model="form.company" required />
        </div>
        <div>
          <label>Telefon</label>
          <input 
            v-model="form.phone" 
            type="tel" 
            required 
            placeholder="5321234567"
          />
          <small class="helper-text">Başında 0 olmadan 10 haneli numara giriniz</small>
        </div>
        <div>
          <label>E-posta</label>
          <input v-model="form.email" type="email" required />
        </div>
        <div>
          <label>Şifre</label>
          <input v-model="form.password" type="password" minlength="6" required />
        </div>
        <button type="submit" :disabled="loading">
          {{ loading ? 'Kaydediliyor...' : 'Üyeliğe Devam Et' }}
        </button>
        
        <div v-if="error" class="error">
          {{ error }}
        </div>
      </form>
    </div>
  </template>
  
  <script>
  export default {
    name: "Signup",
    data() {
      return {
        form: {
          name: "",
          company: "",
          phone: "",
          email: "",
          password: "",
        },
        loading: false,
        error: null
      };
    },
    methods: {
      validateForm() {
        this.error = null;
        
        if (this.form.password.length < 6) {
          this.error = "Şifre en az 6 karakter olmalıdır";
          return false;
        }
        
        const phoneRegex = /^[0-9]{10,11}$/;
        const cleanPhone = this.form.phone.replace(/[^0-9]/g, '');
        
        if (!phoneRegex.test(cleanPhone)) {
          this.error = "Telefon numarası 10 veya 11 haneli olmalıdır (Örn: 5321234567 veya 05321234567)";
          return false;
        }
        this.form.phone = cleanPhone;
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(this.form.email)) {
          this.error = "Geçerli bir e-posta adresi giriniz";
          return false;
        }
        
        if (!this.form.name || !this.form.company || !this.form.phone || !this.form.email || !this.form.password) {
          this.error = "Lütfen tüm alanları doldurunuz";
          return false;
        }
        
        return true;
      },
      
      async submitForm() {
        if (!this.validateForm()) return;
        
        try {
          this.loading = true;
          console.log("Gönderilecek veri:", {
            username: this.form.name,
            email: this.form.email,
            passwordHash: this.form.password,
            company: this.form.company,
            phone: this.form.phone
          });
          
          const response = await fetch('http://localhost:3000/api/createUser', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({
              username: this.form.name,
              email: this.form.email,
              passwordHash: this.form.password,
              company: this.form.company,
              phone: this.form.phone
            })
          });

          const data = await response.json();
          console.log("Backend yanıtı:", data);

          if (!response.ok) {
            throw new Error(data.message || 'Bir hata oluştu');
          }

          alert('Üyelik başarıyla oluşturuldu!');
          this.$router.push('/');

        } catch (err) {
          console.error('Hata detayı:', err);
          this.error = err.message;
        } finally {
          this.loading = false;
        }
      }
    }
  };
  </script>
  
  <style>
  form {
    display: flex;
    flex-direction: column;
    max-width: 400px;
    margin: 0 auto;
  }
  label {
    margin-top: 10px;
  }
  input {
    padding: 5px;
    margin-bottom: 10px;
  }
  button {
    background-color: #ff5722;
    color: white;
    padding: 10px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }
  </style>

  <style scoped>
  /* Mevcut stiller aynen kalacak */
  .error {
    color: red;
    margin-top: 10px;
  }

  button:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }

  .helper-text {
    font-size: 0.8em;
    color: #666;
    margin-top: -8px;
    margin-bottom: 10px;
    display: block;
  }
  </style>