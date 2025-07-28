import React, { useMemo } from "react";
import { Select } from "antd";
import { SoundList } from "../../pages/admin/Listsound/Listsound";
import "../Search/st.css"

const { Option } = Select;

interface SoundListFilterProps {
  column: any;
  data: SoundList[];
}

const STFilter: React.FC<SoundListFilterProps> = ({ column, data }) => {
  const filterValue = column.getFilterValue();

  const uniqueTypes = useMemo(() => {
    return Array.from(new Set(data.map(item => item.sound_type_name)))
      .filter(Boolean)
      .sort();
  }, [data]);

  const handleChange = (value: string) => {
    column.setFilterValue(value === "all" ? undefined : value);
  };

  return (
    <Select
      className="custom-select"
      value={filterValue ?? "all"}
      onChange={handleChange}
      style={{ width: 160 }}
      size="middle"
    >
      <Option value="all" className="custom-option" >ทั้งหมด</Option>
      {uniqueTypes.map((type) => (
        <Option key={type} value={type} className="custom-option">
          {type}
        </Option>
      ))}
    </Select>
  );
};

export default STFilter;
