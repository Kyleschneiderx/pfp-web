import { OptionsModel } from "../models/common_model";

const currentYear = new Date().getFullYear();

export const yearOptions: OptionsModel[] = Array.from(
  { length: currentYear - 1990 + 1 },
  (_, index) => {
    const year = currentYear - index;
    return { label: year.toString(), value: year.toString() };
  }
);
