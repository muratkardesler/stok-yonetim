import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from '@/plugins/axios';
import { useToast } from 'vue-toastification';

const router = useRouter();
const toast = useToast();

const handleSubmit = async () => {
  try {
    loading.value = true;
    error.value = null;

    const response = await axios.post(`${process.env.VUE_APP_API_URL}/register?client_id=${process.env.VUE_APP_CLIENT_ID}&client_secret=${process.env.VUE_APP_CLIENT_SECRET}`, {
      Name: name.value,
      Description: description.value
    });

    console.log('Register response:', response.data);

    if (response.data && response.data.Status === "Success") {
      toast.success(response.data.Message || 'Kayıt başarılı! Giriş yapabilirsiniz.');
      // Login sayfasına yönlendir
      router.push('/login');
    } else {
      error.value = response.data.Message || 'Kayıt sırasında bir hata oluştu.';
      toast.error(error.value);
    }
  } catch (err) {
    console.error('Register error:', err);
    error.value = err.response?.data?.Message || 'Kayıt sırasında bir hata oluştu.';
    toast.error(error.value);
  } finally {
    loading.value = false;
  }
}; 