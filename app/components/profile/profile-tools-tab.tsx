"use client";

import Button from "@/app/components/elements/Button";
import type { Account, CalendarConnection } from "@/app/models/accounts";
import clsx from "clsx";
import { CalendarDays, CheckCircle2, Link2, XCircle } from "lucide-react";

interface ConnectionStatus {
	isLoading: boolean;
	connection: CalendarConnection | null | undefined;
}

interface ProfileToolsTabProps {
	account?: Account;
	onConnect?: () => void;
	onDisconnect?: () => void;
	connectionStatus?: ConnectionStatus;
}

function GoogleCalendarCard({
	isConnected,
	email,
	isLoading,
	onConnect,
	onDisconnect,
}: {
	isConnected: boolean;
	email?: string | null;
	isLoading?: boolean;
	onConnect: () => void;
	onDisconnect: () => void;
}) {
	return (
		<div className="rounded-lg border border-neutral-200 bg-white">
			<div className="flex items-start gap-4 p-4">
				<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary-50">
					<CalendarDays className="h-6 w-6 text-primary-500" />
				</div>
				<div className="flex-1">
					<div className="flex items-center justify-between gap-3">
						<div className="flex items-center gap-3">
							<h3 className="font-medium text-neutral-900">Google Calendar</h3>
							<div
								className={clsx(
									"inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
									isConnected ? "bg-success-50 text-success-600" : "bg-neutral-100 text-neutral-600",
								)}
							>
								{isConnected ? (
									<>
										<CheckCircle2 className="h-3.5 w-3.5" />
										<span>Connected</span>
									</>
								) : (
									<>
										<XCircle className="h-3.5 w-3.5" />
										<span>Not connected</span>
									</>
								)}
							</div>
						</div>
					</div>
					<p className="mt-1 text-sm text-neutral-600">
						Sync your appointments with Google Calendar to automatically track sessions and manage your schedule across
						platforms.
					</p>

					{isConnected && email && (
						<div className="mt-3 flex items-center gap-2 text-sm text-neutral-700">
							<Link2 className="h-4 w-4 text-neutral-400" />
							<span className="font-medium">{email}</span>
						</div>
					)}

					<div className="mt-4 flex items-center gap-3">
						{isConnected ? (
							<Button
								type="button"
								secondary
								onClick={onDisconnect}
								disabled={isLoading}
								isProcessing={isLoading}
								label="Disconnect Google Calendar"
							/>
						) : (
							<Button
								type="button"
								onClick={onConnect}
								disabled={isLoading}
								isProcessing={isLoading}
								label="Connect Google Calendar"
								className="min-w-[180px]"
							/>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}

export function ProfileToolsTab({ account, onConnect, onDisconnect, connectionStatus }: ProfileToolsTabProps) {
	// Only fall back to account data when connectionStatus is undefined (not yet fetched)
	// If connectionStatus.connection is explicitly null, use that (not connected)
	const googleCalendar = connectionStatus === undefined ? account?.tools?.google_calendar : connectionStatus.connection;
	const isConnected = googleCalendar?.connected ?? false;
	const connectedEmail = googleCalendar?.email;
	const isLoading = connectionStatus?.isLoading ?? false;

	const handleConnect = () => {
		onConnect?.();
	};

	const handleDisconnect = () => {
		onDisconnect?.();
	};

	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-lg font-semibold text-neutral-900">Tools & Integrations</h2>
				<p className="mt-1 text-sm text-neutral-600">
					Manage external tools and integrations to enhance your workflow.
				</p>
			</div>

			<div className="space-y-4">
				<h3 className="text-sm font-medium text-neutral-800">Available Integrations</h3>
				<GoogleCalendarCard
					isConnected={isConnected}
					email={connectedEmail}
					isLoading={isLoading}
					onConnect={handleConnect}
					onDisconnect={handleDisconnect}
				/>
			</div>
		</div>
	);
}
