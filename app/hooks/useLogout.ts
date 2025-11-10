import Cookies from "js-cookie";

export const useLogout = () => {
	const logout = () => {
		Cookies.remove("token");
		Cookies.remove("user_email");
		Cookies.remove("user_name");
		Cookies.remove("token_expiration");
		localStorage.removeItem("user");
		localStorage.removeItem("permissions");
		window.location.replace("/login");
	};

	return logout;
};
