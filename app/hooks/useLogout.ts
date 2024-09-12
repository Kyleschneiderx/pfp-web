import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

export const useLogout = () => {
  const router = useRouter();

  const logout = () => {
    Cookies.remove('token');
    router.replace('/login');
    window.history.pushState(null, "", "/login");
    window.location.reload();
  };

  return logout;
};