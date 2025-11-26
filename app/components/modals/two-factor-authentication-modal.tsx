import Image from "next/image";
import Input from "../elements/Input";
import Button from "../elements/Button";
import { useState } from "react";

export default function TwoFactorAuthenticationModal({
	onClose,
	qrCode,
	secret,
	onVerify,
	isSetup,
}: {
	onClose: () => void;
	qrCode?: string;
	secret?: string;
	onVerify: (code: string, secret?: string) => void;
	isSetup?: boolean;
}) {
	const [twoFactorCode, setTwoFactorCode] = useState<string>("");
	return (
		<div className="flex flex-col space-y-5">
			{isSetup && (
				<div className="flex flex-col items-center justify-center space-y-3 w-full">
					<p className="self-start">
						Scan the QR code with your authenticator app or enter the secret key manually to your authenticator app
					</p>
					<Image src={qrCode!} alt="QR Code" width={200} height={200} className="h-auto" />
					<div className="flex flex-col items-center justify-center space-y-3 w-full bg-gray-300 p-5">
						<span className="text-gray-600">{secret}</span>
					</div>
				</div>
			)}

			<div className="flex flex-col space-y-3 w-full">
				<p>Enter the code from your authenticator app</p>
				<Input
					type="text"
					className="w-full"
					placeholder="Enter code"
					onChange={(e) => setTwoFactorCode(e.target.value)}
				/>
			</div>
			<div className="flex flex-row space-x-3 w-full">
				<Button label="Verify" type="button" className="w-full" onClick={() => onVerify(twoFactorCode, secret)} />
			</div>
		</div>
	);
}
