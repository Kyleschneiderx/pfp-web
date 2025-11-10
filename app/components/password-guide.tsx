import clsx from "clsx";
import { Circle, CircleCheck } from "lucide-react";
import { useEffect, useState } from "react";

export default function PasswordGuide({ password, className }: { password?: string; className?: string }) {
	const [hasMinChar, setHasMinChar] = useState(false);
	const [hasCases, setHasCases] = useState(false);

	useEffect(() => {
		if (!password) {
			resetProgress();
			return;
		}

		setHasMinChar(password.length >= 8);

		const hasLowerCase = /[a-z]/.test(password);
		const hasUpperCase = /[A-Z]/.test(password);
		const hasNumber = /[0-9]/.test(password);
		const hasSpecialChar = /[^a-zA-Z0-9]/.test(password);

		setHasCases(hasLowerCase && hasUpperCase && hasNumber && hasSpecialChar);
	}, [password]);

	const resetProgress = () => {
		setHasCases(false);
		setHasMinChar(false);
	};

	return (
		<div className={className}>
			<p className="text-xs">Your password must contain</p>
			<div className="flex items-center">
				{hasMinChar ? (
					<CircleCheck size={19} fill="green" stroke="white" className="-ml-[2px] mr-1" />
				) : (
					<Circle size={16} className="text-neutral-400 mr-1" />
				)}
				<p className={clsx("text-sm", hasMinChar && "text-success-600")}>At least 8 characters</p>
			</div>
			<div className="flex items-start">
				{hasCases ? (
					<CircleCheck size={19} fill="green" stroke="white" className="-ml-[2px] mr-1" />
				) : (
					<Circle size={16} className="text-neutral-400 mr-1" />
				)}
				<p className={clsx("text-sm w-[350px]", hasCases && "text-success-600")}>
					At least 8 characters and contains at least 1 number, special character, lower case and upper case.
				</p>
			</div>
		</div>
	);
}
