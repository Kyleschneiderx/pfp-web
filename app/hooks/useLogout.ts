import Cookies from 'js-cookie';

export const useLogout = () => {

  const logout = () => {
    Cookies.remove('token');
    window.location.replace("/login");
  };

  return logout;
};