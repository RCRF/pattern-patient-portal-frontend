import React, { useState } from 'react';
import { Controller } from 'react-hook-form';
import axios from 'axios';

export const FileUploader = ({ control, name }) => {


    return (
        <Controller
            control={control}
            name={name}
            render={({ field: { onChange, value = [] } }) => (
                <div className="">
                    <input
                        type="file"
                        onChange={(e) => {
                            const file = e.target.files[0];
                            onChange(file);
                        }}
                        className="block w-full py-1 px-3 border h-10 border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
            )}
        />
    )
}


