import React, { useEffect, useState, Fragment } from "react";
import { useForm, Controller } from "react-hook-form";
import { useMutation } from "react-query";
import { toast } from "react-hot-toast";
import { createProviderPOST, updateProviderPATCH, useGetProvidersFromNpi } from "@/hooks/api";
import TypeaheadComboBox from "@/components/common/TypeaheadComboBox";

import { capitalizeWords } from "@/utils/helpers";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/20/solid";
import { Listbox } from "@headlessui/react";
import { useAuth } from "@clerk/nextjs";
import { usePatientContext } from "@/components/context/PatientContext";
import { useInstitutions, useDiagnoses } from "@/hooks/api";
import { CheckboxGroup } from "./common/CheckBoxGroup";
import { useQueryClient } from "react-query";
import Modal from "./Modal";
import AttachmentsForm from "./forms/AttachmentForm";
import { PaperClipIcon } from "@heroicons/react/20/solid";
import { useRouter } from "next/router";
import { ControlledMultiSelectTypeahead } from "./common/ControlledMultiSelectTypeAhead";
import SingleSelectDropdown from "./common/SingleSelectDropDown";


export default function AddProviderForm({ providerAdded, mode = "add" }) {
  const { getToken } = useAuth();
  const { patientId } = usePatientContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [displayAttachments, setDisplayAttachments] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      status: "active",
      listOrder: 0,
      city: null,
      state: null,
      primaryContact: false,
    },
  });

  const statusOptions = [
    { label: "Active", value: "active" },
    { label: "Inactive", value: "inactive" },
  ];

  const primaryContactOptions = [
    { label: "Yes", value: "yes" },
    { label: "No", value: "no" },
  ];



  const [providerFirstName, setProviderFirstName] = useState();
  const [providerLastName, setProviderLastName] = useState();
  const [providerState, setProviderState] = useState();
  const [selectedProvider, setSelectedProvider] = useState();
  const [contactInfoExpanded, setContactInfoExpanded] = useState(false);
  const [basicsExpanded, setBasicsExpanded] = useState(false);
  const [managesExpanded, setManagesExpanded] = useState(false);
  const [triggerSearch, setTriggerSearch] = useState(false);
  const [currentInstitution, setCurrentInstitution] = useState();
  const [selectedDiagnoses, setSelectedDiagnoses] = useState([]);
  const [diagnosisOptions, setDiagnosisOptions] = useState([]);
  const { data: providers, refetch } = useGetProvidersFromNpi({
    providerFirstName,
    providerLastName,
    providerState,
    searchTrigger: triggerSearch,
  });
  const [institutionOptions, setInstitutionOptions] = useState([]);
  const queryClient = useQueryClient();
  const router = useRouter();


  const { data: institutions } = useInstitutions(
    {
      id: patientId,
    }
  );

  const { data: diagnoses } = useDiagnoses(
    {
      id: patientId,
    }
  );

  const closeModal = () => {
    setDisplayAttachments(false);
    setIsModalOpen(false);
  };

  const { mutate: createProvider } = useMutation(
    (payload) => createProviderPOST({ data: payload, patientId }),
    {
      onSuccess: () => {
        toast.success("Successfully added provider");
        queryClient.invalidateQueries(["providers"]);
        setSelectedProvider(null)
        setIsModalOpen(true);
        reset();
      },
      onError: (error) => {
        toast.error("Unable to add provider" + error);
      },
    }
  );




  //transform into the shape expected by select
  useEffect(() => {
    if (institutions) {
      const transformedInstitutions = institutions?.map((institution) => ({
        label: institution.title,
        value: institution,
      })) || [];
      setInstitutionOptions(transformedInstitutions);

      if (providerAdded?.institutions.length > 0) {
        const institution = transformedInstitutions.find((institution) => institution.value.institutionId === providerAdded.institutions[0].institutionId);
        setCurrentInstitution(institution);

      }
    }
  }, [institutions]);


  const handleValueChange = (item) => {
    setProviderState(item.value);
  };

  const handleSearch = async () => {
    try {
      setTriggerSearch(prev => !prev);
      if (providers.result_count > 0) {
        setReturnedProviders(response.results);
      } else {
        toast.error("No providers found");
      }
    } catch (error) {
      console.error('Error fetching providers', error);
    }
  };


  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  const stateOptions = [
    { value: 'AL', label: 'Alabama' },
    { value: 'AK', label: 'Alaska' },
    { value: 'AZ', label: 'Arizona' },
    { value: 'AR', label: 'Arkansas' },
    { value: 'CA', label: 'California' },
    { value: 'CO', label: 'Colorado' },
    { value: 'CT', label: 'Connecticut' },
    { value: 'DE', label: 'Delaware' },
    { value: 'FL', label: 'Florida' },
    { value: 'GA', label: 'Georgia' },
    { value: 'HI', label: 'Hawaii' },
    { value: 'ID', label: 'Idaho' },
    { value: 'IL', label: 'Illinois' },
    { value: 'IN', label: 'Indiana' },
    { value: 'IA', label: 'Iowa' },
    { value: 'KS', label: 'Kansas' },
    { value: 'KY', label: 'Kentucky' },
    { value: 'LA', label: 'Louisiana' },
    { value: 'ME', label: 'Maine' },
    { value: 'MD', label: 'Maryland' },
    { value: 'MA', label: 'Massachusetts' },
    { value: 'MI', label: 'Michigan' },
    { value: 'MN', label: 'Minnesota' },
    { value: 'MS', label: 'Mississippi' },
    { value: 'MO', label: 'Missouri' },
    { value: 'MT', label: 'Montana' },
    { value: 'NE', label: 'Nebraska' },
    { value: 'NV', label: 'Nevada' },
    { value: 'NH', label: 'New Hampshire' },
    { value: 'NJ', label: 'New Jersey' },
    { value: 'NM', label: 'New Mexico' },
    { value: 'NY', label: 'New York' },
    { value: 'NC', label: 'North Carolina' },
    { value: 'ND', label: 'North Dakota' },
    { value: 'OH', label: 'Ohio' },
    { value: 'OK', label: 'Oklahoma' },
    { value: 'OR', label: 'Oregon' },
    { value: 'PA', label: 'Pennsylvania' },
    { value: 'RI', label: 'Rhode Island' },
    { value: 'SC', label: 'South Carolina' },
    { value: 'SD', label: 'South Dakota' },
    { value: 'TN', label: 'Tennessee' },
    { value: 'TX', label: 'Texas' },
    { value: 'UT', label: 'Utah' },
    { value: 'VT', label: 'Vermont' },
    { value: 'VA', label: 'Virginia' },
    { value: 'WA', label: 'Washington' },
    { value: 'WV', label: 'West Virginia' },
    { value: 'WI', label: 'Wisconsin' },
    { value: 'WY', label: 'Wyoming' }
  ];

  const { mutate: updateProvider } = useMutation(
    (payload) => updateProviderPATCH({ data: payload, patientId }),
    {
      onSuccess: (data) => {
        toast.success(`Successfully updated provider. ${data.createdLinks > 0 || data.removedLinks > 0 ? `Added ${data.createdLinks} link and removed ${data.removedLinks}` : ''} `);
        queryClient.invalidateQueries(["provider", providerAdded.providerId]);

      },
      onError: (error) => {
        toast.error("Unable to update provider" + error);
      },
    }
  );


  const onSubmit = async (data) => {
    const token = await getToken();
    //transform any existing into the right shape 
    if (data.diagnoses && data.diagnoses.length > 0 && !data.diagnoses[0]?.value) {
      data.diagnoses = diagnosisOptions.filter((diagnosis) =>
        data.diagnoses.some((d) => d.id === diagnosis.value.id)
      );
    }


    const payload = {
      ...data,
      token: token,
      selectedProvider: selectedProvider,
      providerFirstName: mode === "editing" ? providerAdded.firstName : capitalizeWords(selectedProvider.basic.first_name),
      providerMiddleInitial: mode === "editing" ? providerAdded.middleInitial : selectedProvider.basic.middle_name?.charAt(0).toUpperCase(),
      providerLastName: mode === "editing" ? providerAdded.lastName : capitalizeWords(selectedProvider.basic.last_name),
      providerDesignation: mode === "editing" ? providerAdded.designation : selectedProvider.basic.credential,
      // institution: selectedInstitution,
      patientId: patientId,
    };

    if (mode === "editing") {
      updateProvider({ payload, token })
    } else {
      createProvider(payload);
    }

  };

  useEffect(() => {
    if (providerState) {
      setValue('state', providerState);
    }

    if (selectedProvider) {
      const city = capitalizeWords(selectedProvider.addresses[0]?.city.toLowerCase());
      setValue('city', city);
      setValue('state', selectedProvider.addresses[0]?.state);

      setValue('country', selectedProvider.addresses[0]?.country_code);
    }
  }, [providerState, selectedProvider])

  useEffect(() => {
    if (providerAdded) {
      providerAdded.postal = providerAdded.postalCode
      reset(providerAdded);
    }
  }, []);

  useEffect(() => {
    if (diagnoses) {
      const transformedDiagnoses = diagnoses?.map((diagnosis) => ({
        label: diagnosis.category !== "allergy" ? diagnosis.title : `${diagnosis.title} (${diagnosis.category})`,
        value: diagnosis,
        listOrder: diagnosis.listOrder,
      })) || [];

      if (providerAdded && providerAdded.diagnoses && providerAdded.diagnoses.length > 0) {
        const currentDiagnoses = transformedDiagnoses.filter((diagnosis) =>
          providerAdded.diagnoses.some((d) => d.id === diagnosis.value.id)
        );
        setSelectedDiagnoses(currentDiagnoses);
      }
      setDiagnosisOptions(transformedDiagnoses);
    }
  }, [diagnoses, providerAdded]);


  return (
    <div className="w-full flex justify-center mx-auto flex-col">
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
      {(!selectedProvider && !providerAdded && mode !== "editing") && (
        <div className='w-ful flex-col flex gap-4 mt-10'>
          <div className="text-3xl font-semibold w-full text-center mt-10">Providers Search</div>
          <input
            type="text"
            value={providerFirstName}
            onChange={(e) => setProviderFirstName(e.target.value)}
            placeholder="Provider First Name"
            onKeyDown={handleKeyDown}
            className="rounded-md md:w-1/3 w-full capitalize self-center relative px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />

          <input
            type="text"
            value={providerLastName}
            onChange={(e) => setProviderLastName(e.target.value)}
            placeholder="Provider Last Name"
            onKeyDown={handleKeyDown}
            className="rounded-md md:w-1/3 w-full self-center relative capitalize px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
          <div className='w-full flex justify-center'>
            <div className='md:w-1/3 w-full flex justify-center'>
              {/* combo box for the state selection  */}
              <TypeaheadComboBox items={stateOptions} onValueChange={handleValueChange} placeholder={"Select a state"} marginTop={'mt-12'} />
            </div>

          </div>
          <div className="mt-10 w-full flex justify-center">
            <button type="button" onClick={handleSearch} className="bg-blue-700 self-center h-full hover:bg-blue-900 text-white font-bold py-2 px-4 rounded ">
              Search
            </button>
          </div>
        </div>

      )}

      {/* display the results of the search */}
      <div className="w-full flex mx-auto flex-col">
        <div className={`justify-center ${mode === "add" ? 'mt-10' : ''}`}>
          {mode === "editing" && (
            <h1 className='text-center w-full font-semibold text-lg md:text-3xl'>{providerAdded?.firstName} {providerAdded?.lastName} {providerAdded?.designation}</h1>
          )}
          {providers?.results?.length > 0 ? (
            <div>
              <h1 className=' mx-auto text-left w-full font-semibold text-lg md:text-3xl p-4'>Select Provider</h1>
              <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 max-h-80 overflow-auto lg:grid-cols-3 xl:grid-cols-5 w-full mx-auto gap-5 p-4 pt-5'>
                {providers.results.map((provider) => (
                  <button type="button" className={`${selectedProvider === provider ? 'bg-blue-700 border-slate-100 border-4 border-opacity-60 shadow-green-500' : 'bg-blue-500'} hover:bg-blue-700 text-slate-900 font-bold py-2 px-4 rounded mx-auto w-full shadow-lg shadow-slate-500`} onClick={() => setSelectedProvider(provider)}>
                    <div >
                      <div className='flex flex-col w-full justify-center text-xl text-slate-200'>
                        <div className="capitalize text-sm w-full text-right">{provider.addresses[0]?.city?.toLowerCase()}, {providerState}</div>
                        <div className="mt-2">{capitalizeWords(provider.basic.first_name)} {capitalizeWords(provider.basic.middle_name?.slice(0, 1).toLowerCase())} {capitalizeWords(provider.basic.last_name?.toLowerCase())}</div>
                        <div className="text-sm h-5 mb-5"> {provider.basic.credential}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div >
          ) : null}
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="rounded p-3">
          {(selectedProvider || providerAdded) && (
            <div className="rounded-md shadow-sm -space-y-px pl-2">
              <div className="flex flex-row justify-between pt-5">
                <h3 className="text-xl font-bold leading-6 text-gray-900">Basics <span className="text-sm font-normal text-gray-600">(required)</span></h3>
                <button type="button" onClick={() => setBasicsExpanded(!basicsExpanded)} className="self-center h-full font-bold pr-2 rounded ">
                  {basicsExpanded ? <ChevronUpIcon className="w-7 h-7" /> : <ChevronDownIcon className="w-7 h-7" />}
                </button>
              </div>
              {basicsExpanded && (
                <div>
                  {/* This needs to be revised, should use a drag a drop method or determine a better method to order institutions- will need to shift the others */}
                  <div className="flex flex-row justify-between gap-2">
                    <div className="w-full lg:w-1/3 pt-2">
                      <label htmlFor="primary" className="text-sm font-medium">
                        Institution
                      </label>
                      <Controller
                        control={control}
                        name="institution"
                        defaultValue={currentInstitution}
                        render={({ field, fieldState: { error } }) => (
                          <TypeaheadComboBox
                            defaultValue={currentInstitution}
                            items={institutionOptions}
                            onValueChange={field.onChange}
                            placeholder=""
                          />

                        )}
                      />

                    </div>
                    <div className="mt-3 flex flex-col lg:col-span-1 col-span-2">
                      <label htmlFor="listOrder" className="text-sm font-medium">
                        List Order
                      </label>
                      <input
                        {...register(`listOrder`)}
                        data-lpignore="true"
                        type="number"
                        required
                        autoComplete="off"
                        className="rounded-md mt-2 shadow-md w-20 text-center h-10 text-sm border  placeholder-gray-500 text-gray-900  focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                      />
                    </div>

                  </div>
                  <div className="grid xl:grid-cols-12 grid-cols-1 lg:gap-2">
                    <div className='flex flex-col mt-3 md:col-span-4 col-span-2'>
                      <label htmlFor="role" className="text-sm font-medium">
                        Role
                      </label>
                      <div className="pt-2">
                        <Controller
                          control={control}
                          name="role"
                          render={({ field }) => (
                            <input
                              {...register('role', { required: true })}
                              type="text"
                              autoComplete="off"
                              className="rounded-md px-3 w-full py-2 shadow-md placeholder-gray-500  border text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                          )}
                        />

                      </div>
                    </div>
                    <div className="pt-2 col-span-2">
                      <label htmlFor="status" className="text-sm font-medium">
                        Status
                      </label>
                      <Controller
                        control={control}
                        name="status"
                        rules={{ required: 'Status is required' }}
                        render={({ field, fieldState: { error } }) => (
                          <div {...field} className='h-full pt-2 pb-10'>
                            {error && <p className="text-red-600 text-semibold text-sm">{error.message}</p>}
                            <Listbox value={field.value} onChange={field.onChange}>

                              <Listbox.Button className="pl-3 pr-2 items-center p-1 h-10 w-full flex justify-between flex-row text-left bg-white rounded shadow-md cursor-default border focus:outline-none focus:ring-1 focus:ring-blue-600">
                                <div className="capitalize">{field.value}</div>
                                <ChevronDownIcon className="w-3 h-3 ml-4" />
                              </Listbox.Button>
                              <Listbox.Options className="absolute py-1 overflow-auto text-base bg-white rounded-md shadow-lg focus:outline-none z-10 w-52">
                                {statusOptions.map((option) => (
                                  <Listbox.Option
                                    key={option}
                                    required
                                    className={({ active }) => `cursor-default select-none relative py-1 pl-5 pr-4 ${active ? 'text-blue-900 bg-blue-100' : 'text-gray-900'}`}
                                    value={option.value}

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
                    <div className="col-span-2 md:pt-2">
                      <label htmlFor="primary" className="text-sm font-medium">
                        Primary Contact
                      </label>
                      <div className="mt-2">
                        <Controller
                          control={control}
                          name="primaryContact"
                          render={({ field, fieldState: { error } }) => (
                            <div {...field} className='h-full pb-10'>
                              <SingleSelectDropdown
                                defaultValue={field.value ? primaryContactOptions[0] : primaryContactOptions[1]}
                                items={primaryContactOptions}
                                onValueChange={field.onChange}
                                placeholder=""
                              />
                            </div>
                          )}
                        />
                      </div>

                    </div>

                    <div className='col-span-3 flex flex-col md:flex-row mt-2 gap-2'>
                      <div className='flex flex-col w-full mt-1'>
                        <label htmlFor="name" className="text-sm font-semibold">
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
                      <div className='flex flex-col w-full mt-1'>
                        <label htmlFor="name" className="text-sm font-semibold">
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

                  </div>
                  {/* Title Email */}
                  <div className="w-full grid lg:grid-cols-9 grid-cols-1 gap-2 md:mt-4 mt-4">
                    <div className='flex flex-col col-span-2 lg:col-span-3 lg:mt-0'>
                      <label htmlFor="title" className="text-sm font-medium">
                        Title
                      </label>
                      <div className="">
                        <Controller
                          control={control}
                          name="title"
                          render={({ field }) => (
                            <input
                              {...register('title', { required: true })}
                              type="text"
                              autoComplete="off"
                              className="rounded-md px-3 w-full py-2 shadow-md placeholder-gray-500  border text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                          )}
                        />

                      </div>
                    </div>
                    <div className='flex flex-col col-span-2 mt-3 lg:mt-0'>
                      <label htmlFor="email" className="text-sm font-medium">
                        Email
                      </label>
                      <div className="">
                        <Controller
                          control={control}
                          name="email"
                          render={({ field }) => (
                            <input
                              {...register('email', { required: true })}
                              type="text"
                              autoComplete="off"
                              className="rounded-md px-3 w-full py-2 shadow-md placeholder-gray-500  border text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                          )}
                        />

                      </div>
                    </div>
                    <div className='flex flex-col col-span-2 lg:col-span-4 mt-3 lg:mt-0'>
                      <label htmlFor="link" className="text-sm font-medium">
                        Link
                      </label>
                      <div className="">
                        <Controller
                          control={control}
                          name="link"
                          render={({ field }) => (
                            <input
                              {...register('link', { required: true })}
                              type="text"
                              autoComplete="off"
                              className="rounded-md px-3 w-full py-2 shadow-md placeholder-gray-500  border text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                          )}
                        />

                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-row justify-between pt-10">
                <h3 className="text-xl font-bold leading-6 text-gray-900">Contact Information</h3>
                <button type="button" onClick={() => setContactInfoExpanded(!contactInfoExpanded)} className="self-center h-full font-bold pr-2 rounded ">
                  {contactInfoExpanded ? <ChevronUpIcon className="w-7 h-7" /> : <ChevronDownIcon className="w-7 h-7" />}
                </button>
              </div>

              {contactInfoExpanded && (
                <>
                  {/* Fax, cell, phone, nurses-line, after hours */}
                  < div className="w-full grid gird-cols-1 lg:grid-cols-8 gap-2 pt-2">
                    <div className='flex flex-col mt-3 col-span-2'>
                      <label htmlFor="fax" className="text-sm font-medium">
                        Fax
                      </label>
                      <div className="pt-2">
                        <Controller
                          control={control}
                          name="fax"
                          render={({ field }) => (
                            <input
                              {...register('fax')}
                              type="text"
                              autoComplete="off"
                              className="rounded-md px-3 w-full py-2 shadow-md placeholder-gray-500  border text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                          )}
                        />

                      </div>
                    </div>
                    <div className='flex flex-col mt-3 col-span-2'>
                      <label htmlFor="cell" className="text-sm font-medium">
                        Cell
                      </label>
                      <div className="pt-2">
                        <Controller
                          control={control}
                          name="cell"
                          render={({ field }) => (
                            <input
                              {...register('cell', { required: true })}
                              type="text"
                              autoComplete="off"
                              className="rounded-md px-3 w-full py-2 shadow-md placeholder-gray-500  border text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                          )}
                        />

                      </div>
                    </div>
                    <div className='flex flex-col mt-3 col-span-2'>
                      <label htmlFor="nursesLine" className="text-sm font-medium">
                        Nurse's Line
                      </label>
                      <div className="pt-2">
                        <Controller
                          control={control}
                          name="nursesLine"
                          render={({ field }) => (
                            <input
                              {...register('nursesLine', { required: true })}
                              type="text"
                              autoComplete="off"
                              className="rounded-md px-3 w-full py-2 shadow-md placeholder-gray-500  border text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                          )}
                        />

                      </div>
                    </div>
                    <div className='flex flex-col mt-3 col-span-2'>
                      <label htmlFor="afterHours" className="text-sm font-medium">
                        After Hours
                      </label>
                      <div className="pt-2">
                        <Controller
                          control={control}
                          name="afterHours"
                          render={({ field }) => (
                            <input
                              {...register('afterHours', { required: true })}
                              type="text"
                              autoComplete="off"
                              className="rounded-md px-3 w-full py-2 shadow-md placeholder-gray-500  border text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                          )}
                        />

                      </div>
                    </div>

                  </div>
                  {/* Address  */}
                  <div className="grid grid-cols-5 gap-2 pt-4">
                    <div className='col-span-3'>
                      <div className='flex flex-col w-full'>
                        <label htmlFor="address_1" className="text-sm font-medium">
                          Address 1
                        </label>
                        <div className="pt-2 w-full">
                          <Controller
                            control={control}
                            name="address_1"
                            render={({ field }) => (
                              <input
                                {...register('address_1')}
                                type="text"
                                autoComplete="off"
                                className="rounded-md px-3 w-full py-2 shadow-md placeholder-gray-500  border text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              />
                            )}
                          />

                        </div>
                      </div>
                    </div>
                    <div className='flex flex-row col-span-2'>
                      <div className='flex flex-col w-full'>
                        <label htmlFor="address_2" className="text-sm font-medium">
                          Address 2
                        </label>
                        <div className="pt-2 w-full">
                          <Controller
                            control={control}
                            name="address_2"
                            render={({ field }) => (
                              <input
                                {...register('address_2')}
                                type="text"
                                autoComplete="off"
                                className="rounded-md px-3 w-full py-2 shadow-md placeholder-gray-500  border text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              />
                            )}
                          />

                        </div>
                      </div>
                    </div>
                  </div>
                  {/* These all need to be revised to be drop downs  */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 w-full gap-2 pt-4">
                    <div className='flex flex-col cols-span-1'>
                      <label htmlFor="city" className="text-sm font-medium">
                        City
                      </label>
                      <div className="pt-2 w-full">
                        <Controller
                          control={control}
                          name="city"
                          render={({ field }) => (
                            <input
                              {...register('city')}
                              type="text"
                              autoComplete="off"
                              className="rounded-md px-3 w-full py-2 shadow-md placeholder-gray-500  border text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                          )}
                        />

                      </div>
                    </div>
                    <div className='flex flex-col cols-span-1'>
                      <label htmlFor="state" className="text-sm font-medium">
                        State
                      </label>
                      <div className="pt-2 w-full">
                        <Controller
                          control={control}
                          name="state"
                          render={({ field }) => (
                            <input
                              {...register('state', { required: true })}
                              type="text"
                              autoComplete="off"
                              className="rounded-md px-3 w-full py-2 shadow-md placeholder-gray-500  border text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                          )}
                        />

                      </div>
                    </div>

                    <div className='flex flex-col cols-span-1'>
                      <label htmlFor="country" className="text-sm font-medium">
                        Country
                      </label>
                      <div className="pt-2 w-full">
                        <Controller
                          control={control}
                          name="country"
                          render={({ field }) => (
                            <input
                              {...register('country', { required: true })}
                              type="text"
                              autoComplete="off"
                              className="rounded-md px-3 w-full py-2 shadow-md placeholder-gray-500  border text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                          )}
                        />

                      </div>
                    </div>
                    <div className='flex flex-col cols-span-1'>
                      <label htmlFor="postal" className="text-sm font-medium">
                        Postal
                      </label>
                      <div className="pt-2 w-full">
                        <Controller
                          control={control}
                          name="postal"
                          render={({ field }) => (
                            <input
                              {...register('postal', { required: true })}
                              type="text"
                              autoComplete="off"
                              className="rounded-md px-3 w-full py-2 shadow-md placeholder-gray-500  border text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                          )}
                        />

                      </div>
                    </div>
                  </div>
                </>
              )}

              <div className="flex flex-row justify-between pt-10">
                <h3 className="text-xl font-bold leading-6 text-gray-900">Manages</h3>
                <button type="button" onClick={() => setManagesExpanded(!managesExpanded)} className="self-center h-full font-bold pr-2 rounded ">
                  {managesExpanded ? <ChevronUpIcon className="w-7 h-7" /> : <ChevronDownIcon className="w-7 h-7" />}
                </button>
              </div>

              {managesExpanded && (
                <div className="pt-5">
                  <ControlledMultiSelectTypeahead
                    control={control}
                    name="diagnoses"
                    data={diagnosisOptions}
                    defaultValue={selectedDiagnoses}
                    placeholder="Select Diagnoses"
                  />
                </div>
              )}

              <div className="pt-10">
                <hr className="border-gray-200 mb-5" />
                <div>
                  {/* notes  */}
                  <div className="flex flex-col">
                    <label htmlFor="notes" className="text-sm font-medium">
                      Notes
                    </label>
                    <div className="pt-2 w-full">
                      <Controller
                        control={control}
                        name="notes"
                        render={({ field }) => (
                          <textarea
                            {...register('notes')}
                            rows="5"
                            type="text"
                            autoComplete="off"
                            className="rounded-md px-3 w-full py-2 shadow-md placeholder-gray-500  border text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          />
                        )}
                      />

                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}


          {(selectedProvider || providerAdded) && (
            <div>
              <button
                type="submit"
                className="mt-10 mb-5 group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Submit
              </button>
            </div >
          )}

        </form >
      </div >


    </div >

  )
};