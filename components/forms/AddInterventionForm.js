import React, { useState, useEffect, Fragment, use } from "react";
import { useForm, Controller } from "react-hook-form";
import PhotoUpload from "../common/PhotoUpload";
import { useMutation, useQueryClient } from "react-query";
import { toast } from "react-hot-toast";
import { useAuth } from "@clerk/nextjs";
import { usePatientContext } from "@/components/context/PatientContext";
import { useDiagnoses, useProviders, useInstitutions, createInterventionPOST, updateInterventionLinksPATCH } from "@/hooks/api";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/20/solid";
import MultiSelectDropdown from "../common/MultiSelectDropDown";
import SingleSelectDropdown from "../common/SingleSelectDropDown";
import TypeaheadComboBox from "../common/TypeaheadComboBox";
import Modal from "../../components/Modal";
import AttachmentsForm from "./AttachmentForm";
import { PaperClipIcon } from "@heroicons/react/20/solid";
import { useRouter } from "next/router";
import { ControlledMultiSelectTypeahead } from "../common/ControlledMultiSelectTypeAhead";
import { organs } from "@/utils/helpers";



export default function AddInterventionForm({ intervention, mode = "add" }) {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();
  const { patientId } = usePatientContext();
  const [detailsExpanded, setDetailsExpanded] = useState(false);
  const [basicsExpanded, setBasicsExpanded] = useState(false);
  const [providersList, setProvidersList] = useState([]);
  const [currentInstitution, setCurrentInstitution] = useState();
  const [institutionOptions, setInstitutionOptions] = useState([]);
  const [diagnosisOptions, setDiagnosisOptions] = useState([]);
  const [currentDiagnosis, setCurrentDiagnosis] = useState();
  const [currentProvidersList, setCurrentProvidersList] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [displayAttachments, setDisplayAttachments] = useState(false);
  const [currentOrgans, setCurrentOrgans] = useState([]);
  const router = useRouter();

  const { data: providers } = useProviders();
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


  const categories = [
    { label: "Interventional", value: "interventional" },
    { label: "Diagnostic", value: "diagnostic" },
    { label: "Surgical", value: "surgical" },
    { label: "Therapeutic", value: "therapeutic" },
    { label: "Other", value: "other" },
  ]

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      listOrder: 1,
    },
  });
  useEffect(() => {
    if (institutions) {
      const transformedInstitutions = institutions?.map((institution) => ({
        label: institution.title,
        value: institution,
      })) || [];
      setInstitutionOptions(transformedInstitutions);
      if (intervention?.institutions) {
        //filter institution options to current institution 
        const institution = transformedInstitutions.find((institution) => institution.value.institutionId === intervention.institutionId);
        setCurrentInstitution(institution);
      }

      if (diagnoses) {
        const transformedDiagnoses = diagnoses?.map((diagnosis) => ({
          label: diagnosis.title,
          value: diagnosis,
          listOrder: diagnosis.listOrder,
        })) || [];
        setDiagnosisOptions(transformedDiagnoses);

        if (intervention?.diagnosisId) {
          const diagnosis = transformedDiagnoses.find((diagnosis) => diagnosis.value.id === intervention.diagnosisId);
          setCurrentDiagnosis(diagnosis);
        }

      }
      //set the form value for category to the current intervention category
      if (intervention?.category) {
        setValue('category', categories.find((category) => category.value === intervention.category));
      }


      if (intervention?.metadata?.organs) {
        const currentOrgans = organs.filter((organ) => intervention.metadata.organs.includes(organ.value));
        setCurrentOrgans(currentOrgans);
      }


    }


  }, [institutions, diagnoses, intervention]);


  const { mutate: createIntervention } = useMutation(
    (payload) => createInterventionPOST({ data: payload, patientId }),
    {
      onSuccess: () => {
        toast.success("Successfully added intervention");
        queryClient.invalidateQueries(["intervention"]);
        setIsModalOpen(true);
        reset();
        //push back to homepage 
        router.push('/dashboard');
      },
      onError: (error) => {
        toast.error("Unable to add intervention" + error);
      },
    }
  );

  const { mutate: updateIntervention } = useMutation(
    (payload) => updateInterventionLinksPATCH({ data: payload, patientId }),
    {
      onSuccess: (data) => {
        toast.success(`Successfully updated intervention. ${data.createdLinks > 0 || data.removedLinks > 0 ? `Added ${data.createdLinks} link and removed ${data.removedLinks}` : ''} `);
        queryClient.invalidateQueries(["intervention"]);

      },
      onError: (error) => {
        toast.error("Unable to update intervention" + error);
      },
    }
  );




  useEffect(() => {
    if (providers) {
      const providersArray = providers.map((provider) => {
        return {
          value: provider,
          label: `${provider.firstName} ${provider.lastName}, ${provider.designation}`,
        };
      });
      setProvidersList(providersArray);
    }
  }, [providers]);


  useEffect(() => {
    if (intervention) {
      //set the useForm details 
      reset(intervention);
    }

  }, [intervention]);

  useEffect(() => {
    if (intervention?.providers?.length > 0) {
      const providersArray = intervention.providers.map((provider) => {
        return {
          value: provider,
          label: `${provider.firstName} ${provider.lastName}, ${provider.designation}`,
        };
      });

      setCurrentProvidersList(providersArray);
    }

  }, [intervention]);



  const onSubmit = async (data) => {
    const token = await getToken();

    // pull just the values from the providers 
    data.providers = data.providers.map((provider) => {
      return {
        id: provider.value ? provider.value.providerId : provider.providerId,
        firstName: provider.value ? provider.value.firstName : provider.firstName,
        lastName: provider.value ? provider.value.lastName : provider.lastName,
        designation: provider.value ? provider.value.designation : provider.designation,
      };
    });
    data.institutionId = data.institution ? data.institution.institutionId : data.institutionId;
    data.diagnosisId = data.diagnosis ? data.diagnosis.id : data.diagnosisId
    data.category = data.category.value ? data.category.value : data.category;

    if (mode !== 'add') {
      data.organs?.length > 0 ? data.organs.map((organ) => organ.value) : data.organs = data.metadata?.organs;
      updateIntervention({ data, token })
    } else {
      createIntervention({ data, token })
    }


  };


  return (
    <div className="flex items-center self-center justify-center h-1/2">
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
      <div className="w-full p-5">
        <div className="flex flex-col w-full justify-center">
          <h2 className={`text-center text-3xl font-extrabold text-gray-900 mb-5 ${intervention ? 'mt-2' : 'mt-12'}`} >
            {intervention ? intervention.title : "Add New Intervention"}
          </h2>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className=" rounded p-3">

          <div className="rounded-md shadow-sm -space-y-px p-6">
            <div className="flex flex-row justify-between pt-5">
              <h3 className="text-xl font-bold leading-6 text-gray-900">Basics <span className="text-sm font-normal text-gray-600">(required)</span></h3>
              <button type="button" onClick={() => setBasicsExpanded(!basicsExpanded)} className="self-center h-full font-bold pr-2 rounded ">
                {basicsExpanded ? <ChevronUpIcon className="w-7 h-7" /> : <ChevronDownIcon className="w-7 h-7" />}
              </button>
            </div>
            {basicsExpanded && (
              <div className="w-full">
                <div className="grid grid-cols-1 lg:grid-cols-9 gap-2 mt-4">
                  <div className='col-span-1 lg:col-span-4'>
                    <label htmlFor="title" className="text-sm font-medium">
                      Intervention Title
                    </label>
                    <div className="pt-2 w-full">
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
                  <div className='col-span-1 lg:col-span-4'>
                    <div className='flex flex-col w-full'>
                      <label htmlFor="reason" className="text-sm font-medium">
                        Reason
                      </label>
                      <div className="pt-3 w-full">
                        <Controller
                          control={control}
                          name="reason"
                          render={({ field }) => (
                            <input
                              {...register('reason', { required: true })}
                              type="text"
                              autoComplete="off"
                              className="rounded-md px-3 w-full py-2 shadow-md placeholder-gray-500  border text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                          )}
                        />

                      </div>
                    </div>
                  </div>
                  <div className="col-span-1 lg:col-span-1 self-center mt-1">
                    <div className="flex flex-col ">
                      <label htmlFor="listOrder" className="text-sm font-medium">
                        List Order
                      </label>
                      <input
                        {...register(`listOrder`)}
                        data-lpignore="true"
                        type="number"
                        required
                        autoComplete="off"
                        min="0"
                        className="rounded-md text-center h-10 shadow-md mt-2 text-sm border placeholder-gray-500 text-gray-900  focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                      />
                    </div>
                  </div>

                </div>

                <div className="grid lg:grid-cols-9 grid-cols-1 gap-2 mt-4">
                  <div className='col-span-1 lg:col-span-9'>
                    <label htmlFor="providers" className="text-sm font-medium">
                      Providers
                    </label>
                    <div className='w-full'>
                      <div className=' w-full'>
                        <ControlledMultiSelectTypeahead
                          control={control}
                          name="providers"
                          data={providersList}
                          defaultValue={currentProvidersList}
                          placeholder="Select Providers"
                        />
                      </div>
                    </div>
                  </div>

                </div>
                <div className="grid lg:grid-cols-6 grid-cols-1 gap-2 mt-4">
                  <div className='lg:col-span-5 col-span-1 gap-2'>
                    <div className="flex flex-row gap-2">
                      <div className='flex flex-col w-1/2'>
                        <label htmlFor="name" className="text-sm font-semibold">
                          Start Date
                        </label>
                        <div className="pt-1">
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
                      <div className='lg:col-span-3 col-span-1 w-1/2'>
                        <label htmlFor="name" className="text-sm font-semibold">
                          End Date
                        </label>
                        <div className="">
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

                    </div>
                  </div >

                  <div className="col-span-1 lg:col-span-1 self-center">
                    <div className="flex flex-col ">
                      <label htmlFor="daysAdmitted" className="text-sm font-medium line-clamp-1">
                        Days Admitted
                      </label>
                      <input
                        {...register(`daysAdmitted`)}
                        data-lpignore="true"
                        type="number"
                        required
                        min="0"
                        autoComplete="off"
                        className="rounded-md text-center h-10 shadow-md mt-1 text-sm border placeholder-gray-500 text-gray-900  focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-row justify-between pt-10">
              <h3 className="text-xl font-bold leading-6 text-gray-900">Details <span className="text-sm font-normal text-gray-600">(required)</span></h3>
              <button type="button" onClick={() => setDetailsExpanded(!detailsExpanded)} className="self-center h-full font-bold pr-2 rounded ">
                {detailsExpanded ? <ChevronUpIcon className="w-7 h-7" /> : <ChevronDownIcon className="w-7 h-7" />}
              </button>
            </div>

            {
              detailsExpanded && (
                <div>
                  <div className="grid grid-cols-1 lg:grid-cols-8 gap-2 mt-5">
                    <div className="col-span-1 lg:col-span-3">
                      <label htmlFor="institution" className="text-sm font-medium">
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
                    <div className="col-span-1 lg:col-span-3">
                      <label htmlFor="diagnosis" className="text-sm font-medium">
                        Diagnosis
                      </label>
                      <Controller
                        control={control}
                        name="diagnosis"
                        defaultValue={currentDiagnosis}
                        render={({ field, fieldState: { error } }) => (
                          <TypeaheadComboBox
                            defaultValue={currentDiagnosis}
                            items={diagnosisOptions}
                            onValueChange={field.onChange}
                            placeholder=""
                          />
                        )}
                      />
                    </div>

                    <div className="col-span-1 lg:col-span-2 self-center">
                      <label htmlFor="cateogry" className="text-sm font-medium">
                        Category
                      </label>
                      <Controller
                        control={control}
                        name="category"
                        render={({ field }) => (
                          <SingleSelectDropdown
                            items={categories}
                            defaultValue={intervention && intervention.category ? categories.find((category) => category.value === intervention.category) : null}
                            onValueChange={field.onChange}
                            placeholder="Select Intervention Category"
                            maxHeight={'lg:max-h-[200px] max-h-[400px]'}
                          />
                        )}
                      />
                    </div>




                  </div>

                  <div className='grid grid-cols-1 lg:grid-cols-8 gap-2 mt-4'>

                    <div className='col-span-3 self-center'>
                      <label htmlFor="result" className="text-sm font-medium">
                        Result
                      </label>
                      <div className="mt-1 w-full">
                        <Controller
                          control={control}
                          name="result"
                          render={({ field }) => (
                            <input
                              {...register('result', { required: true })}
                              type="result"
                              autoComplete="off"
                              className="rounded-md px-3 w-full py-2 h-10 shadow-md placeholder-gray-500  border text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                          )}
                        />

                      </div>
                    </div>
                    <div className="col-span-5 self-center">
                      <label htmlFor="Location" className="text-sm font-medium">
                        Location / Organs
                      </label>
                      <div className="mt-1">
                        <Controller
                          control={control}
                          name="organs"
                          defaultValue={currentOrgans}
                          render={({ field }) => (
                            <MultiSelectDropdown
                              items={organs.sort((a, b) => {
                                if (a.label < b.label) {
                                  return -1;
                                }
                                if (a.label > b.label) {
                                  return 1;
                                }
                                return 0;
                              })}
                              defaultValue={currentOrgans}
                              onValueChange={field.onChange}
                              placeholder="Select organs"
                              maxHeight={'lg:max-h-[200px] max-h-[400px]'}
                            />
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-10 gap-2 mt-5">


                  </div>



                </div>
              )
            }


            {/* notes  */}
            <div className="pt-6 flex flex-col">
              <label htmlFor="notes" className="text-sm font-medium">
                Notes
              </label>
              <div className="mt-2 w-full">
                <Controller
                  control={control}
                  name="notes"
                  render={({ field }) => (
                    <textarea
                      {...register('notes', { required: true })}
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
          <div >
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
