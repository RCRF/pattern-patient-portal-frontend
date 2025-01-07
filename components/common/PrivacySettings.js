//create a very basic component 

import React from 'react';

export const PrivacySettings = ({ visibilitySettings }) => {

    visibilitySettings

    return (
        <div className='p-6 pt-0 mx-auto text-slate-800'>
            <h1 className='w-full text-3xl font-semibold text-center mb-5'>Visbility Settings</h1>
            <hr className='w-full border-1 border-slate-200 mb-5' />
            <div className='flex flex-col gap-4 bg-slate-50 p-4'>

                {visibilitySettings.map((setting) => (
                    <div className='flex flex-col'>
                        <div className='flex flex-row items-center gap-2'>
                            <div className={`text-xl font-bold flex gap-1 ${setting.value === 5 ? 'text-red-500'
                                : setting.value === 4 ? 'text-orange-500'
                                    : setting.value === 1 ? "text-blue-500"
                                        : setting.value === 3 ? "text-yellow-500"
                                            : setting.value === 2 ? "text-green-400"
                                                : ''}`}>
                                {setting.label}
                                <span className='text-sm self-center'> ({setting.secondLabel})</span>
                            </div>
                            {setting.value === 5 && <div className='text-sm italic text-red-500'>Use with caution</div>}
                        </div>
                        <div className='text-sm'>{setting.description}</div>
                    </div>
                ))}
            </div>
        </div>

    );
}
