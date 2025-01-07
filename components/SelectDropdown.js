import React from 'react';

const SelectDropdown = ({ options, value, onChange, size }) => {
  const handleChange = (e) => {
    const selectedValue = e.target.value;
    onChange(selectedValue);
  };

  return (
    <select
      value={value}
      onChange={handleChange}
      className={`${
        size ? size : null
      }  relative cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6`}
    >
      {options.map((option) => (
        <option
          key={option.id}
          value={option.id}
          className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
        >
          {option.name}
        </option>
      ))}
    </select>
  );
};

export default SelectDropdown;
