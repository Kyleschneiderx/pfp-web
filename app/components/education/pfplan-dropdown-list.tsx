import { OptionsModel } from "@/app/models/common_model";
import { getPfPlans } from "@/app/services/client_side/pfplans";
import { useEffect, useState } from "react";
import SelectCmp from "../elements/SelectCmp";

interface Props {
  value: OptionsModel | null;
  setValue: (data: OptionsModel | null) => void;
  getOptions: (data: OptionsModel[]) => void;
}

export default function PfPlanDropdownList({ value = null, setValue, getOptions }: Props) {
  const [options, setOptions] = useState<OptionsModel[]>([]);

  const fetchPfPlans = async () => {
    const params = `sort[]=name:ASC&page=1&page_items=1000`;
    const { data } = await getPfPlans(params);
    const transformList = data.map((el) => ({
      label: el.name,
      value: el.id.toString(),
    }));
    setOptions(transformList);
    getOptions(transformList);
  };

  useEffect(() => {
    fetchPfPlans();
  }, []);

  return (
    <SelectCmp
      options={options}
      value={value}
      onChange={(e) => setValue(e)}
      placeholder="Select PF Plan"
      wrapperClassName="z-50"
    />
  );
}
