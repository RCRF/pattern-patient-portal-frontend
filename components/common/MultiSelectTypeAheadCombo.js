import { useState, useEffect } from 'react';
import { Combobox } from '@headlessui/react';

const MultiSelectTypeahead = ({ items, onValueChange, placeholder, defaultValue }) => {



    const [selectedItems, setSelectedItems] = useState(defaultValue || []);
    const [query, setQuery] = useState('');

    useEffect(() => {
        setSelectedItems(defaultValue || []);
    }, [defaultValue]);


    const filteredItems = query === '' ? items : items.filter((item) =>
        item.label.toLowerCase().includes(query.toLowerCase())
    );

    const handleChange = (newValue) => {

        setSelectedItems(newValue);
        if (onValueChange) {
            const valueArray = newValue.map((item) => item);
            onValueChange(valueArray);
        }
    };

    const renderChips = () => {

        return selectedItems.map((item, index) => (
            //remove the item from the selectedItems array when clicked on the chip
            <button type="button" key={index} onClick={() => handleChange(selectedItems.filter((i) => i.value !== item.value))} className="bg-blue-100 rounded-md px-2 py-1 m-1 capitalize">
                {item.label}
            </button>
        ));
    };

    return (
        <div className='relative w-full'>
            <Combobox value={selectedItems} onChange={handleChange} multiple>
                <div className="flex capitalize overflow-x-scroll">
                    {renderChips()}
                </div>
                <Combobox.Input
                    placeholder={placeholder}
                    className="rounded-md w-full px-3 py-2 shadow-sm border"
                    onChange={(event) => setQuery(event.target.value)}
                />
                <Combobox.Options className="absolute z-10 md:mr-10 max-h-60 w-full mx-auto overflow-auto rounded-md bg-white shadow-lg">
                    {filteredItems.map((item, index) => (
                        <Combobox.Option
                            key={index}
                            value={item}
                            className="cursor-pointer select-none relative py-2 pl-5 pr-4 hover:bg-gray-100"
                        >
                            {({ selected, active }) => (
                                <>
                                    <span className={`${selected ? 'font-medium' : 'font-normal'} block truncate capitalize`}>
                                        {item.label}
                                    </span>
                                </>
                            )}
                        </Combobox.Option>
                    ))}
                </Combobox.Options>
            </Combobox>
        </div>
    );
};

export default MultiSelectTypeahead;
