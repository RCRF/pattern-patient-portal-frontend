import { useState } from 'react'
import { Combobox } from '@headlessui/react'
import { Controller } from 'react-hook-form';

export default function TypeAheadSearch({ control, name, items }) {
    const [query, setQuery] = useState('');
    const [inputValue, setInputValue] = useState('');
    const [selectedItem, setSelectedItem] = useState(null);

    const filteredItems = query === '' ? items : items.filter((item) => {
        return item.label.toLowerCase().includes(query.toLowerCase());
    });

    return (
        <div className='w-full'>
            <Controller
                control={control}
                name={name}
                render={({ field: { onChange } }) => (
                    <Combobox
                        value={selectedItem}
                        onChange={(item) => {
                            setSelectedItem(item);
                            setInputValue(item.label);
                            onChange(item.value);
                        }}
                    >
                        <Combobox.Input
                            className="rounded-md mt-2  w-full px-3 py-2 shadow-md  border placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            onChange={(event) => {
                                setQuery(event.target.value);
                                setInputValue(event.target.value);
                            }}
                            value={inputValue}
                        />
                        <Combobox.Options className="absolute mt-1 max-h-60 overflow-auto bg-white border border-gray-300 rounded-md shadow-lg z-40">
                            {filteredItems.map((item, index) => (
                                <Combobox.Option key={index} value={item} as="div" className="cursor-pointer hover:bg-gray-100 p-2">
                                    {item.label}
                                </Combobox.Option>
                            ))}
                        </Combobox.Options>
                    </Combobox>
                )}
            />
        </div>
    );
}


