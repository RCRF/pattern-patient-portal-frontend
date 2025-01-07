import { useState, useEffect } from 'react'
import { Listbox } from '@headlessui/react'


function SingleSelectDropdown({ items, onValueChange, defaultValue, maxHeight }) {

    const [selectedItem, setSelectedItem] = useState(defaultValue || null);

    const handleChange = (newValue) => {
        setSelectedItem(newValue);
        if (onValueChange) {
            onValueChange(newValue.value);
        }
    };

    useEffect(() => {
        setSelectedItem(defaultValue);
    }, [defaultValue]);

    return (
        <Listbox value={selectedItem} onChange={handleChange}>
            <div className={`relative w-full self-center ${maxHeight ? 'max-h-' + maxHeight : 'max-h-24'}`}>
                <Listbox.Button type="button" className=" rounded-md w-full px-3 shadow-md border bg-white h-10 self-center flex flex-wrap">
                    {selectedItem ? (<div className="self-center m-1 capitalize">{selectedItem.label}</div>) : ''}
                </Listbox.Button>
                <Listbox.Options className={`absolute w-full mt-1 z-40 bg-white border rounded-md overflow-auto ${maxHeight}`}>
                    {items.map((item) => (
                        <Listbox.Option key={item.id} value={item} className="cursor-pointer hover:bg-blue-100 capitalize">
                            {({ selected }) => (
                                <div className={`${selected ? 'font-bold' : 'font-normal'} p-1 pl-2`}>{item.label}</div>
                            )}
                        </Listbox.Option>
                    ))}
                </Listbox.Options>
            </div>
        </Listbox >
    );
}


export default SingleSelectDropdown
