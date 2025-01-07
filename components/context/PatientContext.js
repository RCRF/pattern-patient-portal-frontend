import React, { createContext, useState, useContext } from 'react';

const PatientContext = createContext();

export const usePatientContext = () => useContext(PatientContext);

export const PatientProvider = ({ children }) => {
    const [patientId, setPatientId] = useState(null);

    const selectPatient = (id) => {
        setPatientId(id);
    };

    return (
        <PatientContext.Provider value={{ patientId, selectPatient }}>
            {children}
        </PatientContext.Provider>
    );
};
