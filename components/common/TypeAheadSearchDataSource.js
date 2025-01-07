import { useState, useEffect, useCallback } from 'react';
import { Combobox } from '@headlessui/react';
import { Controller } from 'react-hook-form';
import { debounce } from 'lodash';
import { useSearchInstitutions } from '@/hooks/api';

export default function TypeAheadSearchDataSource({ control, name }) {
    const [inputValue, setInputValue] = useState('');
    const [selectedItem, setSelectedItem] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const { data: institutions, isLoading } = useSearchInstitutions(inputValue);

    // Use useCallback to memoize the debounced function
    const debouncedFetchData = useCallback(debounce((value) => {
        setSearchTerm(value);
    }, 300), []);

    useEffect(() => {
        debouncedFetchData(inputValue);
        if (inputValue === '') {
            setSearchTerm('');
        }

        return () => debouncedFetchData.cancel();
    }, [inputValue, debouncedFetchData]);


    // Transform data to match the shape expected by the Combobox
    const transformedInstitutions = institutions?.map((institution) => ({
        label: institution.title,
        value: institution,
    })) || [];


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
                            setInputValue(item.label); // Update input value to the label of the selected item
                            onChange(item.value); // Notify react-hook-form of the change
                        }}
                    >
                        <Combobox.Input
                            className="rounded-md mt-2 w-full px-3 py-2 shadow-md border placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            onChange={(event) => {
                                setInputValue(event.target.value);
                                setSelectedItem(null); // Reset selected item on input change
                            }}
                            value={inputValue}
                        />
                        <Combobox.Options className="absolute mt-1 max-h-60 overflow-auto bg-white border border-gray-300 rounded-md shadow-lg z-40">
                            {isLoading ? (
                                <div className="cursor-pointer p-2">Loading...</div>
                            ) : transformedInstitutions.length > 0 ? (
                                transformedInstitutions.map((institution, index) => (
                                    <Combobox.Option key={index} value={institution} as="div" className="cursor-pointer hover:bg-gray-100 p-2">
                                        {institution.label}
                                    </Combobox.Option>
                                ))
                            ) : (
                                <div className="cursor-pointer p-2">No results found</div>
                            )}
                        </Combobox.Options>
                    </Combobox>
                )}
            />
        </div>
    );
}
