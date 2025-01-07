import React, { useState, useEffect, Fragment } from 'react';
import axios from 'axios';
import { getDrugNames, useProviders, useDiagnoses, createMedicationPOST, updateMedicationPATCH } from '@/hooks/api';
import { Listbox } from '@headlessui/react';
import { useForm, Controller } from "react-hook-form";
import { useMutation } from "react-query";
import { toast } from "react-hot-toast";
import { useAuth } from "@clerk/nextjs"
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import TypeAheadSearch from './common/TypeAheadSearch';
import Modal from './Modal';
import { PrivacySettings } from './common/PrivacySettings';
import { InformationCircleIcon } from '@heroicons/react/20/solid';
import { PaperClipIcon } from '@heroicons/react/20/solid';
import AttachmentsForm from './forms/AttachmentForm';
import TypeaheadComboBox from './common/TypeaheadComboBox';
import { useQueryClient } from 'react-query';


const dosageUnits = [
    "MG",  // Milligrams
    "G",   // Grams
    "MCG", // Micrograms
    "UG",  // Micrograms (alternative abbreviation)
    "ML",  // Milliliters
    "L",   // Liters
    "IU",  // International Units
    "U",   // Units
    "MEQ", // Milliequivalents
    "MMOL",// Millimoles
    "GT",  // Drops (from guttae)
    "GTT", // Drops (from guttae, plural)
    "TABLET", // Tablets
    "CAPSULE", // Capsules
    "%", // Percent (for topical solutions)
    "PUFF", // Puffs (for inhalers)
    "PACKETS", // Packets
    "PATCH", // Patches
    "SPRAY", // Sprays
    "SUPP", // Suppositories
    "DOSE", // Doses
    "DROPS", // Drops


];

const parseMedications = (medications, query) => {
    const parsedMedications = [];
    //check to see if there is a conceptProperties under conceptGroup if not don't return any items from it and move on to the next 
    medications.drugGroup.conceptGroup.forEach((group) => {
        if (group.conceptProperties) {
            group.conceptProperties.forEach((med) => {
                //check both the name and synonym for the dosage and units
                const name = med.name;
                const nameArray = name.split(' ');
                //if the dosage is written in a format of 4 ML nivolumab 10 MG/ML Injection with ML then MG then you need to times the first number by the second number and the dosage will then be in MG for the units
                const dosageInNameNeedsConversion = med.name.includes('ML') && med.name.includes('MG');
                let dosage;
                let units;
                if (dosageInNameNeedsConversion) {
                    const dosageInName = nameArray.find((item) => !isNaN(item));
                    const dosageInNameIndex = nameArray.findIndex((item) => !isNaN(item));
                    const unitsInName = nameArray[dosageInNameIndex + 1];
                    const dosageInNameConverted = dosageInName * unitsInName;
                    dosage = dosageInNameConverted;
                    units = 'MG';
                } else {
                    const dosageInName = nameArray.find((item) => !isNaN(item));
                    const dosageInNameIndex = nameArray.findIndex((item) => !isNaN(item));
                    const unitsInName = nameArray[dosageInNameIndex + 1];
                    dosage = dosageInName;
                    units = unitsInName;
                }
                //find the name of the units
                // const units = nameArray.find((item) => dosageUnits.includes(item));
                //filter the name array to only include strings
                const nameArrayFiltered = nameArray.filter((item) => isNaN(item));
                //find the name of medication which will match the query when lowercase
                const nameMatch = nameArrayFiltered.find((item) => item.toLowerCase() === query.toLowerCase());
                //find the synonym
                const synonym = med.synonym;
                const synonymArray = synonym.split(' ');
                //find the dosage which will be a number
                const dosageSynonym = synonymArray.find((item) => !isNaN(item));
                //find the name of the units
                const unitsSynonym = synonymArray.find((item) => dosageUnits.includes(item));
                //filter the name array to only include strings
                const synonymArrayFiltered = nameArray.filter((item) => isNaN(item));
                //find the name of medication which will match the query when lowercase
                const synonymMatch = nameArrayFiltered.find((item) => item.toLowerCase() === query.toLowerCase());
                //check to see if the dosage and units are in the name or synonym
                let dosageObject;
                if (dosage && units) {
                    dosageObject = {
                        dosage: dosage,
                        units: units,
                    };
                } else if (dosageSynonym && unitsSynonym) {
                    dosageObject = {
                        dosage: dosageSynonym,
                        units: unitsSynonym,
                    };
                } else {
                    dosageObject = {
                        dosage: null,
                        units: null,
                    };
                }
                // write the medication object with the name which will either come from the name or the synonym
                const medicationObject = {
                    name: nameMatch ? nameMatch : synonymMatch,
                    dosage: dosageObject,
                };


                //only push if there is both a dose and a unit
                if (medicationObject.dosage.dosage && medicationObject.dosage.units) {
                    parsedMedications.push(medicationObject);
                }
            });
        }
    }

    );
    //removed anything that is not a number from the dosage and remove duplicates based on dosage
    const filteredMedications = parsedMedications.filter((medication) => {
        return !isNaN(medication.dosage.dosage);
    });

    // unique medications based on dosage 
    const uniqueMedications = [...new Map(filteredMedications.map(item => [item.dosage.dosage, item])).values()];

    if (uniqueMedications.length > 0) {
        uniqueMedications.push({
            name: query,
            dosage: {
                dosage: "N/A",
                units: null,
            },
        });
    }

    //sort by dosage, sort dosage "N/A" first
    uniqueMedications.sort((a, b) => {
        if (a.dosage.dosage === "N/A") {
            return -1;
        }
        if (b.dosage.dosage === "N/A") {
            return 1;
        }
        return a.dosage.dosage - b.dosage.dosage;
    });

    return uniqueMedications;
};


const frequencyOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
    11, 12, 13, 14, 15, 16, 17, 18, 19, 20
];

const timesOptions = [
    "daily",
    "every other day",
    "weekly",
    "every other week",
    "every 3 weeks",
    "monthly",
    "every other month",
    "every 3 months",
    "every 4 months",
    "every 6 months",
    "yearly",
    "as neeeded"
];

const MedicationSearch = ({ medicationDetails, mode = "add", setEditing }) => {
    const { register, handleSubmit, watch, control, setValue, formState: { errors }, reset } = useForm({
        defaultValues: {
            status: true,
            alternative: false,
            frequency: 1,
            interval: 'daily',
        }
    });
    const [query, setQuery] = useState('');
    const [filteredMedications, setFilteredMedications] = useState([]);
    const [selectedDosage, setSelectedDosage] = useState();
    const [noResults, setNoResults] = useState(false);
    const [drugName, setDrugName] = useState('');
    const [manualEntry, setManualEntry] = useState(false);
    const [providersList, setProvidersList] = useState([]);
    const [diagnosesList, setDiagnosesList] = useState([]);
    const [displayAttachments, setDisplayAttachments] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isVisibilityOpen, setIsVisibilityOpen] = useState(false);
    const [currentProvider, setCurrentProvider] = useState();
    const [currentDiagnoses, setCurrentDiagnoses] = useState();
    const [currentVisibility, setCurrentVisibility] = useState();
    const queryClient = useQueryClient();
    const { getToken } = useAuth();

    const { data: providers } = useProviders();
    const { data: diagnoses } = useDiagnoses();


    const { mutate: createMedication } = useMutation(
        (payload) => createMedicationPOST({ data: payload }),
        {
            onSuccess: () => {
                toast.success("Successfully added medication");
                setIsModalOpen(true);
            },
            onError: (error) => {
                toast.error(error.response.data.error);
            },
        }
    );

    const { mutate: updateMedication } = useMutation(
        (payload) => updateMedicationPATCH({ data: payload }),
        {
            onSuccess: (data) => {
                toast.success(`Successfully updated medication.`);
                //optimistic update
                if (data.prescribingProvider === null) {
                    data.prescribingProvider = [];
                } else {
                    data.prescribingProvider = providers.filter((provider) => provider.providerId === data.prescribingProvider);
                }
                if (data.diagnosis === null) {
                    data.diagnosis = [];
                } else {
                    data.diagnosis = diagnoses.filter((diagnosis) => diagnosis.id === data.diagnosis);
                }

                queryClient.setQueryData(['medication_id', medicationDetails.id], data);
                setEditing(false);

            },
            onError: (error) => {
                toast.error("Unable to update medication" + error);
            },
        }
    );

    const privacySettings = [{
        value: 1,
        label: 'Level 1',
        secondLabel: 'Private',
        description: "Private, only visibile to you"
    },
    {
        value: 2,
        label: 'Level 2',
        secondLabel: 'Care Team',
        description: "Visibile to you and your care team or anyone you grant level 2 access to. Anyone with a level 2 access will be able to see level 2 items as well as all levels greater than 2"
    },
    {
        value: 3,
        label: 'Level 3',
        secondLabel: 'Emergency',
        description: "Visible for emergency or specalized care. Anyone with a level 3 access will be able to see level 3 items as well as all levels greater than 3"
    },
    {
        value: 4,
        label: 'Level 4',
        secondLabel: 'Advocates',
        description: "Visible for advocates you share your records with, or anyone you grant level 4 access to. Anyone with a level 4 access will be able to see level 4 items as well as all levels greater than 4"
    },
    {
        value: 5,
        label: 'Level 5',
        secondLabel: 'Public',
        description: "Public, visible to anyone with login credentials."
    }
    ]

    const closeModal = () => {
        setDisplayAttachments(false);
        setIsModalOpen(false)
    };

    const onSubmit = async (data) => {
        const token = await getToken();
        const selectedProviderId = data.providers?.providerId === "N/A" ? null : data.providers?.providerId || currentProvider?.value?.providerId;
        const selectedDiagnosisId = data.diagnosis?.id === "N/A" ? null : data.diagnosis?.id || currentDiagnoses?.value?.id;
        const payload = {
            id: medicationDetails?.id || null,
            title: data.title.toLowerCase().trim(),
            prescribingProvider: selectedProviderId || null,
            startDate: data.startDate,
            endDate: data.endDate,
            status: data.status ? 'active' : 'discontinued',
            dosage: data.dosage === "N/A" ? null : data.dosage,
            units: data.units,
            notes: data.notes,
            diagnosis: selectedDiagnosisId || null,
            reason: data.reason,
            alternative: data?.alternative ? data.alternative : false,
            token: token,
            accessLevelId: data.visibility.value,
            frequency: data.frequency,
            interval: data.interval,
        };

        if (mode === "editing") {
            updateMedication({ payload, token })
        } else {
            createMedication(payload);
        }

    }

    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            handleSearch();
        }
    };

    const onClose = () => {
        setIsVisibilityOpen(false);
    };


    const handleSearch = async () => {
        try {
            const response = await getDrugNames(query);
            setSelectedDosage();
            //if drugGroup is null then setFilteredMedications to empty array
            if (!response.drugGroup.conceptGroup) {

                setFilteredMedications([]);
                setNoResults(true);
                return;
            } else {
                setNoResults(false);
            }
            const parsedDosages = parseMedications(response, query);
            setFilteredMedications(parsedDosages);
        } catch (error) {
            console.error('Error fetching medications:', error);
        }
    };

    useEffect(() => {
        if (providers) {
            const providersArray = providers.map((provider) => {
                return {
                    value: provider,
                    label: `${provider.firstName} ${provider.lastName}, ${provider.designation}`,
                };
            });
            //add an N/A option for the provider
            providersArray.push({
                value: { providerId: "N/A" },
                label: 'N/A',
            });

            if (medicationDetails?.prescribingProvider?.length > 0) {
                const provider = providersArray.find((provider) => provider.value.providerId === medicationDetails.prescribingProvider[0].id);
                setCurrentProvider(provider);
                setValue('prescribingProvider', provider);
            }
            setProvidersList(providersArray);
        }
    }, [providers]);

    useEffect(() => {
        if (diagnoses) {
            const diagnosesArray = diagnoses.map((diagnosis) => {
                return {
                    value: diagnosis,
                    label: `${diagnosis.title}`,
                };
            });
            //add an N/A option for the provider
            diagnosesArray.push({
                value: { id: "N/A" },
                label: 'N/A',
            });

            if (medicationDetails?.diagnosis?.length > 0) {
                const diagnosis = diagnosesArray.find((diagnosis) => diagnosis.value.id === medicationDetails.diagnosis[0].id);
                setCurrentDiagnoses(diagnosis);

            }
            setDiagnosesList(diagnosesArray);
        }
    }, [diagnoses]);

    useEffect(() => {
        if (filteredMedications.length > 0) {
            setDrugName(query);
        }
    }, [filteredMedications]);


    useEffect(() => {
        if (selectedDosage) {
            setValue('units', selectedDosage.dosage.units)
            setValue('dosage', selectedDosage.dosage.dosage);
            setValue('title', drugName);
        }
    }
        , [selectedDosage]);

    useEffect(() => {
        if (medicationDetails) {
            const visibility = privacySettings.find((setting) => setting.value === medicationDetails.accessLevelId);
            medicationDetails.visibility = visibility;
            setCurrentVisibility(visibility);
            reset(medicationDetails);
        }
    }, []);


    return (
        <div className='w-full mx-auto'>
            {/* Todo: refactor into a component */}
            {isModalOpen && (
                <Modal show={isModalOpen} closeModal={closeModal} fragment={Fragment} size={displayAttachments ? "large" : "small"}>
                    {!displayAttachments ? (
                        <div className="w-full flex flex-col text-center gap-4 p-2">
                            <div className="mx-auto p-2 w-1/4 rounded-lg border bg-slate-800">
                                <PaperClipIcon className="w-20 h-20 mx-auto text-slate-100" />
                            </div>
                            <div className="text-2xl font-semibold mb-10 mt-4">Would you like to add any attachments?</div>

                            <div className="w-full flex flex-row justify-center gap-4">
                                <button type="button" onClick={() => closeModal()} className="bg-blue-600 text-white p-1 h-10 rounded w-20 ">
                                    No
                                </button>
                                <button type="button" onClick={() => setDisplayAttachments(true)} className="bg-blue-600 text-white p-1 h-10 rounded w-20 ">
                                    Yes
                                </button>
                            </div>
                        </div>
                    ) : (
                        <AttachmentsForm closeModal={closeModal} />
                    )}
                </Modal>
            )}
            {isVisibilityOpen &&
                (
                    <Modal title="Visibility" closeModal={onClose}>
                        <PrivacySettings visibilitySettings={privacySettings} />

                    </Modal>
                )}


            {!medicationDetails && (
                <div>
                    <h2 className='text-xl md:text-4xl font-semibold w-full text-center md:mt-12 mt-5' >Search for Prescription</h2>
                    <div className='w-full flex justify-center gap-4 mt-10'>
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Enter medication name"
                            onKeyDown={handleKeyDown}
                            className="rounded-md relative w-1/3 px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                        <button type="button" onClick={handleSearch} className="bg-blue-700 self-center h-full hover:bg-blue-900 text-white font-bold py-2 px-4 rounded ">
                            Search
                        </button>

                    </div>

                </div>

            )}

            <form onSubmit={handleSubmit(onSubmit)}>

                <div className={`mx-auto justify-center w-full ${medicationDetails ? '' : 'mt-10 pt-4'} `}>
                    {filteredMedications?.length > 0 && !manualEntry ? (
                        <div>
                            <h1 className=' mx-auto text-left w-full font-semibold text-lg md:text-3xl p-4'>Select Dosage</h1>
                            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 max-h-80 overflow-auto lg:grid-cols-3 xl:grid-cols-3 w-full mx-auto gap-10 p-4 pt-5'>
                                {filteredMedications.map((medication) => (
                                    <button type="button" className={`${selectedDosage === medication ? 'bg-blue-700 border-slate-100 border-4 border-opacity-60 shadow-green-500' : 'bg-blue-500'} hover:bg-blue-700 text-slate-900 font-bold py-2 px-4 rounded mx-auto w-full shadow-lg shadow-slate-500`} onClick={() => setSelectedDosage(medication)}>
                                        < div >
                                            <img src='/img/pills.png' className='w-12 mx-auto opacity-70' />
                                            <div className='text-lg font-semibold capitalize text-slate-200'>{drugName}</div>
                                            <div className='flex flex-row gap-1 w-full justify-center text-xl text-slate-200'>
                                                <div className={`${medication.dosage.dosage === "N/A" ? 'text-xs' : ''}`}>{medication.dosage.dosage === "N/A" ? "Dosage Unknown" : medication.dosage.dosage}</div>
                                                <div>{medication.dosage.units}</div>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div >
                    ) : null}
                </div>

                {
                    (noResults || selectedDosage || medicationDetails) && <div className='w-full mx-auto'>
                        {noResults && <h1 className='text-xl text-slate-300 w-full text-center'>No Medications Found</h1>}
                        {/* manuually add medication */}
                        <div className={`flex flex-col w-full mx-auto justify-center mt-5 mb-5 ${selectedDosage ? 'pb-5' : 'bg-white pb-14'} p-4 pb-14 pr-10 pl-10`}>
                            {noResults && (<div
                                className='text-3xl text-slate-600 w-full font-semibold text-center mt-2'
                            > Manual Entry
                            </div>
                            )}

                            {noResults && (
                                <div className='flex gap-4 justify-end '>
                                    <div className="flex flex-row mb-5">
                                        <label htmlFor="name" className="text-xs italic">
                                            Alternative Treatment
                                        </label>
                                        <Controller
                                            control={control}
                                            name="alternative"
                                            render={({ field }) => (
                                                <input

                                                    {...register('alternative')}
                                                    type="checkbox"
                                                    autoComplete="off"
                                                    className="rounded-md ml-2 relative block px-3 py-2 border placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                />
                                            )}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className='flex gap-4 justify-end '>
                                <div className="flex flex-row mb-5">
                                    <label htmlFor="name" className="text-2xl font-semibold flex flex-col mr-2">
                                        Active
                                        <span class="text-xs text-gray-400 font-normal italic">(unchecked if discontinued)</span>
                                    </label>
                                    <Controller
                                        control={control}
                                        name="status"
                                        render={({ field }) => (
                                            <input
                                                {...register('status')}
                                                type="checkbox"
                                                autoComplete="off"
                                                className="rounded-md ml-2 w-5 relative block px-3 py-2 border placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                            />
                                        )}
                                    />
                                </div>
                            </div>

                            {/* Name of Medication, and manual entry of dosage, units and frequency */}
                            {!selectedDosage && (<div className='flex flex-row w-full mx-auto gap-4 mt-3'>
                                <div className='flex flex-col justify-center w-full'>
                                    {/* <h1 className='text-left w-full font-semibold text-lg md:text-2xl p-4 pl-0'>Medication Name</h1> */}
                                    <div className='flex flex-row gap-4 w-full '>
                                        <div className="p w-full">
                                            <label htmlFor="name" className="text-md font-semibold">
                                                Name of Medication
                                            </label>
                                            <Controller
                                                control={control}
                                                name="title"
                                                render={({ field }) => (
                                                    <input
                                                        {...register('title', { required: true })}
                                                        type="text"
                                                        autoComplete="off"
                                                        className="rounded-md mt-2 capitalize  w-full px-3 py-2 shadow-md  border placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                    />
                                                )}
                                            />

                                        </div>


                                    </div>
                                </div>

                                <div className='flex flex-col justify-center'>
                                    {/* <h1 className='text-left w-full font-semibold text-lg md:text-3xl p-4'>Dosage</h1> */}
                                    <div className='flex flex-row gap-4 w-full'>
                                        <div className='flex flex-col pl-4'>
                                            <label htmlFor="name" className="text-md font-semibold">
                                                Dosage
                                            </label>
                                            <div className="pt-2">
                                                <Controller
                                                    control={control}
                                                    name="dosage"
                                                    render={({ field }) => (
                                                        <input
                                                            {...register('dosage')}
                                                            type="number"
                                                            autoComplete="off"
                                                            className="rounded-md w-20 px-3 py-2 shadow-md placeholder-gray-500  border text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                        />
                                                    )}
                                                />

                                            </div>
                                        </div>
                                        <div className='flex flex-col w-full'>
                                            <label htmlFor="name" className="text-md font-semibold">
                                                Units
                                            </label>
                                            <Controller
                                                control={control}
                                                name="units"
                                                render={({ field }) => (
                                                    <div {...field} className='h-full pt-2 '>
                                                        <Listbox value={field.value} onChange={field.onChange}>
                                                            <Listbox.Button type="button" className="py-1 pl-3 pr-2 items-center h-full w-full flex justify-between flex-row text-left bg-white rounded shadow-md cursor-default border focus:outline-none focus:ring-1 focus:ring-blue-600">
                                                                <div>{field.value}</div>
                                                                <ChevronDownIcon className="w-3 h-3 ml-4" />
                                                            </Listbox.Button>
                                                            <Listbox.Options className="absolute py-1 mt-1 overflow-auto max-h-28 text-base bg-white rounded-md shadow-lg focus:outline-none z-10">
                                                                {dosageUnits.map((option) => (
                                                                    <Listbox.Option
                                                                        key={option}
                                                                        className={({ active }) => `cursor-default select-none relative py-1 pl-5 pr-4 ${active ? 'text-blue-900 bg-blue-100' : 'text-gray-900'}`}
                                                                        value={option}
                                                                        placeholder='Select a unit'
                                                                    >
                                                                        {({ selected }) => (
                                                                            <>
                                                                                <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`} >
                                                                                    {option}
                                                                                </span>
                                                                            </>
                                                                        )}
                                                                    </Listbox.Option>
                                                                ))}
                                                            </Listbox.Options>
                                                        </Listbox>
                                                    </div>
                                                )}
                                            />
                                        </div>
                                    </div>
                                </div>

                            </div>)}


                            {/* Frequency and Interval */}
                            <div className='flex flex-col justify-center mt-4 w-full'>
                                {/* <h1 className='text-left w-full font-semibold text-lg md:text-3xl p-4 pl-0'>Frequency</h1> */}
                                <div className='flex flex-row gap-4 w-full h-full'>
                                    {/* Times Listbox */}
                                    <div className='flex flex-col w-full'>
                                        <label htmlFor="name" className="text-md font-semibold">
                                            Frequency
                                        </label>
                                        <Controller
                                            control={control}
                                            name="frequency"
                                            render={({ field }) => (
                                                <div {...field} className='h-full pt-2 flex'>
                                                    <Listbox value={field.value} onChange={field.onChange}>
                                                        <Listbox.Button type="button" className="py-1 justify-end pl-3 pr-2 items-center h-10 w-full  flex flex-row  bg-white rounded shadow-md cursor-default border focus:outline-none focus:ring-1 focus:ring-blue-600">
                                                            <div className='line-clamp-1 overflow-scroll capitalize text-left w-full'>{field.value}</div>
                                                            <ChevronDownIcon className="w-3 h-3 ml-4" />
                                                        </Listbox.Button>
                                                        <Listbox.Options className="absolute py-1 mt-11 overflow-auto max-h-28 w-72 text-base bg-white rounded-md shadow-lg focus:outline-none z-10">
                                                            {frequencyOptions.map((option) => (
                                                                <Listbox.Option
                                                                    key={option}
                                                                    className={({ active }) => `cursor-default select-none relative py-1 pl-5 pr-4 ${active ? 'text-blue-900 bg-blue-100' : 'text-gray-900'}`}
                                                                    value={option}
                                                                >
                                                                    {({ selected }) => (
                                                                        <>
                                                                            <span className={`block truncate  ${selected ? 'font-medium' : 'font-normal'}`} >
                                                                                {option}
                                                                            </span>
                                                                        </>
                                                                    )}
                                                                </Listbox.Option>
                                                            ))}
                                                        </Listbox.Options>
                                                    </Listbox>
                                                </div>
                                            )}
                                        />
                                    </div>

                                    {/* Interval Listbox */}
                                    <div className='flex flex-col w-full'>
                                        <label htmlFor="name" className="text-md font-semibold">
                                            Interval
                                        </label>
                                        <Controller
                                            control={control}
                                            name="interval"
                                            render={({ field }) => (
                                                <div {...field} className='h-full pt-2 flex'>
                                                    <Listbox value={field.value} onChange={field.onChange}>
                                                        <Listbox.Button type="button" className="py-1 pl-3 pr-2 justify-end  items-center h-10 w-full flex flex-row text-left bg-white rounded shadow-md cursor-default border focus:outline-none focus:ring-1 focus:ring-blue-600">
                                                            <div className='line-clamp-1 overflow-scroll capitalize text-left w-full'>{field.value}</div>
                                                            <ChevronDownIcon className="w-3 h-3 ml-4" />
                                                        </Listbox.Button>
                                                        <Listbox.Options className="absolute py-1 mt-12 overflow-auto max-h-28 w-72 text-base bg-white rounded-md shadow-lg focus:outline-none z-10">
                                                            {timesOptions.map((option) => (
                                                                <Listbox.Option
                                                                    key={option}
                                                                    className={({ active }) => `cursor-default select-none relative py-1 pl-5 pr-4 ${active ? 'text-blue-900 bg-blue-100' : 'text-gray-900'}`}
                                                                    value={option}
                                                                >
                                                                    {({ selected }) => (
                                                                        <>
                                                                            <span className={`block truncate capitalize ${selected ? 'font-medium' : 'font-normal'}`} >
                                                                                {option}
                                                                            </span>
                                                                        </>
                                                                    )}
                                                                </Listbox.Option>
                                                            ))}
                                                        </Listbox.Options>
                                                    </Listbox>
                                                </div>
                                            )}
                                        />
                                    </div>



                                </div>
                            </div>


                            <div className='flex sm:flex-row flex-col gap-6 w-full mt-4'>
                                <div className='flex flex-col w-full'>
                                    <label htmlFor="name" className="text-md font-semibold">
                                        Start Date
                                    </label>
                                    <div className="pt-2">
                                        <Controller
                                            control={control}
                                            name="startDate"
                                            render={({ field }) => (
                                                <input
                                                    {...register('startDate', { required: true })}
                                                    type="date"
                                                    required
                                                    autoComplete="off"
                                                    value={field.value}
                                                    className="rounded-md w-full px-3 py-2 shadow-md placeholder-gray-500  border text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                />
                                            )}
                                        />
                                    </div>
                                </div>
                                <div className='flex flex-col w-full'>
                                    <label htmlFor="name" className="text-md font-semibold">
                                        End Date
                                    </label>
                                    <div className="pt-2">
                                        <Controller
                                            control={control}
                                            name="endDate"
                                            render={({ field }) => (
                                                <input
                                                    {...register('endDate', { required: false })}
                                                    value={field.value}
                                                    type="date"
                                                    autoComplete="off"
                                                    className="rounded-md w-full px-3 py-2 shadow-md placeholder-gray-500  border text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                />
                                            )}
                                        />
                                    </div>
                                </div>
                            </div >


                            {/* Provider, Diagnosis, Start Date, End Date, Visibility */}
                            <div className='flex sm:flex-row flex-col gap-6 w-full mt-4'>
                                <div className='flex flex-col w-full'>
                                    <label htmlFor="name" className="text-md font-semibold">
                                        Provider
                                    </label>
                                    <div className='w-full'>
                                        <div className=' w-full'>
                                            <Controller
                                                control={control}
                                                name="providers"
                                                defaultValue={currentProvider}
                                                render={({ field, fieldState: { error } }) => (
                                                    <TypeaheadComboBox
                                                        defaultValue={currentProvider}
                                                        items={providersList}
                                                        onValueChange={field.onChange}
                                                        placeholder=""
                                                    />

                                                )}
                                            />

                                        </div>
                                    </div>
                                </div>
                                <div className='flex flex-col w-full'>
                                    <label htmlFor="name" className="text-md font-semibold">
                                        Diagnosis
                                    </label>
                                    <div className='w-full'>
                                        <div className='w-full'>
                                            <Controller
                                                control={control}
                                                name="diagnosis"
                                                defaultValue={currentDiagnoses}
                                                render={({ field, fieldState: { error } }) => (
                                                    <TypeaheadComboBox
                                                        defaultValue={currentDiagnoses}
                                                        items={diagnosesList}
                                                        onValueChange={field.onChange}
                                                        placeholder=""
                                                    />

                                                )}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className='flex flex-col w-full'>
                                    <div className='flex flex-row'>
                                        <label htmlFor="name" className="text-md font-semibold">
                                            Visibility
                                        </label>
                                        {/* create an icon that when clicked, displays each of the level lettings in a modal */}
                                        <button type="button" className='text-blue-500 hover:text-blue-700' onClick={() => setIsVisibilityOpen(true)}>
                                            <InformationCircleIcon className='w-5 h-5 ml-1' />
                                        </button>
                                    </div>

                                    <Controller
                                        control={control}
                                        name="visibility"
                                        rules={{ required: 'Visibility is required' }}
                                        render={({ field, fieldState: { error } }) => (
                                            <div {...field} className='h-full pt-2 '>
                                                {error && <p className="text-red-600 text-semibold text-sm">{error.message}</p>}
                                                <Listbox value={field.value} onChange={field.onChange}>

                                                    <Listbox.Button type="button" className="py-1 pl-3 pr-2 items-center h-full w-full flex justify-between flex-row text-left bg-white rounded shadow-md cursor-default border focus:outline-none focus:ring-1 focus:ring-blue-600">
                                                        <div>{field.value?.label}</div>
                                                        <ChevronDownIcon className="w-3 h-3 ml-4" />
                                                    </Listbox.Button>
                                                    <Listbox.Options className="absolute py-1 mt-1 overflow-auto text-base bg-white rounded-md shadow-lg focus:outline-none z-10 w-52">
                                                        {privacySettings.map((option) => (
                                                            <Listbox.Option
                                                                key={option}
                                                                className={({ active }) => `cursor-default select-none relative py-1 pl-5 pr-4 ${active ? 'text-blue-900 bg-blue-100' : 'text-gray-900'}`}
                                                                value={option}
                                                            >
                                                                {({ selected }) => (
                                                                    <>
                                                                        <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`} >
                                                                            {option.label}
                                                                        </span>
                                                                    </>
                                                                )}
                                                            </Listbox.Option>
                                                        ))}
                                                    </Listbox.Options>
                                                </Listbox>

                                            </div>
                                        )}
                                    />
                                </div>
                            </div >

                            {/* Reason and Notes */}
                            <div className='mt-4'>
                                <div className='flex flex-col w-full'>
                                    <label htmlFor="name" className="text-md font-semibold">
                                        Reason
                                    </label>
                                    <div className="pt-2">
                                        <Controller
                                            name={`reason`}
                                            control={control}
                                            defaultValue={""}
                                            render={({ field }) => (
                                                <textarea
                                                    {...field}
                                                    rows="1"
                                                    type="text"
                                                    autoComplete="off"
                                                    className="rounded-md w-full px-3 py-2 shadow-md placeholder-gray-500  border text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                />
                                            )}
                                        />
                                    </div>
                                </div>
                                <div className='flex flex-col w-full mt-2'>
                                    <label htmlFor="name" className="text-md font-semibold">
                                        Notes
                                    </label>
                                    <div className="pt-2">
                                        <Controller
                                            name={`notes`}
                                            control={control}
                                            defaultValue={""}
                                            render={({ field }) => (
                                                <textarea
                                                    {...field}
                                                    rows="5"
                                                    type="text"
                                                    autoComplete="off"
                                                    className="rounded-md w-full px-3 py-2 shadow-md placeholder-gray-500  border text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                />
                                            )}
                                        />
                                    </div>
                                </div>

                            </div>






                        </div >
                    </div >
                }



                <div className='w-full mx-auto pb-40'>
                    {
                        (noResults || selectedDosage || medicationDetails) && (
                            <>
                                {selectedDosage && <hr className='w-full mx-auto mb-5' />}
                                <button type="submit" className="bg-blue-700 self-center float-right w-1/4  hover:bg-blue-900 text-white font-bold py-2 px-4 rounded ">
                                    Submit
                                </button>
                            </>

                        )
                    }

                </div>

            </form >

        </div >
    );
}


export default MedicationSearch;


