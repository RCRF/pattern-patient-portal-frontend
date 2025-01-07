import React, { useState, useEffect } from 'react';
import { Controller } from 'react-hook-form';
import MultiSelectTypeahead from "@/components/common/MultiSelectTypeAheadCombo";


export const ControlledMultiSelectTypeahead = ({ name, control, data, placeholder, defaultValue }) => {
    return (
        <Controller
            control={control}
            name={name}
            defaultValue={defaultValue}
            render={({ field }) => (
                < MultiSelectTypeahead
                    items={data.sort((a, b) => {
                        if (a.label < b.label) return -1;
                        if (a.label > b.label) return 1;
                        return 0;
                    })}
                    onValueChange={field.onChange}
                    placeholder={placeholder}
                    defaultValue={defaultValue}
                />
            )
            }
        />
    );
};



