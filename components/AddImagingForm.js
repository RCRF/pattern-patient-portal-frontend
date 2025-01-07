import React, { useState, useEffect, Fragment } from "react";
import { useForm, Controller } from "react-hook-form";
import PhotoUpload from "./common/PhotoUpload";
import { useMutation, useQueryClient } from "react-query";
import { toast } from "react-hot-toast";
import { useAuth } from "@clerk/nextjs";
import { usePatientContext } from "@/components/context/PatientContext";
import { createImagingPOST, createInstitutionPOST, updateImagingPATCH, useDiagnoses, useProviders } from "@/hooks/api";
import TypeAheadSearch from "./common/TypeAheadSearch";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/20/solid";
import { Listbox } from "@headlessui/react";
import { CheckboxGroup } from "./common/CheckBoxGroup";
import MultiSelectTypeahead from "./common/MultiSelectTypeAheadCombo";
import MultiSelectDropdown from "./common/MultiSelectDropDown";
import SingleSelectDropdown from "./common/SingleSelectDropDown";
import { useInstitutions } from "@/hooks/api";
import Modal from "../components/Modal";
import AttachmentsForm from "./forms/AttachmentForm";
import { PaperClipIcon } from "@heroicons/react/20/solid";
import { useRouter } from "next/router";
import { capitalizeFirstLetterOfWords } from "@/utils/helpers";
import TypeaheadComboBox from "./common/TypeaheadComboBox";
import { ControlledMultiSelectTypeahead } from "./common/ControlledMultiSelectTypeAhead";




