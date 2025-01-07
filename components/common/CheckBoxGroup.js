import { Controller } from 'react-hook-form';


export const CheckboxGroup = ({ control, name, options }) => {
    return (
        <Controller
            control={control}
            name={name}
            render={({ field: { onChange, value = [] } }) => (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {options?.map((option) => (
                        <div key={option.id} className="form-check">
                            <label className="inline-flex items-center">
                                <input
                                    type="checkbox"
                                    className="form-checkbox"
                                    value={option.id}
                                    checked={value.includes(option.id)}
                                    onChange={(e) => {
                                        const newValue = e.target.checked
                                            ? [...value, option.id]
                                            : value.filter((id) => id !== option.id);
                                        onChange(newValue);
                                    }}
                                />
                                <span className="ml-2">{option.title}</span>
                            </label>
                        </div>
                    ))}
                </div>
            )}
        />
    );
};
