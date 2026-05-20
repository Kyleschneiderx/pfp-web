export const OWNERSHIP_TAB_ALL = "all";
export const OWNERSHIP_TAB_SYSTEM = "system";
export const OWNERSHIP_TAB_OWN = "own";

export type OwnershipTab = typeof OWNERSHIP_TAB_ALL | typeof OWNERSHIP_TAB_SYSTEM | typeof OWNERSHIP_TAB_OWN;

export function ownershipTabFromSearchParams(value?: string | null): OwnershipTab {
	if (value === OWNERSHIP_TAB_SYSTEM || value === OWNERSHIP_TAB_OWN) {
		return value;
	}

	return OWNERSHIP_TAB_ALL;
}

export function ownershipToIsOwn(ownership?: string | null): boolean | undefined {
	const tab = ownershipTabFromSearchParams(ownership);

	if (tab === OWNERSHIP_TAB_OWN) {
		return true;
	}

	if (tab === OWNERSHIP_TAB_SYSTEM) {
		return false;
	}

	return undefined;
}

export function isOwnQueryParam(ownership?: string | null): string {
	const isOwn = ownershipToIsOwn(ownership);

	if (isOwn === undefined) {
		return "";
	}

	return `&is_own=${isOwn}`;
}
