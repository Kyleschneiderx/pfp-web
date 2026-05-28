"use client";

import Button from "@/app/components/elements/Button";
import Input from "@/app/components/elements/Input";
import { useSnackBar } from "@/app/contexts/SnackBarContext";
import { type NominatimSearchResult, nominatimResultToAddress, searchNominatim } from "@/app/lib/nominatim";
import type { Address, AdminFormSchema, ProviderFormSchema } from "@/app/models/accounts";
import clsx from "clsx";
import { ChevronDownIcon, PlusIcon, XIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { type Control, Controller, type ControllerRenderProps, useWatch } from "react-hook-form";
import { useDebouncedCallback } from "use-debounce";

type ProfileFormSchema = ProviderFormSchema & AdminFormSchema;

const EMPTY_ADDRESS: Address = {
	line1: "",
	line2: "",
	city: "",
	state: "",
	postal_code: "",
	country: "",
};

type AddressSearchState = {
	query: string;
	results: NominatimSearchResult[];
	isLoading: boolean;
	isOpen: boolean;
};

const defaultSearchState = (): AddressSearchState => ({
	query: "",
	results: [],
	isLoading: false,
	isOpen: false,
});

function getAddressTitle(index: number): string {
	return index === 0 ? "Primary address" : `Address ${index + 1}`;
}

function getGeoValue(value?: number): string {
	return value != null && Number.isFinite(value) ? value.toFixed(6) : "Unavailable";
}

function formatAddressSummary(address: Address): string {
	const cityState = [address.city, address.state].filter(Boolean).join(", ");
	const summaryParts = [address.line1, cityState, address.postal_code, address.country]
		.map((part) => part?.trim())
		.filter(Boolean);

	return summaryParts.length > 0 ? summaryParts.join(" • ") : "No address details yet";
}

function AddressCard({
	index,
	address,
	field,
	onRemove,
	onRemoveAddress,
	onSave,
	isSaving,
}: {
	index: number;
	address: Address;
	field: ControllerRenderProps<ProfileFormSchema, "addresses">;
	onRemove: () => void;
	onRemoveAddress?: () => void;
	onSave?: () => void;
	isSaving?: boolean;
}) {
	const { showSnackBar } = useSnackBar();
	const [searchState, setSearchState] = useState<AddressSearchState>(defaultSearchState);
	const [isExpanded, setIsExpanded] = useState(false);
	const panelId = address.id != null ? `address-panel-${address.id}` : `address-panel-${index}`;
	const toggleId = address.id != null ? `address-toggle-${address.id}` : `address-toggle-${index}`;
	const searchResultsId =
		address.id != null ? `address-search-results-${address.id}` : `address-search-results-${index}`;

	const updateAddress = (partial: Partial<Address>) => {
		const current = field.value ?? [];
		const next = [...current];
		next[index] = { ...next[index], ...partial };
		field.onChange(next);
	};

	const runSearch = useDebouncedCallback(async (query: string) => {
		if (!query.trim()) {
			setSearchState((prev) => ({
				...prev,
				results: [],
				isLoading: false,
				isOpen: false,
			}));
			return;
		}

		setSearchState((prev) => ({ ...prev, isLoading: true }));

		try {
			const results = await searchNominatim(query);
			setSearchState((prev) => ({
				...prev,
				results,
				isLoading: false,
				isOpen: results.length > 0,
			}));
		} catch {
			setSearchState((prev) => ({
				...prev,
				results: [],
				isLoading: false,
				isOpen: false,
			}));
			showSnackBar({
				message: "Could not search addresses. Please try again.",
				success: false,
			});
		}
	}, 400);

	const handleSearchChange = (value: string) => {
		setSearchState((prev) => ({
			...prev,
			query: value,
			isOpen: value.trim().length > 0,
		}));
		runSearch(value);
	};

	const handleSelectResult = (result: NominatimSearchResult) => {
		updateAddress(nominatimResultToAddress(result));
		setSearchState({
			...defaultSearchState(),
			query: result.display_name,
		});
	};

	const hasCoordinates =
		address.latitude != null &&
		address.longitude != null &&
		Number.isFinite(address.latitude) &&
		Number.isFinite(address.longitude);
	const searchStatusMessage = searchState.isLoading
		? "Searching for addresses."
		: searchState.query.trim()
			? searchState.results.length > 0
				? `${searchState.results.length} address result${searchState.results.length === 1 ? "" : "s"} available.`
				: "No address results found."
			: "";

	return (
		<div className="rounded-lg border border-neutral-200 bg-white">
			<div className="flex items-center gap-3 p-4">
				<button
					id={toggleId}
					type="button"
					className="flex flex-1 items-center justify-between gap-3 text-left"
					onClick={() => setIsExpanded((prev) => !prev)}
					aria-expanded={isExpanded}
					aria-controls={panelId}
				>
					<div>
						<p className="font-medium text-neutral-800">{getAddressTitle(index)}</p>
						<p className="mt-1 text-sm text-neutral-500">
							{isExpanded ? "Use search to autofill, then adjust any field manually." : formatAddressSummary(address)}
						</p>
					</div>
					<ChevronDownIcon
						className={clsx(
							"h-4 w-4 shrink-0 text-neutral-500 transition-transform duration-200",
							isExpanded && "rotate-180",
						)}
					/>
				</button>
				<Button
					type="button"
					onClick={onRemoveAddress ?? onRemove}
					className="h-8 w-8 shrink-0 !p-0"
					aria-label={`Remove address ${index + 1}`}
				>
					<XIcon className="h-4 w-4" />
				</Button>
			</div>

			{isExpanded && (
				<section id={panelId} aria-labelledby={toggleId} className="space-y-4 border-t border-neutral-200 p-4">
					<div>
						<p className="mb-1 text-sm font-medium text-neutral-700">Search address</p>
						<p className="sr-only" aria-live="polite">
							{searchStatusMessage}
						</p>
						<div
							className="relative"
							onBlur={() => {
								window.setTimeout(() => {
									setSearchState((prev) => ({ ...prev, isOpen: false }));
								}, 120);
							}}
						>
							<Input
								type="text"
								placeholder="Search for an address"
								icon="Search"
								value={searchState.query}
								aria-expanded={searchState.isOpen}
								aria-controls={searchResultsId}
								onChange={(e) => handleSearchChange(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === "Escape") {
										setSearchState((prev) => ({ ...prev, isOpen: false }));
									}
								}}
								onFocus={() => {
									if (searchState.results.length > 0) {
										setSearchState((prev) => ({ ...prev, isOpen: true }));
									}
								}}
							/>
							{searchState.isOpen && (
								<ul
									id={searchResultsId}
									aria-label="Address search results"
									className={clsx(
										"absolute z-20 mt-1 w-full max-h-48 overflow-y-auto",
										"rounded-md border border-neutral-200 bg-white shadow-md",
									)}
								>
									{searchState.isLoading && <li className="px-3 py-2 text-sm text-neutral-500">Searching...</li>}
									{!searchState.isLoading && searchState.results.length === 0 && searchState.query.trim() && (
										<li className="px-3 py-2 text-sm text-neutral-500">No results found</li>
									)}
									{searchState.results.map((result) => (
										<li key={result.place_id}>
											<button
												type="button"
												className="w-full px-3 py-2 text-left text-sm text-neutral-800 hover:bg-primary-50"
												onMouseDown={(e) => e.preventDefault()}
												onClick={() => handleSelectResult(result)}
											>
												{result.display_name}
											</button>
										</li>
									))}
								</ul>
							)}
						</div>
					</div>

					<div className="grid gap-3 sm:grid-cols-2">
						<div className="sm:col-span-2">
							<p className="mb-1 text-sm font-medium text-neutral-700">Address line 1</p>
							<Input
								type="text"
								placeholder="Street address"
								value={address.line1}
								onChange={(e) => updateAddress({ line1: e.target.value })}
							/>
						</div>
						<div className="sm:col-span-2">
							<p className="mb-1 text-sm font-medium text-neutral-700">Address line 2</p>
							<Input
								type="text"
								placeholder="Apartment, suite, etc. (optional)"
								value={address.line2 ?? ""}
								onChange={(e) => updateAddress({ line2: e.target.value })}
							/>
						</div>
						<div>
							<p className="mb-1 text-sm font-medium text-neutral-700">City</p>
							<Input
								type="text"
								placeholder="City"
								value={address.city}
								onChange={(e) => updateAddress({ city: e.target.value })}
							/>
						</div>
						<div>
							<p className="mb-1 text-sm font-medium text-neutral-700">State / Province</p>
							<Input
								type="text"
								placeholder="State"
								value={address.state}
								onChange={(e) => updateAddress({ state: e.target.value })}
							/>
						</div>
						<div>
							<p className="mb-1 text-sm font-medium text-neutral-700">Postal code</p>
							<Input
								type="text"
								placeholder="Postal code"
								value={address.postal_code}
								onChange={(e) => updateAddress({ postal_code: e.target.value })}
							/>
						</div>
						<div>
							<p className="mb-1 text-sm font-medium text-neutral-700">Country</p>
							<Input
								type="text"
								placeholder="Country"
								value={address.country}
								onChange={(e) => updateAddress({ country: e.target.value })}
							/>
						</div>
					</div>

					<div className="grid gap-3 rounded-md bg-neutral-50 px-3 py-3 text-sm text-neutral-600 sm:grid-cols-2">
						<div>
							<p className="text-xs font-medium uppercase tracking-wide text-neutral-500">Latitude</p>
							<p className={clsx("mt-1", !hasCoordinates && "text-neutral-500")}>{getGeoValue(address.latitude)}</p>
						</div>
						<div>
							<p className="text-xs font-medium uppercase tracking-wide text-neutral-500">Longitude</p>
							<p className={clsx("mt-1", !hasCoordinates && "text-neutral-500")}>{getGeoValue(address.longitude)}</p>
						</div>
						{!hasCoordinates && (
							<p className="text-xs text-neutral-500 sm:col-span-2">
								Search or re-search this address to refresh geo metadata.
							</p>
						)}
					</div>

					<div className="flex justify-end pt-2">
						<Button type="button" label="Save" onClick={onSave} disabled={isSaving} isProcessing={isSaving} />
					</div>
				</section>
			)}
		</div>
	);
}

