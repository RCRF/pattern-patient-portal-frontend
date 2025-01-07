import { useState } from 'react'
import { Combobox } from '@headlessui/react'
import { Controller } from 'react-hook-form';




export default function ComboBoxSearch({ control, name, items }) {
    const [query, setQuery] = useState('');
    const [selectedItem, setSelectedItem] = useState(null);

    const filteredItems = query === '' ? items : items.filter((item) => {
        return item.label.toLowerCase().includes(query.toLowerCase());
    });

    return (
        <Controller
            control={control}
            name={name}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
                <Combobox value={selectedItem} onChange={(item) => {
                    setSelectedItem(item);
                    onChange(item.value); // This will set the form value to the 'value' of the item.
                }}>
                    <Combobox.Input
                        className="border border-gray-300 rounded p-2"
                        onChange={(event) => {
                            setQuery(event.target.value);
                        }}
                    />
                    <Combobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto bg-white border border-gray-300 rounded-md shadow-lg z-10">
                        {filteredItems.map((item, index) => (
                            <Combobox.Option key={index} value={item} as="div" className="cursor-pointer hover:bg-gray-100 p-2">
                                {item.label}
                            </Combobox.Option>
                        ))}
                    </Combobox.Options>
                </Combobox>
            )}
        />
    );
};

