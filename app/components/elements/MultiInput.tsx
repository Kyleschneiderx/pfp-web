import type { OptionsModel } from "@/app/models/common_model";
import React, { useEffect, useState, type KeyboardEventHandler } from "react";
import CreatableSelect from "react-select/creatable";

export default function MultiInput({ onChange, value }: { onChange: (...event: any[]) => void; value?: string[] }) {
	const [inputValue, setInputValue] = useState("");
	const [val, setVal] = useState<readonly OptionsModel[]>(() => {
		return value ? value?.map((v) => ({ label: v, value: v })) : [];
	});

	const handleKeyDown: KeyboardEventHandler = (event) => {
		if (!inputValue) return;
		switch (event.key) {
			case "Enter":
			case "Tab":
				setVal((prev) => [...prev, { label: inputValue, value: inputValue }]);
				setInputValue("");
				event.preventDefault();
		}
	};

	useEffect(() => {
		onChange(val.map((v) => v.value));
	}, [val]);

	return (
		<CreatableSelect
			components={{ DropdownIndicator: null }}
			isMulti
			menuIsOpen={false}
			isClearable
			onChange={(newValue) => {
				setVal(newValue);
			}}
			onKeyDown={handleKeyDown}
			onInputChange={(newValue) => setInputValue(newValue)}
			placeholder="Input license and press enter..."
			inputValue={inputValue}
			value={val}
		/>
	);
}
