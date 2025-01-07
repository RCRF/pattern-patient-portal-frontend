import { useState, useEffect } from 'react';
import { Combobox } from '@headlessui/react';

const TypeaheadComboBox = ({ items, onValueChange, placeholder, marginTop, defaultValue }) => {
    const [selectedItem, setSelectedItem] = useState(defaultValue || null);
    const [query, setQuery] = useState('');
    const filteredItems = query === '' ? items : items.filter((item) =>
        item.label.toLowerCase().includes(query.toLowerCase())
    );

    useEffect(() => {
        setSelectedItem(defaultValue);
    }, [defaultValue]);


    const handleChange = (item) => {
        setSelectedItem(item);
        if (onValueChange) {
            onValueChange(item.value); // Call the callback function with the selected item
        }
    };

    return (
        <Combobox value={selectedItem} onChange={handleChange}>
            <Combobox.Input
                placeholder={placeholder}
                className="rounded-md w-full px-3 py-2 shadow-md border"
                displayValue={(item) => (item ? item.label : '')}
                onChange={(event) => setQuery(event.target.value)}
            />
            <Combobox.Options className={`absolute md:mr-10 ${marginTop} max-h-60 z-50 w-5/6 md:w-1/4 mx-auto overflow-auto rounded-md bg-white shadow-lg`}>
                {filteredItems.map((item, index) => (
                    <Combobox.Option
                        key={index}
                        value={item}
                        className="cursor-pointer select-none relative py-2 pl-5 pr-4 hover:bg-gray-100"
                    >
                        {({ selected, active }) => (
                            <>
                                <span className={`${selected ? 'font-medium' : 'font-normal'} block truncate`}>
                                    {item.label}
                                </span>
                            </>
                        )}
                    </Combobox.Option>
                ))}
            </Combobox.Options>
        </Combobox>
    );
};

export default TypeaheadComboBox;
