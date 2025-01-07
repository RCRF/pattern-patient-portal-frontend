import React, { useEffect, useState } from 'react';
import { usePatientContext } from '@/components/context/PatientContext';
import { Listbox } from '@headlessui/react';
import { useRouter } from 'next/router';
import { selectedPatientIdPOST } from "@/hooks/api";
import { useMutation } from "react-query";
import { toast } from "react-hot-toast";
import { useAuth } from "@clerk/nextjs";
import { useFetchAuthorizedAccounts } from "@/hooks/api";
import { useQueryClient } from "react-query";
import EmptyState from "@/components/common/EmptyState";
import { UserGroupIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '@/components/common/LoadingSpinner';


export const WelcomePage = () => {
    const router = useRouter();
    const { getToken } = useAuth();
    const [selectedPatient, setSelectedPatient] = useState();
    const [filteredAccounts, setFilteredAccounts] = useState([]);
    const queryClient = useQueryClient();

    const { data: authorizedAccounts, isLoading } = useFetchAuthorizedAccounts();

    //sort authorized accounts by last name
    useEffect(() => {
        if (authorizedAccounts) {
            const sortedAccounts = authorizedAccounts.sort((a, b) => {
                if (a.lastName < b.lastName) {
                    return -1;
                }
                if (a.lastName > b.lastName) {
                    return 1;
                }
                return 0;
            });
            setFilteredAccounts(sortedAccounts);
        }
    }, [authorizedAccounts]);



    const selectPatient = useMutation(
        (payload) => selectedPatientIdPOST(payload),
        {
            onSuccess: () => {
                queryClient.clear();
                toast.success("Successfully selected patient")
                router.push('/dashboard');
            },
            onError: (error) => {
                const errorMessage = error.response?.data?.error || 'An error occurred';
                toast.error("Unable to select patient: " + errorMessage);
            },
        }
    );




    const handleSelectPatient = (patient) => {
        setSelectedPatient(patient);
    };

    const handleGoToPatientPortal = async () => {
        const token = await getToken();
        !selectedPatient && toast.error("Please select a patient")
        if (!selectedPatient) {
            return;
        }
        const payload = {
            patientId: selectedPatient.patientId,
            token: token,
        };

        selectPatient.mutate(payload);
        // router.push('/dashboard');
    }

    //display loading spinner if still fetching authorized accounts
    if (isLoading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="flex flex-col items-center mt-20 h-screen p-4">
            <h1 className="text-4xl font-semibold text-gray-700">Patient Portal</h1>
            {authorizedAccounts && authorizedAccounts.length > 0 ? <div className='relative w-1/2'>
                <div className='mt-20'>
                    <Listbox value={selectedPatient} onChange={handleSelectPatient}>
                        <Listbox.Button className="w-full py-2 pl-3 pr-10 text-left bg-white rounded shadow-md cursor-default focus:outline-none focus:ring-2 focus:ring-slate-600">
                            {selectedPatient ? `${selectedPatient.firstName} ${selectedPatient.lastName}` : 'Select a patient'}
                        </Listbox.Button>
                        <Listbox.Options className="absolute py-1 mt-1 w-full overflow-auto text-base bg-white rounded-md shadow-lg max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-10">
                            {filteredAccounts.map((patient) => (
                                <Listbox.Option
                                    key={patient.value}
                                    className={({ active }) =>
                                        `cursor-default select-none relative py-2 pl-5 pr-4 ${active ? 'text-blue-900 bg-blue-100' : 'text-gray-900'}`
                                    }
                                    value={patient}
                                >
                                    {({ selected }) => (
                                        <>
                                            <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                                                {patient.firstName} {patient.lastName}
                                            </span>
                                            {selected && (
                                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                                                    {/* Checkmark icon */}
                                                </span>
                                            )}
                                        </>
                                    )}
                                </Listbox.Option>
                            ))}
                        </Listbox.Options>
                    </Listbox>
                    <div className='w-ful flex justify-center'>
                        <button onClick={handleGoToPatientPortal} className="bg-blue-700 hover:bg-blue-900 text-white font-bold py-2 px-4 rounded mt-10">
                            Go to Patient Portal
                        </button>
                    </div>
                </div>
            </div>
                :
                <div className='mt-10 w-full flex justify-center'>
                    <EmptyState message="No patients available" Icon={UserGroupIcon} width="w-1/3" />
                </div>
            }

        </div>
    );
};

export default WelcomePage;
