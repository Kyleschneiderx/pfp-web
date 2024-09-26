import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

export const useLogout = () => {
  const router = useRouter();

  const logout = () => {
    Cookies.remove('token');
    window.location.replace("/login");
  };

  return logout;
};