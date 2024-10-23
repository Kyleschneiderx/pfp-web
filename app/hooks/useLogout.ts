import Cookies from 'js-cookie';

export const useLogout = () => {

  const logout = () => {
    Cookies.remove('token');
    Cookies.remove('user_email');
    Cookies.remove('user_name');
    window.location.replace("/login");
  };

  return logout;
};