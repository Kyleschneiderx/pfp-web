import Button from "../elements/Button";
import { useModal } from "@/app/contexts/ModalContext";
import Input from "../elements/Input";
import { Controller, useForm } from "react-hook-form";
import { hasFieldError } from "@/app/lib/utils";
import { useState } from "react";
import type { ErrorModel } from "@/app/models/error_model";
import { useSnackBar } from "@/app/contexts/SnackBarContext";
import type { Account } from "@/app/models/accounts";
import { changePassword } from "@/app/services/client_side/accounts";
import PasswordGuide from "../password-guide";

export default function ChangePasswordModal({
	account,
	onClose,
	validateOldPassword = false,
}: { account: Account; onClose: (callback?: () => void) => void; validateOldPassword?: boolean }) {
	const modal = useModal();
	const [formError, setFormError] = useState<ErrorModel>();
	const { showSnackBar } = useSnackBar();

	const form = useForm<{ old_password?: string; password?: string; confirm_password?: string }>({
		defaultValues: {
			old_password: undefined,
			password: undefined,
			confirm_password: undefined,
		},
	});

	const handleSubmit = async (data: { old_password?: string; password?: string; confirm_password?: string }) => {
		let errMessage = { path: "", msg: "" };
		if (data.password !== data.confirm_password) {
			errMessage = { path: "confirm_password", msg: "The confirmation password doesn’t match the new password." };
			setFormError(errMessage);
			showSnackBar({ success: false, message: errMessage.msg });
			return;
		}

		try {
			await changePassword({ id: account.id, body: data });

			modal.closeAll();
		} catch (e) {
			const error = e as ErrorModel;

			setFormError(error);

			showSnackBar({ success: false, message: error.msg });
		}
	};

	const password = form.watch("password");

	return (
		<form onSubmit={form.handleSubmit(handleSubmit)} className="">
			<div className="flex-1 py-1">
				<div className="space-y-5 mt-5 max-h-[50%] min-h-[50%]  text-neutral-900">
					<p>Keep things secure, enter a new password for the account below.</p>
					<div className="flex flex-col space-y-3">
						{validateOldPassword && (
							<div className="flex flex-col space-y-1">
								<span className="font-semibold">Old Password</span>
								<Controller
									name="old_password"
									control={form.control}
									render={({ field }) => (
										<Input
											type="password"
											placeholder="Enter Old Password"
											value={field.value}
											invalid={hasFieldError("old_password", formError)}
											onChange={field.onChange}
											icon="Password"
										/>
									)}
								/>
							</div>
						)}

						<div className="flex flex-col space-y-1">
							<span className="font-semibold">New Password</span>
							<Controller
								name="password"
								control={form.control}
								render={({ field }) => (
									<Input
										type="password"
										placeholder="Enter New Password"
										value={field.value}
										invalid={hasFieldError("password", formError)}
										onChange={field.onChange}
										icon="Password"
									/>
								)}
							/>
						</div>

						<PasswordGuide password={password} />

						<div className="flex flex-col space-y-1">
							<span className="font-semibold">Confirm Password</span>
							<Controller
								name="confirm_password"
								control={form.control}
								render={({ field }) => (
									<Input
										type="password"
										placeholder="Enter Confirm Password"
										value={field.value}
										invalid={hasFieldError("confirm_password", formError)}
										onChange={field.onChange}
										required
										icon="Password"
									/>
								)}
							/>
						</div>
					</div>

					<div className="flex flex-row w-full justify-center items-center gap-y-3">
						<Button label="Cancel" secondary className="mr-3 w-full sm:w-auto" onClick={() => onClose()} />
						<Button label="Save" className="w-full sm:w-auto" type="submit" />
					</div>
				</div>
			</div>
		</form>
	);
}
