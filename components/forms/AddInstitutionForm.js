import React, { useState, useEffect, Fragment } from "react";
import { useForm, Controller } from "react-hook-form";
import { useMutation, useQueryClient } from "react-query";
import { toast } from "react-hot-toast";
import { useAuth } from "@clerk/nextjs";
import { usePatientContext } from "@/components/context/PatientContext";
import { createInstitutionPOST, updateInstitutionPATCH, useDiagnoses } from "@/hooks/api";
import TypeAheadSearch from "../common/TypeAheadSearch";
import TypeAheadSearchDataSource from "../common/TypeAheadSearchDataSource";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/20/solid";
import { Listbox } from "@headlessui/react";
import { CheckboxGroup } from "../common/CheckBoxGroup";
import AttachmentsForm from "./AttachmentForm";
import Modal from "../Modal";
import { PaperClipIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/router";
import { ControlledMultiSelectTypeahead } from "../common/ControlledMultiSelectTypeAhead";



export default function AddInstitutionForm({ institutionDetails, mode = "add", setEditing }) {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();
  const { patientId } = usePatientContext();
  const [selectedInstitution, setSelectedInstitution] = useState();
  const [addNewSelected, setAddNewSelected] = useState(false);
  const [managesExpanded, setManagesExpanded] = useState(false);
  const [contactInfoExpanded, setContactInfoExpanded] = useState(false);
  const [basicsExpanded, setBasicsExpanded] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [displayAttachments, setDisplayAttachments] = useState(false);
  const [selectedDiagnoses, setSelectedDiagnoses] = useState([]);
  const [diagnosisOptions, setDiagnosisOptions] = useState([]);
  const router = useRouter();

  const statusOptions = [
    { label: "Active", value: "active" },
    { label: "Inactive", value: "inactive" },
  ];

  const { mutate: createInstitution } = useMutation(
    (payload) => createInstitutionPOST({ data: payload, patientId }),
    {
      onSuccess: () => {
        toast.success("Successfully added institution");
        queryClient.invalidateQueries(["institutions"]);
        setIsModalOpen(true);
        setSelectedInstitution(null);
        reset();

      },
      onError: (error) => {
        toast.error("Unable to add intitution" + error);
      },
    }
  );

  const { data: diagnoses } = useDiagnoses(
    {
      id: patientId,
    }
  );

  const { mutate: updateInstitution } = useMutation(
    (payload) => updateInstitutionPATCH({ data: payload, patientId }),
    {
      onSuccess: (data) => {
        toast.success(`Successfully updated institution. ${data.createdLinks > 0 || data.removedLinks > 0 ? `Added ${data.createdLinks} link and removed ${data.removedLinks}` : ''} `);
        queryClient.invalidateQueries(["institution"]);
        queryClient.invalidateQueries(["institutions"]);
        setEditing(false);

      },
      onError: (error) => {
        toast.error("Unable to update institution" + error);
      },
    }
  );


  useEffect(() => {
    if (diagnoses) {
      const transformedDiagnoses = diagnoses?.map((diagnosis) => ({
        label: diagnosis.title,
        value: diagnosis,
        listOrder: diagnosis.listOrder,
      })) || [];
      if (institutionDetails && institutionDetails.diagnoses && institutionDetails.diagnoses.length > 0) {
        const currentDiagnoses = transformedDiagnoses.filter((diagnosis) =>
          institutionDetails.diagnoses.some((d) => d.id === diagnosis.value.id)
        );
        setSelectedDiagnoses(currentDiagnoses);
      }
      setDiagnosisOptions(transformedDiagnoses);
    }
  }, [diagnoses, institutionDetails]);


  const {
    register,
    handleSubmit,
    watch,
    control,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      listOrder: 1,
    },
  });

  const closeModal = () => {
    setDisplayAttachments(false);
    setIsModalOpen(false);
  };


  const onSubmit = async (data) => {
    const token = await getToken();
    // if (!data.image) {
    //   data.image = "/img/emptyInstitution.png";
    // }

    const payload = {
      ...data,
      patientId: patientId,
    };

    if (mode === "add") {
      createInstitution({ payload, token });
    } else {
      updateInstitution({ data: payload, token });
    }

  };


  useEffect(() => {
    if (watch("institution")) {
      setSelectedInstitution(watch("institution"));
    }
  }, [watch("institution")]);

  const closeAttachmentsModal = () => {
    setDisplayAttachments(false);
    setIsModalOpen(false);
  }

  useEffect(() => {
    if (institutionDetails) {
      institutionDetails.postal = institutionDetails.postalCode
      institutionDetails.address1 = institutionDetails.address_1
      institutionDetails.address2 = institutionDetails.address_2
      reset(institutionDetails);
    }
  }, []);

  return (
    <div className="flex items-center self-center justify-center h-1/2">
      {/* Todo: refactor into a component */}
      {isModalOpen && (
        <Modal show={isModalOpen} closeModal={closeModal} fragment={Fragment} size={displayAttachments ? "large" : "small"}>
          {!displayAttachments ? (
            <div className="w-full flex flex-col text-center gap-4 p-2">
              <div className="mx-auto p-2 w-1/4 rounded-lg border bg-slate-900">
                <PaperClipIcon className="w-20 h-20 mx-auto text-slate-100" />
              </div>
              <div className="text-2xl font-semibold mb-10 mt-4">Would you like to add any attachments?</div>

              <div className="w-full flex flex-row justify-center gap-4">
                <button type="button" onClick={() => closeAttachmentsModal()} className="bg-blue-600 text-white p-1 h-10 rounded w-20 ">
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


      <div className="w-full">
        <div className="flex flex-col w-full justify-center">
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Add Institution
          </h2>
          {/* <PhotoUpload
            session={session}
            setValue={setValue}
            name="image"
            type="institution"
          /> */}

        </div>
        <form onSubmit={handleSubmit(onSubmit)} className=" rounded p-3">
          {(!addNewSelected && !institutionDetails) && (
            <div className='flex flex-col w-full'>
              <label htmlFor="name" className="text-md font-semibold">
                Search for Institution
              </label>
              <div className='w-full'>
                <div className='w-full'>
                  <TypeAheadSearchDataSource control={control} name={'institution'} />
                </div>
              </div>
            </div>
          )}

          {(!selectedInstitution && addNewSelected) || institutionDetails ? (
            <div className="rounded-md shadow-sm -space-y-px p-6">
              <div className="flex flex-row justify-between pt-10">
                <h3 className="text-2xl font-bold leading-6 text-gray-900 mb-5">Basics <span className="text-sm font-normal text-gray-600">(required)</span></h3>
                <button type="button" onClick={() => setBasicsExpanded(!basicsExpanded)} className="self-center h-full font-bold pr-2 rounded ">
                  {basicsExpanded ? <ChevronUpIcon className="w-7 h-7" /> : <ChevronDownIcon className="w-7 h-7" />}
                </button>
              </div>


              {basicsExpanded && (
                <>
                  <div className="w-full flex justify-between">
                    <div className="pt-2 w-1/2 sm:w-1/5">
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

                              <Listbox.Button type="button" className="pl-3 pr-2 items-center p-1 h-10 w-full flex justify-between flex-row text-left bg-white rounded shadow-md cursor-default border focus:outline-none focus:ring-1 focus:ring-blue-600">
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
                    <div className="flex flex-col pt-5">
                      <label htmlFor="listOrder" className="text-sm font-medium">
                        List Order
                      </label>
                      <input
                        {...register(`listOrder`)}
                        data-lpignore="true"
                        type="number"
                        required
                        autoComplete="off"
                        className="rounded-md self-center w-20 text-center h-10 text-sm border border-gray-300 placeholder-gray-500 text-gray-900  focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                      />
                    </div>

                  </div>

                  <div className='flex flex-row w-full'>
                    <div className='flex flex-col w-full'>
                      <label htmlFor="title" className="text-sm font-medium">
                        Institution Name
                      </label>
                      <div className="pt-2 w-full">
                        {mode === "add" ? (
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
                        ) : (
                          <div className="text-gray-900 font-semibold text-lg">
                            {institutionDetails.title}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>



                  <div className="grid grid-cols-5 gap-2 pt-4">
                    <div className='col-span-3'>
                      <div className='flex flex-col w-full'>
                        <label htmlFor="address1" className="text-sm font-medium">
                          Address 1
                        </label>
                        {mode === "add" ? (
                          <>
                            <div className="pt-2 w-full">
                              <Controller
                                control={control}
                                name="address1"
                                render={({ field }) => (
                                  <input
                                    {...register('address1', { required: true })}
                                    type="text"
                                    autoComplete="off"
                                    className="rounded-md px-3 w-full py-2 shadow-md placeholder-gray-500  border text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                  />
                                )}
                              />

                            </div></>

                        ) : (
                          <div className="text-gray-900 font-semibold text-lg">
                            {institutionDetails.address_1}
                          </div>
                        )}

                      </div>
                    </div>
                    <div className='flex flex-row col-span-2'>
                      <div className='flex flex-col w-full'>
                        <label htmlFor="address2" className="text-sm font-medium">
                          Address 2
                        </label>
                        {mode === "add" ? (
                          <div className="pt-2 w-full">
                            <Controller
                              control={control}
                              name="address2"
                              render={({ field }) => (
                                <input
                                  {...register('address2')}
                                  type="text"
                                  autoComplete="off"
                                  className="rounded-md px-3 w-full py-2 shadow-md placeholder-gray-500  border text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                />
                              )}
                            />

                          </div>) : (
                          <div className="text-gray-900 font-semibold text-lg">
                            {institutionDetails.address_2}
                          </div>
                        )
                        }

                      </div>
                    </div>
                  </div>
                  {/* These all need to be revised to be drop downs  */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 w-full gap-2 pt-4">
                    <div className='flex flex-col cols-span-1'>
                      <label htmlFor="city" className="text-sm font-medium">
                        City
                      </label>
                      {mode === "add" ? (<div className="pt-2 w-full">
                        <Controller
                          control={control}
                          name="city"
                          render={({ field }) => (
                            <input
                              {...register('city', { required: true })}
                              type="text"
                              autoComplete="off"
                              className="rounded-md px-3 w-full py-2 shadow-md placeholder-gray-500  border text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                          )}
                        />

                      </div>) : (
                        <div className="text-gray-900 font-semibold text-lg">
                          {institutionDetails.city}
                        </div>
                      )}

                    </div>
                    <div className='flex flex-col cols-span-1'>
                      <label htmlFor="state" className="text-sm font-medium">
                        State
                      </label>
                      {mode === "add" ? (
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
                      ) : (
                        <div className="text-gray-900 font-semibold text-lg">
                          {institutionDetails.state}
                        </div>
                      )}
                    </div>

                    <div className='flex flex-col cols-span-1'>
                      <label htmlFor="country" className="text-sm font-medium">
                        Country
                      </label>
                      {mode === "add" ? (<div className="pt-2 w-full">
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

                      </div>) : (
                        <div className="text-gray-900 font-semibold text-lg">
                          {institutionDetails.country}
                        </div>
                      )}

                    </div>
                    <div className='flex flex-col cols-span-1'>
                      <label htmlFor="postal" className="text-sm font-medium">
                        Postal
                      </label>
                      {mode === "add" ? (

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
                      ) : (
                        <div className="text-gray-900 font-semibold text-lg">
                          {institutionDetails.postalCode}
                        </div>
                      )}
                    </div>
                  </div>


                </>
              )}

              <div className="flex flex-row justify-between pt-10">
                <h3 className="text-xl font-bold leading-6 text-gray-900 mb-5">Diagnoses Managed</h3>
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



              <div className="flex flex-row justify-between pt-10">
                <h3 className="text-xl font-bold leading-6 text-gray-900 mb-5">Contact / Notes</h3>
                <button type="button" onClick={() => setContactInfoExpanded(!contactInfoExpanded)} className="self-center h-full font-bold pr-2 rounded ">
                  {contactInfoExpanded ? <ChevronUpIcon className="w-7 h-7" /> : <ChevronDownIcon className="w-7 h-7" />}
                </button>
              </div>



              {contactInfoExpanded && (
                <>
                  {/* patient institution details */}
                  <div className="">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col pt-4
                      ">
                        <label htmlFor="recordsOfficeEmail" className="text-sm font-medium">
                          Records Office Email
                        </label>
                        <div className="pt-2">
                          <Controller
                            control={control}
                            name="recordsOfficeEmail"
                            render={({ field }) => (
                              <input
                                {...register('recordsOfficeEmail')}
                                type="text"
                                autoComplete="off"
                                className="rounded-md px-3 w-full py-2 shadow-md placeholder-gray-500  border text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              />
                            )}
                          />

                        </div>
                      </div>
                      <div className="pt-4 flex flex-col">
                        <label htmlFor="recordsOfficePhone" className="text-sm font-medium">
                          Records Office Phone
                        </label>
                        <div className="pt-2 w-full">
                          <Controller
                            control={control}
                            name="recordsOfficePhone"
                            render={({ field }) => (
                              <input
                                {...register('recordsOfficePhone')}
                                type="tel"
                                autoComplete="off"
                                className="rounded-md px-3 w-full py-2 shadow-md placeholder-gray-500  border text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              />
                            )}
                          />

                        </div>
                      </div>
                    </div>

                    <div>
                      {/* notes  */}
                      <div className="pt-4 flex flex-col">
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

                </>
              )}


            </div>
          ) : (
            <div className="w-full  flex justify-center mt-10 mb-5 flex-col">
              {!selectedInstitution && (
                <div className="w-full flex justify-center flex-col">

                  <div className="text-gray-800 w-full text-center">No results found? </div>
                  <div className="w-full flex justify-center">
                    <button
                      type="button"
                      onClick={() => setAddNewSelected(true)}
                      className="mt-2 group  w-1/5 flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-400 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Add New Institution
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {selectedInstitution && (
            < div className="">
              <div className="flex flex-row justify-between">
                <h3 className="text-2xl font-bold leading-6 text-gray-900 mb-5">Basics <span className="text-sm font-normal text-gray-600">(required)</span></h3>
                <button type="button" onClick={() => setBasicsExpanded(!basicsExpanded)} className="self-center h-full font-bold pr-2 rounded ">
                  {basicsExpanded ? <ChevronUpIcon className="w-7 h-7" /> : <ChevronDownIcon className="w-7 h-7" />}
                </button>
              </div>

              {basicsExpanded && (
                <div>
                  <div className="w-full flex flex-row justify-between">
                    <div className="pt-2 w-1/2 sm:w-1/5">
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
                    <div className="flex flex-col pt-5">
                      <label htmlFor="listOrder" className="text-sm font-medium">
                        List Order
                      </label>
                      <input
                        {...register(`listOrder`)}
                        data-lpignore="true"
                        type="number"
                        required
                        autoComplete="off"
                        className="rounded-md self-center w-20 text-center h-10 text-sm border border-gray-300 placeholder-gray-500 text-gray-900  focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col">
                      <label htmlFor="recordsOfficeEmail" className="text-sm font-medium">
                        Records Office Email
                      </label>
                      <div className="pt-2">
                        <Controller
                          control={control}
                          name="recordsOfficeEmail"
                          render={({ field }) => (
                            <input
                              {...register('recordsOfficeEmail')}
                              type="text"
                              autoComplete="off"
                              className="rounded-md px-3 w-full py-2 shadow-md placeholder-gray-500  border text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                          )}
                        />

                      </div>
                    </div>
                    <div className="flex flex-col">
                      <label htmlFor="recordsOfficePhone" className="text-sm font-medium">
                        Records Office Phone
                      </label>
                      <div className="pt-2 w-full">
                        <Controller
                          control={control}
                          name="recordsOfficePhone"
                          render={({ field }) => (
                            <input
                              {...register('recordsOfficePhone')}
                              type="tel"
                              autoComplete="off"
                              className="rounded-md px-3 w-full py-2 shadow-md placeholder-gray-500  border text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                          )}
                        />

                      </div>
                    </div>
                  </div>
                  <div>
                    {/* notes  */}
                    <div className="pt-4 flex flex-col">
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
              )}

              <div className="flex flex-row justify-between pt-5">
                <h3 className="text-xl font-bold leading-6 text-gray-900 mb-5">Diagnoses Managed</h3>
                <button type="button" onClick={() => setManagesExpanded(!managesExpanded)} className="self-center h-full font-bold pr-2 rounded ">
                  {managesExpanded ? <ChevronUpIcon className="w-7 h-7" /> : <ChevronDownIcon className="w-7 h-7" />}
                </button>
              </div>

              {managesExpanded && (
                <div className=" max-h-24 overflow-scroll">
                  <CheckboxGroup
                    control={control}
                    name="diagnoses"
                    options={diagnoses}
                  />

                </div>
              )}

              <div className="flex flex-row justify-between pt-10">
                <h3 className="text-xl font-bold leading-6 text-gray-900 mb-5">Attachment</h3>
                <button type="button" onClick={() => setIsModalOpen(!isModalOpen)} className="bg-blue-600 text-white p-1 h-10 rounded w-20 ">
                  Add
                </button>
              </div>


            </div>
          )}





          < div >
            <button
              type="submit"
              className="mt-20 group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Submit
            </button>
          </div >
        </form >
      </div >
    </div >
  );
}