export function ProfileAddressTab({
	control,
	onSaveAddress,
	onRemoveAddress,
}: {
	control: Control<ProfileFormSchema>;
	onSaveAddress?: (index: number) => Promise<void>;
	onRemoveAddress?: (index: number) => void;
}) {
	const addressKeysRef = useRef<string[]>([]);
	const nextKeyRef = useRef(0);
	const addresses = useWatch({ control, name: "addresses" }) ?? [];

	const createAddressKey = () => {
		nextKeyRef.current += 1;
		return `new-address-${nextKeyRef.current}`;
	};

	useEffect(() => {
		if (addressKeysRef.current.length > addresses.length) {
			addressKeysRef.current = addressKeysRef.current.slice(0, addresses.length);
		}

		while (addressKeysRef.current.length < addresses.length) {
			addressKeysRef.current.push(createAddressKey());
		}
	}, [addresses.length]);

	const handleAddAddress = (field: ControllerRenderProps<ProfileFormSchema, "addresses">) => {
		addressKeysRef.current = [...addressKeysRef.current, createAddressKey()];
		field.onChange([...(field.value ?? []), { ...EMPTY_ADDRESS }]);
	};

	const handleRemoveAddress = (field: ControllerRenderProps<ProfileFormSchema, "addresses">, index: number) => {
		addressKeysRef.current = addressKeysRef.current.filter((_, currentIndex) => currentIndex !== index);
		field.onChange(field.value?.filter((_, i) => i !== index) ?? []);
	};


	return (
		<Controller
				name="addresses"
				control={control}
				render={({ field }) => {
					const currentAddresses = field.value ?? [];

					return (
						<div className="space-y-4">
							<div className="flex items-center justify-between gap-3">
								<div>
									<h2 className="text-lg font-semibold text-neutral-900">Addresses</h2>
									<p className="mt-1 text-sm text-neutral-600">
										Add the places where you offer care. Search can autofill the structured fields, and you can edit
										each field anytime.
									</p>
								</div>
								<Button
									type="button"
									label="Add address"
									icon={<PlusIcon className="h-4 w-4 mr-2" />}
									onClick={() => handleAddAddress(field)}
								/>
							</div>

							{currentAddresses.length === 0 ? (
								<div className="rounded-lg border border-dashed border-neutral-300 bg-neutral-50 px-5 py-8 text-center">
									<p className="text-base font-medium text-neutral-900">No addresses added yet</p>
									<p className="mt-2 text-sm text-neutral-600">
										Add your primary practice location to show structured address details and geo information.
									</p>
									<Button
										type="button"
										label="Add address"
										outlined
										className="mx-auto mt-4"
										icon={<PlusIcon className="mr-2 h-4 w-4" />}
										onClick={() => handleAddAddress(field)}
									/>
								</div>
							) : (
								<div className="space-y-4">
									{currentAddresses.map((address, index) => (
										<AddressCard
											key={address.id != null ? `address-${address.id}` : addressKeysRef.current[index]}
											index={index}
											address={address}
											field={field}
											onRemove={() => handleRemoveAddress(field, index)}
											onRemoveAddress={onRemoveAddress ? () => onRemoveAddress(index) : undefined}
											onSave={onSaveAddress ? () => onSaveAddress(index) : undefined}
											isSaving={false}
										/>
									))}
								</div>
							)}
						</div>
					);
				}}
			/>
	);
}
