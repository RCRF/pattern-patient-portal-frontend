import { useState, useEffect } from 'react'
import { Listbox } from '@headlessui/react'
import { set } from 'lodash';


function MultiSelectDropdown({ items, onValueChange, placeholder, maxHeight, defaultValue }) {
    const [selectedItems, setSelectedItems] = useState(defaultValue || []);

    const handleChange = (newValue) => {
        if (newValue.length < selectedItems.length) {
            setSelectedItems(newValue)
            onValueChange(newValue);
        } else {
            const changedItem = newValue.find(item => !selectedItems.some(selected => selected.value === item.value))
            if (!changedItem) {
                const newSelection = selectedItems.find((item, index) => newValue.some((selected, selectedIndex) => index !== selectedIndex && selected.value === item.value))
                const newSelectedItems = selectedItems.filter(item => item.value !== newSelection.value)
                onValueChange(newSelectedItems);
                setSelectedItems(newSelectedItems)
            } else {
                setSelectedItems(newValue)
                onValueChange(newValue);
            }
        }


    };


    useEffect(() => {
        setSelectedItems(defaultValue);
    }, [defaultValue]);

    const renderChips = () => {

        return selectedItems?.map((item, index) => (
            //remove the item from the selectedItems array when clicked on the chip
            <button type="button" key={index} onClick={() => handleChange(selectedItems?.filter((i) => i.value !== item.value))} className="bg-blue-100 rounded-md px-2 py-1 m-1 capitalize">
                <p className='line-clamp-1'>{item.label}</p>
            </button>
        ));
    };
    return (
        <Listbox placeholder={placeholder} value={selectedItems} onChange={handleChange} multiple>
            <div className={`relative w-full self-center max-h-24`}>
                <Listbox.Button className="rounded-md w-full px-1 shadow-md border bg-white h-10 self-center flex flex-wrap">
                    <div className="flex capitalize overflow-x-scroll">
                        {renderChips()}
                    </div>
                </Listbox.Button>
                <Listbox.Options className={`absolute w-full mt-1 z-50 bg-white border rounded-md ${maxHeight || ''} overflow-scroll`}>
                    {items.map((item) => (
                        <Listbox.Option key={item.id} value={item} className="cursor-pointer hover:bg-blue-100">
                            <div className={`${selectedItems?.some(si => si.value === item.value) ? 'font-bold' : 'font-normal'} p-1 pl-2`}>
                                {item.label}
                            </div>
                        </Listbox.Option>
                    ))}
                </Listbox.Options>
            </div>
        </Listbox>
    )
}

export default MultiSelectDropdown