export default function AddImagingForm({ image, mode = "add" }) {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();
  const { patientId } = usePatientContext();
  const [institutionOptions, setInstitutionOptions] = useState([]);
  const [diagnosisOptions, setDiagnosisOptions] = useState([]);
  const [managesExpanded, setManagesExpanded] = useState(false);
  const [detailsExpanded, setDetailsExpanded] = useState(false);
  const [basicsExpanded, setBasicsExpanded] = useState(true);
  const [providersList, setProvidersList] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [displayAttachments, setDisplayAttachments] = useState(false);
  const [currentProvider, setCurrentProvider] = useState(null);
  const [currentInstitution, setCurrentInstitution] = useState(null);
  const [currentStatus, setCurrentStatus] = useState(null);
  const [currentLocations, setCurrentLocations] = useState([]);
  const [selectedDiagnoses, setSelectedDiagnoses] = useState([]);
  const router = useRouter();

  const { data: providers } = useProviders();
  const { data: institutions } = useInstitutions(
    {
      id: patientId,
    }
  );


  const closeModal = () => {
    setDisplayAttachments(false);
    setIsModalOpen(false);
  };

  const { mutate: createImagingRecord } = useMutation(
    (payload) => createImagingPOST({ data: payload }),
    {
      onSuccess: () => {
        toast.success("Successfully added imaging record");
        queryClient.invalidateQueries(["imaging"]);
        setIsModalOpen(true);
        reset()
      },
      onError: (error) => {
        toast.error("Unable to add imaging record" + error);
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

      if (image && image.orderingProvider && image.orderingProvider.length > 0) {
        const currentProvider = providersArray.find((provider) => provider.value.providerId === image.orderingProvider[0].id);
        setCurrentProvider(currentProvider);
      }
      setProvidersList(providersArray);
    }
  }, [providers]);

  useEffect(() => {
    if (institutions) {
      const transformedInstitutions = institutions?.map((institution) => ({
        label: institution.title,
        value: institution,
      })) || [];
      if (image && image.institution && image.institution.length > 0) {
        const currentInstitution = transformedInstitutions.find((institution) => institution.value.institutionId === image.institution[0].id);
        setCurrentInstitution(currentInstitution);
      }
      setInstitutionOptions(transformedInstitutions);
    }
  }, [institutions]);


  const { data: diagnoses } = useDiagnoses(
    {
      id: patientId,
    }
  );

  useEffect(() => {
    if (diagnoses) {
      const transformedDiagnoses = diagnoses?.map((diagnosis) => ({
        label: diagnosis.title,
        value: diagnosis,
        listOrder: diagnosis.listOrder,
      })) || [];
      if (image && image.diagnoses && image.diagnoses.length > 0) {
        const currentDiagnoses = transformedDiagnoses.filter((diagnosis) =>
          image.diagnoses.some((d) => d.id === diagnosis.value.id)
        );
        setSelectedDiagnoses(currentDiagnoses);
      }
      setDiagnosisOptions(transformedDiagnoses);
    }
  }, [diagnoses, image]);


  const imagingModalities = [
    { id: 1, modality: 'X-ray', description: 'A type of electromagnetic radiation used to create images of the inside of the body.', abbreviation: 'cr' },
    { id: 2, modality: 'CT scan', description: 'A type of X-ray that uses a computer to create detailed images of the inside of the body.', abbreviation: 'ct' },
    { id: 3, modality: 'MRI', description: 'A type of imaging that uses a magnetic field and radio waves to create detailed images of the inside of the body.', abbreviation: 'mr' },
    { id: 4, modality: 'Ultrasound', description: 'A type of imaging that uses high-frequency sound waves to create images of the inside of the body.', abbreviation: 'us' },
    { id: 5, modality: 'PET scan', description: 'A type of imaging that uses a radioactive substance to create images of the inside of the body.', abbreviation: 'pt' },
    { id: 6, modality: 'Bone scan', description: 'A type of imaging that uses a radioactive substance to create images of the bones.', abbreviation: 'nm' },
    { id: 7, modality: 'Mammogram', description: 'A type of X-ray used to create images of the breast.', abbreviation: 'mg' },
    { id: 8, modality: 'Fluoroscopy', description: 'A type of X-ray that uses a continuous beam of X-rays to create real-time images of the inside of the body.', abbreviation: 'rf' },
    { id: 9, modality: 'Angiography', description: 'A type of X-ray used to create images of the blood vessels.', abbreviation: 'xa' },
    { id: 10, modality: 'Interventional radiology', description: 'A type of imaging used to guide minimally invasive procedures, such as biopsies and catheter insertions.', abbreviation: 'xa' },
    { id: 11, modality: 'Nuclear medicine', description: 'A type of imaging that uses a radioactive substance to create images of the inside of the body.', abbreviation: 'nm' },
    { id: 12, modality: 'Magnetic resonance angiography (MRA)', description: 'A type of MRI used to create images of the blood vessels.', abbreviation: 'mr' },
    { id: 13, modality: 'Computed tomography angiography (CTA)', description: 'A type of CT scan used to create images of the blood vessels.', abbreviation: 'ct' },
    { id: 14, modality: 'Positron emission tomography (PET)', description: 'A type of imaging that uses a radioactive substance to create images of the inside of the body.', abbreviation: 'pt' },
    { id: 15, modality: 'Single-photon emission computed tomography (SPECT)', description: 'A type of imaging that uses a radioactive substance to create images of the inside of the body.', abbreviation: 'nm' },
    { id: 16, modality: 'Sestamibi', description: 'A type of imaging that uses a radioactive substance to create images of the inside of the body.', abbreviation: 'nm' },
    { id: 29, modality: 'Red blood cell scan', description: 'A type of imaging that uses a radioactive substance to create images of the inside of the body.', abbreviation: 'nm' },
    { id: 30, modality: 'Other CT', description: 'Other CT imaging studies not listed', abbreviation: 'ct' },
    { id: 31, modality: 'Other MR', description: 'Other MR imaging studies not listed', abbreviation: 'mr' },
    { id: 32, modality: 'Other NM', description: 'Other NM imaging studies not listed', abbreviation: 'nm' },
  ];

  const imagingCategories = [
    { label: 'Head', value: 'Head' },
    { label: 'Neck', value: 'Neck' },
    { label: 'Chest', value: 'Chest' },
    { label: 'Abdomen', value: 'Abdomen' },
    { label: 'Pelvis', value: 'Pelvis' },
    { label: 'Spine', value: 'Spine' },
    { label: 'Extremities', value: 'Extremities' },
    { label: 'Other', value: 'Other' },
  ]

  const convertedModatlities = imagingModalities.map((modality) => {
    return {
      label: modality.modality,
      value: modality.abbreviation,
    };
  });

  //when modality and location is selected, construct a title based on the selected values
  const constructTitle = (modality, location) => {
    if (!modality || !location) return '';
    const locationString = capitalizeFirstLetterOfWords(location.join('/'));
    const modalityTitle = capitalizeFirstLetterOfWords(imagingModalities.find((mod) => mod.id === modality).modality);

    return `${modalityTitle} ${locationString}`;
  };


  useEffect(() => {
    if (image) {
      reset(image);
      if (image?.status) {
        const status = statusOptions.find((status) => status.value === image.status);
        setCurrentStatus(status);
      }
      if (image.metadata.locations) {
        const currentLocations = imagingCategories.filter((category) =>
          image.metadata.locations.some(location => location === category.value)
        );
        setCurrentLocations(currentLocations);
      }
    }



  }, [image]);

  useEffect(() => {
    if (institutions) {
      const transformedInstitutions = institutions?.map((institution) => ({
        label: institution.title,
        value: institution,
      })) || [];
      setInstitutionOptions(transformedInstitutions);
      if (image?.institutions) {
        //filter institution options to current institution 
        const institution = transformedInstitutions.find((institution) => institution.value.institutionId === image.institutionId);

        setCurrentInstitution(institution);
      }
    }


  }, [institutions, image]);





  const {
    register,
    handleSubmit,
    watch,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      listOrder: 1,
    },
  });

  const { mutate: updateImaging } = useMutation(
    (payload) => updateImagingPATCH({ data: payload, patientId }),
    {
      onSuccess: (data) => {
        toast.success(`Successfully updated imaging. ${data.createdLinks > 0 || data.removedLinks > 0 ? `Added ${data.createdLinks} link and removed ${data.removedLinks}` : ''} `);
        queryClient.invalidateQueries(["imaging"]);

      },
      onError: (error) => {
        toast.error("Unable to update imaging" + error);
      },
    }
  );


  const onSubmit = async (data) => {
    const token = await getToken();
    data.metadata = {
      locations: data.metadata.locations.map((location) => location.value),
    };
    //transform any existing into the right shape 
    data.diagnoses = diagnosisOptions.filter((diagnosis) =>
      data.diagnoses.some((d) => d.id === diagnosis.value.id)
    );

    if (mode === 'editing') {
      updateImaging({ data, token })
    } else {
      data.token = token;
      createImagingRecord(data);
    }


  };


  const statusOptions = [
    { label: "No Evidence of Disease", value: "ned" },
    { label: "Stable Disease", value: "stable" },
    { label: "Progressive Disease", value: "progression" },
    { label: "Partial Response", value: "partial response" },
    { label: "Mixed Response", value: "mixed response" },
    { label: "Abnormal Finding", value: "abnormal finding" },
    { label: "Decrease in Lesion Size", value: "decrease" },
    { label: "Not Evaluated", value: "not evaluated" },
  ];

  useEffect(() => {
    if (mode === 'add') {
      const modality = watch('modality');
      const location = watch('location');
      const title = constructTitle(modality, location);
      setValue('title', title);
    }
  }, [watch('modality'), watch('location')]);



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
          <h2 className="text-center text-3xl font-extrabold text-gray-900 mb-5 mt-5">

            {mode == "add" ? 'Add New Imaging' : image?.title || 'Edit Imaging'}
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
                <div className="grid lg:grid-cols-8 grid-cols-1 gap-2">
                  <div className='col-span-1 lg:col-span-2'>
                    <label htmlFor="name" className="text-sm font-medium">
                      Provider
                    </label>
                    <div className='w-full'>
                      <div className='pt-2 w-full'>
                        <Controller
                          control={control}
                          name="provider"
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

                  <div className='col-span-1 lg:col-span-3'>
                    <label htmlFor="name" className="text-sm font-medium">
                      Institution
                    </label>
                    <div className='w-full'>
                      <div className='pt-2 w-full'>
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
                    </div>
                  </div>
                  <div className='lg:col-span-3 col-span-1 gap-2'>

                    <div className="flex flex-row gap-2">
                      <div className='flex flex-col w-1/2'>
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
                      <div className='lg:col-span-3 col-span-1 w-1/2'>
                        <label htmlFor="name" className="text-sm font-semibold">
                          End Date
                        </label>
                        <div className="pt-1">
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
                </div>



                <div className="grid grid-cols-1 lg:grid-cols-8 gap-2 mt-5">
                  <div className="col-span-1 lg:col-span-2">
                    <label htmlFor="status" className="text-sm font-medium">
                      Status
                    </label>
                    <Controller
                      control={control}
                      name="status"
                      rules={{ required: 'Status is required' }}
                      render={({ field, fieldState: { error } }) => (
                        <div {...field} className='h-fullpb-10'>
                          <SingleSelectDropdown
                            defaultValue={currentStatus}
                            items={statusOptions}
                            onValueChange={field.onChange}
                            placeholder="Select Status"
                          />
                        </div>
                      )}
                    />

                  </div>
                  <div className="col-span-1 lg:col-span-2 self-center">
                    <label htmlFor="modality" className="text-sm font-medium">
                      Modality
                    </label>
                    <Controller
                      control={control}
                      name="modality"
                      render={({ field }) => (
                        <SingleSelectDropdown
                          items={convertedModatlities}
                          onValueChange={field.onChange}
                          placeholder="Select Imaging Modality"
                          maxHeight={'lg:max-h-[200px] max-h-[400px]'}
                        />
                      )}
                    />
                  </div>
                  <div className="col-span-1 lg:col-span-3 self-center">
                    <label htmlFor="metadata.locations" className="text-sm font-medium">
                      Location
                    </label>
                    <Controller
                      control={control}
                      name="metadata.locations"
                      render={({ field }) => (
                        <MultiSelectDropdown
                          defaultValue={currentLocations}
                          items={imagingCategories}
                          onValueChange={(newSelection) => field.onChange(newSelection)}

                          placeholder="Select Imaging Location"
                          maxHeight={150}
                        />
                      )}
                    />
                  </div>
                  <div className="col-span-1 lg:col-span-1 self-center">
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
                        className="rounded-md text-center h-10 text-sm border border-gray-300 placeholder-gray-500 text-gray-900  focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                      />
                    </div>
                  </div>

                </div>



              </div>

            )}

            <div className="flex flex-row justify-between pt-10">
              <h3 className="text-xl font-bold leading-6 text-gray-900">Details</h3>
              <button type="button" onClick={() => setDetailsExpanded(!detailsExpanded)} className="self-center h-full font-bold pr-2 rounded ">
                {detailsExpanded ? <ChevronUpIcon className="w-7 h-7" /> : <ChevronDownIcon className="w-7 h-7" />}
              </button>
            </div>

            {
              detailsExpanded && (
                <div>
                  <div className='grid grid-cols-1 w-full mt-5'>
                    <div className='col-span-1 lg:col-span-3'>
                      <label htmlFor="reason" className="text-sm font-medium">
                        Title
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
                  </div>
                  <div className='grid grid-cols-1 w-full mt-5'>
                    <div className='flex flex-col w-full mt-2'>
                      <label htmlFor="title" className="text-sm font-medium">
                        Impression
                      </label>
                      <div className="pt-2 w-full">
                        <Controller
                          control={control}
                          name="impression"
                          render={({ field }) => (
                            <textarea
                              {...register('impression', { required: true })}
                              rows="4"
                              type="text"
                              autoComplete="off"
                              className="rounded-md px-3 w-full py-2 shadow-md placeholder-gray-500  border text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                          )}
                        />

                      </div>
                    </div>
                  </div>


                  <div className="grid grid-cols-1 lg:grid-cols-6 gap-2 mt-4">
                    <div className='col-span-1 lg:col-span-3'>
                      <label htmlFor="reason" className="text-sm font-medium">
                        Reason
                      </label>
                      <div className="pt-2 w-full">
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
                    <div className='col-span-1 lg:col-span-3'>
                      <div className='flex flex-col w-full'>
                        <label htmlFor="report" className="text-sm font-medium">
                          Report
                        </label>
                        <div className="pt-3 w-full">
                          <Controller
                            control={control}
                            name="report"
                            render={({ field }) => (
                              <input
                                {...register('report', { required: true })}
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
                  <div className='col-span-1 lg:col-span-3 mt-7'>
                    <div className='flex flex-col w-full'>
                      <label htmlFor="report" className="text-sm font-medium">
                        Diagnoses
                      </label>
                      <ControlledMultiSelectTypeahead
                        control={control}
                        name="diagnoses"
                        data={diagnosisOptions}
                        defaultValue={selectedDiagnoses}
                        placeholder="Select Diagnoses"
                      />
                    </div>
                  </div>

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
              )
            }

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


      </div>


    </div>
  );
}
