import { io, type SocketOptions } from "socket.io-client";
import Cookies from "js-cookie";

const socketClient = ({ namespace, ...rest }: { namespace: string } & SocketOptions) => {
	const token = Cookies.get("token");

	const socket = io(`${process.env.NEXT_PUBLIC_SOCKET_BASE_URL}/${namespace ?? ""}`, {
		transports: ["websocket"],
		autoConnect: false,
		reconnection: true,
		reconnectionAttempts: 10,
		reconnectionDelay: 1000,
		reconnectionDelayMax: 5000,
		...rest,
		extraHeaders: {
			Authorization: `Bearer ${token}`,
		},
		auth: {
			token: `Bearer ${token}`,
		},
	});

	const connect = () => {
		socket.connect();
	};

	const on = (event: string, callback: (data: any) => void) => {
		socket.off(event);
		socket.on(event, callback);
	};

	const off = (event: string) => {
		socket.off(event);
	};

	const emit = <T>(event: string, payload: T, ack?: (data: any) => void) => {
		socket.emit(event, payload, ack);
	};

	const disconnect = () => {
		socket.disconnect();
	};

	return {
		socket,
		connect,
		disconnect,
		on,
		off,
		emit,
	};
};

export default socketClient;
