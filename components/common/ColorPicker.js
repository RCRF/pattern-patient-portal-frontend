import React, { useState } from 'react';

function ColorPicker({ onValueChange }) {
    const items = ["red", "green", "blue", "purple", "indigo", "pink", "gray"];
    const [selectedColor, setSelectedColor] = useState("blue");

    const handleChange = (color) => {
        setSelectedColor(color);
        if (onValueChange) {
            onValueChange(color);
        }
    };

    return (
        <div className="flex flex-row justify-center">
            {items.map((color) => (
                <label key={color} className={`w-8 h-8 m-2 rounded cursor-pointer bg-${color}-500 ${selectedColor === color ? 'shadow-lg shadow-black border' : ''}`}>
                    <input
                        type="checkbox"
                        className="hidden"
                        value={color}
                        checked={selectedColor === color}
                        onChange={() => handleChange(color)}
                    />
                </label>
            ))}
        </div>
    );
}

export default ColorPicker;
