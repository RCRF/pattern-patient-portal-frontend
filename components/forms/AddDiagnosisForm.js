import React, { useState, useEffect, Fragment, use } from "react";
import { useForm, Controller } from "react-hook-form";
import PhotoUpload from "../common/PhotoUpload";
import { useMutation, useQueryClient } from "react-query";
import { toast } from "react-hot-toast";
import { useAuth } from "@clerk/nextjs";
import { usePatientContext } from "@/components/context/PatientContext";
import { useDiagnoses, useProviders, useInstitutions, createDiagnosisPOST, useGetAllSubtypes, useGetAllCancers, updateDiagnosisPATCH } from "@/hooks/api";
import TypeAheadSearch from "../common/TypeAheadSearch";
import TypeAheadSearchDataSource from "../common/TypeAheadSearchDataSource";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/20/solid";
import { Listbox } from "@headlessui/react";
import { CheckboxGroup } from "../common/CheckBoxGroup";
import MultiSelectTypeahead from "../common/MultiSelectTypeAheadCombo";
import MultiSelectDropdown from "../common/MultiSelectDropDown";
import SingleSelectDropdown from "../common/SingleSelectDropDown";
import TypeaheadComboBox from "../common/TypeaheadComboBox";
import Modal from "../Modal";
import AttachmentsForm from "./AttachmentForm";
import { PaperClipIcon } from "@heroicons/react/20/solid";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import ColorPicker from "../common/ColorPicker";
import { useRouter } from "next/router";


export default function AddDiagnosisForm({ diagnosis, mode = "add" }) {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();
  const { patientId } = usePatientContext();
  const [detailsExpanded, setDetailsExpanded] = useState(false);
  const [basicsExpanded, setBasicsExpanded] = useState(true);
  const [providersList, setProvidersList] = useState([]);
  const [institutionOptions, setInstitutionOptions] = useState([]);
  const [diagnosisOptions, setDiagnosisOptions] = useState([]);
  const [cancerTypes, setCancerTypes] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [displayAttachments, setDisplayAttachments] = useState(false);
  const [selectedCancerType, setSelectedCancerType] = useState(null);
  //todo: could refactor this to use the form state instead of individual state variables
  const [subtypeOptions, setSubtypeOptions] = useState([]);
  const [currentStatus, setCurrentStatus] = useState(null);
  const [currentDiseaseStatus, setCurrentDiseaseStatus] = useState(null);
  const [currentProviders, setCurrentProviders] = useState([]);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [currentCancerType, setCurrentCancerType] = useState(null);
  const [currentSubtype, setCurrentSubtype] = useState(null);
  const [currentStage, setCurrentStage] = useState(null);
  const [currentGrade, setCurrentGrade] = useState(null);
  const [currentOrgans, setCurrentOrgans] = useState([]);
  const [currentInstitutions, setCurrentInstitutions] = useState([]);



  const router = useRouter();

  const { data: providers } = useProviders();
  const { data: institutions } = useInstitutions(
    {
      id: patientId,
    }
  );
  const { data: cancers } = useGetAllCancers();


  const closeModal = () => {
    setDisplayAttachments(false);
    setIsModalOpen(false);
    reset();
    //push back to homepage 
    router.push('/dashboard');
  };

  useEffect(() => {
    if (institutions) {
      const transformedInstitutions = institutions?.map((institution) => ({
        label: institution.title,
        value: institution,
      })) || [];
      setInstitutionOptions(transformedInstitutions);
    }
  }, [institutions]);


  const { mutate: createDiagnosis } = useMutation(
    (payload) => createDiagnosisPOST({ data: payload, patientId }),
    {
      onSuccess: () => {
        toast.success("Successfully added diagnosis");
        queryClient.invalidateQueries(["diagnosis"]);
        setIsModalOpen(true);
        reset();
      },
      onError: (error) => {
        toast.error("Unable to add diagnosis" + error);
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
      setDiagnosisOptions(transformedDiagnoses);
    }
  }, [diagnoses]);

  const organs = [
    { label: 'Brain', value: 'Brain' },
    { label: 'Lung', value: 'Lung' },
    { label: 'Heart', value: 'Heart' },
    { label: 'Liver', value: 'Liver' },
    { label: 'Kidney', value: 'Kidney' },
    { label: 'Stomach', value: 'Stomach' },
    { label: 'Intestines', value: 'Intestines' },
    { label: 'Bladder', value: 'Bladder' },
    { label: 'Reproductive Organs', value: 'Reproductive Organs' },
    { label: 'Bones', value: 'Bones' },
    { label: 'Joints', value: 'Joints' },
    { label: 'Muscles', value: 'Muscles' },
    { label: 'Skin', value: 'Skin' },
    { label: 'Blood Vessels', value: 'Blood Vessels' },
    { label: 'Lymph Nodes', value: 'Lymph Nodes' },
    { label: 'Breast', value: 'Breast' },
    { label: 'Appendix', value: 'Appendix' },
    { label: 'Thyroid', value: 'Thyroid' },
    { label: 'Pancreas', value: 'Pancreas' },
    { label: 'Adrenal Glands', value: 'Adrenal Glands' },
    { label: 'Pituitary Gland', value: 'Pituitary Gland' },
    { label: 'Parathyroid Glands', value: 'Parathyroid Glands' },
    { label: 'Thymus', value: 'Thymus' },
    { label: 'Spine', value: 'Spine' },
    { label: 'Shoulder', value: 'Shoulder' },
    { label: 'Elbow', value: 'Elbow' },
    { label: 'Wrist', value: 'Wrist' },
    { label: 'Hand', value: 'Hand' },
    { label: 'Hip', value: 'Hip' },
    { label: 'Knee', value: 'Knee' },
    { label: 'Ankle', value: 'Ankle' },
    { label: 'Foot', value: 'Foot' },
    { label: 'Neck', value: 'Neck' },
    { label: 'Throat', value: 'Throat' },
    { label: 'Spleen', value: 'Spleen' },
    { label: 'Prostate', value: 'Prostate' },
    { label: 'Testes', value: 'Testes' },
    { label: 'Ovaries', value: 'Ovaries' },
    { label: 'Uterus', value: 'Uterus' },
    { label: 'Cervix', value: 'Cervix' },
    { label: 'Eye', value: 'Eye' },
    { label: 'Ear', value: 'Ear' },
    { label: 'Nose', value: 'Nose' },
    { label: 'Mouth', value: 'Mouth' },
    { label: 'Throat', value: 'Throat' },
    { label: 'Tongue', value: 'Tongue' },
    { label: 'Teeth', value: 'Teeth' },
    { label: 'Gums', value: 'Gums' },
    { label: 'Salivary Glands', value: 'Salivary Glands' },
    { label: 'Larynx', value: 'Larynx' },
    { label: 'Trachea', value: 'Trachea' },
    { label: 'Bronchi', value: 'Bronchi' },
    { label: 'Lungs', value: 'Lungs' },
    { label: 'Diaphragm', value: 'Diaphragm' },
    { label: 'Esophagus', value: 'Esophagus' },
    { label: 'Stomach', value: 'Stomach' },
    { label: 'Liver', value: 'Liver' },
    { label: 'Gallbladder', value: 'Gallbladder' },
    { label: 'Pancreas', value: 'Pancreas' },
    { label: 'Small Intestine', value: 'Small Intestine' },
    { label: 'Large Intestine', value: 'Large Intestine' },
    { label: 'Rectum', value: 'Rectum' },
    { label: 'Anus', value: 'Anus' },
    { label: 'Ureters', value: 'Ureters' },
    { label: 'Urethra', value: 'Urethra' },
    { label: 'Other', value: 'Other' },
  ]

  const {
    register,
    handleSubmit,
    watch,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      "notes": null,
      "status": "active",
      "highlighted": false,
      "startDate": null,
      "endDate": null,
      "title": null,
      "providers": [],
      "category": null,
      "clinicalTrialsKeywords": null,
      "primarySize": null,
      "cancerType": null,
      "subtype": null,
      "stage": null,
      "grade": null,
      "diseaseStatus": null,
      "organs": [],
      "institutions": [],
      "pubMedKeywords": null,
    },
  });


  useEffect(() => {
    if (cancers) {
      const transformedCancers = cancers?.map((cancer) => ({
        label: cancer.title,
        value: cancer,
      })) || [];
      setCancerTypes(transformedCancers);
    }
  }, [cancers]);

  const severityOptions = [
    { label: 'Mild', value: 'mild' },
    { label: 'Moderate', value: 'moderate' },
    { label: 'Severe', value: 'severe' },
    { label: 'Other', value: 'other' },
  ];

  const { data: subtypes } = useGetAllSubtypes(
    { id: selectedCancerType?.id },
    !!selectedCancerType?.id // This will enable the query only if there's a valid id
  );

  useEffect(() => {
    if (selectedCancerType?.id) {
      if (diagnosis?.subtype && subtypeOptions) {
        const subtype = subtypeOptions.find((subtype) => subtype.label === diagnosis.subtype);
        setCurrentSubtype(subtype);
      }
    }

  }, [selectedCancerType]);


  useEffect(() => {
    if (watch('cancerType')) {
      setSelectedCancerType(watch('cancerType'));
    }
  }, [watch('cancerType')]);

  //todo: consider doing this in the hook itself, so that the data is transformed before it gets to the component
  useEffect(() => {
    if (subtypes) {
      const transformedSubtypes = subtypes?.map((subtype) => ({
        label: subtype.title,
        value: subtype,
      })) || [];
      setSubtypeOptions(transformedSubtypes);
    }
  }, [subtypes]);

  const { mutate: updateDiagnosis } = useMutation(
    (payload) => updateDiagnosisPATCH({ data: payload, patientId }),
    {
      onSuccess: (data) => {
        toast.success(`Successfully updated diagnosis. ${data.createdLinks > 0 || data.removedLinks > 0 ? `Added ${data.createdLinks} link and removed ${data.removedLinks}` : ''} `);
        queryClient.invalidateQueries(["diagnosis"]);
        queryClient.invalidateQueries(["diagnoses"]);

      },
      onError: (error) => {
        toast.error("Unable to update diagnosis" + error);
      },
    }
  );


  const stageOptions = [
    { label: 'Stage I', value: 1 },
    { label: 'Stage II', value: 2 },
    { label: 'Stage III', value: 3 },
    { label: 'Stage IV', value: 4 },
    { label: 'Other', value: 'Other' },
  ];

  const gradeOptions = [
    { label: 'Grade 1', value: 1 },
    { label: 'Grade 2', value: 2 },
    { label: 'Grade 3', value: 3 },
    { label: 'Grade 4', value: 4 },
    { label: 'Low Grade', value: 'Low Grade' },
    { label: 'High Grade', value: 'High Grade' },
    { label: 'Other', value: 'Other' },
  ];

  const diseaseStatusOptions = [
    { label: 'Active', value: 'active' },
    { label: 'Controlled', value: 'controlled' },
    { label: 'Resolved', value: 'resolved' },
    { label: 'Intervention Scheduled', value: 'scheduled_intervention' },
    { label: 'Other', value: 'other' },
  ];

  const statusOptions = [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
    { label: 'Resolved', value: 'resolved' },
    { label: 'Intervention Scheduled', value: 'scheduled_intervention' },
    { label: 'Other', value: 'other' },
  ];

  const diagnosisCategories = [
    { label: "cancer", value: "cancer" },
    { label: "allergy", value: "allergy" },
    { label: "infection", value: "infection" },
    { label: "injury", value: "injury" },
    { label: "autoimmune", value: "autoimmune" },
    { label: "genetic", value: "genetic" },
    { label: "metabolic", value: "metabolic" },
    { label: "cardiovascular", value: "cardiovascular" },
    { label: "respiratory", value: "respiratory" },
    { label: "gastrointestinal", value: "gastrointestinal" },
    { label: "neurological", value: "neurological" },
    { label: "musculoskeletal", value: "musculoskeletal" },
    { label: "endocrine", value: "endocrine" },
    { label: "urological", value: "urological" },
    { label: "reproductive", value: "reproductive" },
    { label: "mental health", value: "mental health" },
    { label: "dermatological", value: "dermatological" },
    { label: "ophthalmological", value: "ophthalmological" },
    { label: "otolaryngological", value: "otolaryngological" },
    { label: "dental", value: "dental" },
    { label: "other", value: "other" },
  ];


  const onSubmit = async (data) => {
    const token = await getToken();

    if (data.endDate === "") {
      data.endDate = null;
    }
    // pull just the values from the providers 
    data.providers = data.providers.map((provider) => {
      return {
        id: provider.value ? provider.value.providerId : provider.providerId,
        firstName: provider.value ? provider.value.firstName : provider.firstName,
        lastName: provider.value ? provider.value.lastName : provider.lastName,
        designation: provider.value ? provider.value.designation : provider.designation,
      };
    });

    // pull just the values from the institutions
    data.institutions = data.institutions.map((institution) => {
      return {
        institutionId: institution.value ? institution.value.institutionId : institution.institutionId,
        title: institution.value ? institution.value.title : institution.title,
      };
    });
    if (data.category === "cancer") {
      data.organs = data.organs.length > 0 ? data.organs.map((organ) => organ.value) : currentOrgans;
    }
    data.institutionId = data.institution ? data.institution.institutionId : data.institutionId;
    data.diagnosisId = data.diagnosis ? data.diagnosis.id : data.diagnosisId
    data.category = data.category.value ? data.category.value : data.category;

    const payload = {
      ...data,
      patientId,
    };

    if (mode !== 'add') {
      updateDiagnosis({ data: payload, token })
    } else {
      createDiagnosis({ data: payload, token })
    }


    // createDiagnosis({ data: payload, token })
  };

  useEffect(() => {
    if (diagnosis) {
      reset(diagnosis);
    }

    if (diagnosis?.length === 0) {
      return
    }

    if (diagnosis?.diseaseStatus) {
      const status = diseaseStatusOptions.find((status) => status.value === diagnosis.diseaseStatus);
      setCurrentDiseaseStatus(status);

    }

    if (diagnosis?.status) {
      const status = statusOptions.find((status) => status.value === diagnosis.status);
      setCurrentStatus(status);
    }

    if (diagnosis?.providers?.length > 0) {
      const providersArray = diagnosis.providers.map((provider) => {
        return {
          value: provider,
          label: `${provider.firstName} ${provider.lastName}, ${provider.designation}`,
        };
      });
      setCurrentProviders(providersArray);
    }

    if (diagnosis?.category) {
      const category = diagnosisCategories.find((category) => category.value === diagnosis.category);
      setCurrentCategory(category);
    }

    if (diagnosis?.type && cancerTypes) {
      if (diagnosis.category === 'allergy') {

        const type = severityOptions.find((type) => type.value === diagnosis.type)
        setCurrentCancerType(type);
        setValue('cancerType', type.value);
      } else {
        const type = cancerTypes.find((type) => type.label === diagnosis.type);

        if (!type) {
          return
        }
        setCurrentCancerType(type);
        setValue('cancerType', type.value);
      }


    }

    if (diagnosis?.stage) {
      const stage = stageOptions.find((stage) => stage.value === Number(diagnosis.stage));
      setCurrentStage(stage);
    }

    if (diagnosis?.grade) {

      const grade = gradeOptions.find((grade) => grade.label === diagnosis.grade);
      setCurrentGrade(grade);
    }

    if (diagnosis?.metadata?.organs) {
      const currentOrgans = organs.filter((organ) =>
        diagnosis.metadata.organs.some(location => location === organ.value)
      );
      setCurrentOrgans(currentOrgans);
    }

    if (diagnosis?.institutions && institutionOptions) {
      //filter institution options to current institution 
      const institutions = institutionOptions.filter((institution) => diagnosis.institutions.some(location => location.institutionId === institution.value.institutionId))
      setCurrentInstitutions(institutions);
    }
  }, [diagnosis, cancerTypes, subtypeOptions, institutionOptions]);


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
          <h2 className={`text-center text-3xl font-extrabold text-gray-900 mb-5 ${mode === "add" ? 'mt-12' : 'mt-2'}`}>
            {mode === "add" ? 'Add New Diagnoses' : diagnosis?.title || 'Edit Diagnosis'}
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
                <div className="grid grid-cols-1 lg:grid-cols-10 sm:flex-row gap-2 mt-5">
                  {/* Active or Inactive */}
                  <div className="w-full col-span-1 lg:col-span-2">
                    <label htmlFor="status" className="text-sm font-medium">
                      Status
                    </label>
                    <div className="mt-2 w-full md:w-full">
                      <Controller
                        control={control}
                        name="status"
                        rules={{ required: 'status is required' }}
                        render={({ field }) => (
                          <SingleSelectDropdown
                            defaultValue={currentStatus}
                            items={statusOptions}
                            onValueChange={field.onChange}
                            maxHeight={'lg:max-h-[200px] max-h-[400px]'}
                          />
                        )}
                      />
                    </div>
                  </div>

                  <div className="col-span-1 lg:col-span-5">
                    <div className="w-full text-center">
                      <label htmlFor="color" className="text-sm font-medium text-center w-ful">
                        Color
                      </label>
                    </div>
                    <div className="w-full">
                      <Controller
                        control={control}
                        name="color"
                        render={({ field, fieldState: { error } }) => (
                          <ColorPicker
                            onValueChange={field.onChange}
                          />
                        )}
                      />
                    </div>

                  </div>

                  <div className="flex flex-row col-span-1 lg:col-span-2 gap-2 mt-6 self-center">
                    <div className="pt-1">
                      <Controller
                        control={control}
                        name="highlighted"
                        render={({ field }) => (
                          <input
                            {...register('highlighted')}
                            type="checkbox"
                            value={field.value}
                            onChange={field.onChange}
                            className="rounded-md px-3 w-5 h-5 self-center placeholder-gray-500  border text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          />
                        )}
                      />
                    </div>
                    <label htmlFor="highlighted" className="text-md font-medium mb-5">
                      Highlighted Diagnosis
                    </label>
                  </div>

                </div>
                <div className="grid lg:grid-cols-5 grid-cols-1 gap-2">
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-9 gap-2 mt-4">
                  <div className='col-span-1 lg:col-span-4'>
                    <div className="w-full flex flex-row">
                      <label htmlFor="title" className="text-sm font-medium">
                        Diagnosis Title
                      </label>
                      <div className="relative group ml-6">
                        <InformationCircleIcon className="w-4 h-4 text-blue-600 absolute right-0 top-0" />
                        <div className="absolute hidden group-hover:block bg-slate-600 text-white text-xs p-2 rounded -mt-12 z-10 w-40">
                          The name you'd like to see displayed
                        </div>
                      </div>
                    </div>
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
                  {/* Providers */}
                  <div className='col-span-1 lg:col-span-4'>
                    <label htmlFor="providers" className="text-sm font-medium">
                      Providers
                    </label>
                    <div className='w-full mt-1'>
                      <div className=' w-full'>
                        <Controller
                          control={control}
                          name="providers"
                          defaultValue={currentProviders}
                          render={({ field }) => (
                            <MultiSelectDropdown defaultValue={currentProviders} items={providersList.sort((a, b) => {
                              if (a.label < b.label) {
                                return -1;
                              }
                              if (a.label > b.label) {
                                return 1;
                              }
                              return 0;
                            })} onValueChange={field.onChange} placeholder="Select Providers" />
                          )}
                        />
                      </div>
                    </div>
                  </div>


                  <div className="col-span-1 lg:col-span-1 self-center">
                    <label htmlFor="cateogry" className="text-sm font-medium">
                      Category
                    </label>
                    <div className="mt-1">
                      <Controller
                        control={control}
                        name="category"
                        defaultValue={currentCategory}
                        render={({ field }) => (
                          <SingleSelectDropdown
                            defaultValue={currentCategory}
                            items={diagnosisCategories}
                            onValueChange={field.onChange}
                            placeholder="Select Intervention Category"
                            maxHeight={'lg:max-h-[200px] max-h-[400px]'}
                          />
                        )}
                      />
                    </div>
                  </div>




                  {/* <div className="col-span-1 lg:col-span-1 self-center mt-1">
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
                  </div> */}

                </div>
                {/* if the drop down selection for the cateorgy is equal to cancer then create another subform drop down with additional fields to fill out */}
                {watch('category') === 'cancer' && (
                  <div className="flex flex-col w-full bg-slate-100 p-5 mt-3">
                    <div className="grid grid-cols-1 lg:grid-cols-8 gap-2 w-full 
                      ">
                      {/* Cancer Type */}
                      <div className="col-span-1 lg:col-span-3 self-center">
                        <label htmlFor="cancerType" className="text-sm font-medium">
                          Cancer Type
                        </label>
                        <div className="mt-2">
                          <Controller
                            defaultValue={currentCancerType}
                            control={control}
                            name="cancerType"
                            rules={{ required: 'cancer type is required' }}
                            render={({ field, fieldState: { error } }) => (
                              <TypeaheadComboBox
                                defaultValue={currentCancerType}
                                items={cancerTypes}
                                onValueChange={field.onChange}
                                placeholder=""
                              />

                            )}
                          />

                        </div>
                      </div>
                      {/* Subtype */}
                      <div className="col-span-1 lg:col-span-3 self-center">
                        <label htmlFor="cateogry" className="text-sm font-medium">
                          Subtype
                        </label>
                        <div className="mt-2">
                          <Controller
                            control={control}
                            name="subtype"
                            defaultValue={currentSubtype}
                            render={({ field }) => (
                              <SingleSelectDropdown
                                items={subtypeOptions.sort((a, b) => {
                                  if (a.label < b.label) {
                                    return -1;
                                  }
                                  if (a.label > b.label) {
                                    return 1;
                                  }
                                  return 0;
                                })}
                                defaultValue={currentSubtype}
                                onValueChange={field.onChange}
                                placeholder="Select Intervention Category"
                                maxHeight={'lg:max-h-[200px] max-h-[400px]'}
                              />
                            )}
                          />
                        </div>
                      </div>
                      {/* Stage */}
                      <div className="col-span-1 lg:col-span-1 self-center">
                        <label htmlFor="cateogry" className="text-sm font-medium">
                          Stage
                        </label>
                        <div className="mt-2">
                          <Controller
                            control={control}
                            name="stage"
                            defaultValue={currentStage}
                            render={({ field }) => (
                              <SingleSelectDropdown
                                items={stageOptions}
                                defaultValue={currentStage}
                                onValueChange={field.onChange}
                                placeholder="Select Intervention Category"
                                maxHeight={'lg:max-h-[200px] max-h-[400px]'}
                              />
                            )}
                          />
                        </div>
                      </div>
                      {/* Grade */}
                      <div className="col-span-1 lg:col-span-1 self-center">
                        <label htmlFor="cateogry" className="text-sm font-medium">
                          Grade
                        </label>
                        <div className="mt-2">
                          <Controller
                            control={control}
                            name="grade"
                            defaultValue={currentGrade}
                            render={({ field }) => (
                              <SingleSelectDropdown
                                items={gradeOptions}
                                defaultValue={currentGrade}
                                onValueChange={field.onChange}
                                placeholder="Select Intervention Category"
                                maxHeight={'lg:max-h-[200px] max-h-[400px]'}
                              />
                            )}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-10 gap-2 mt-4">
                      {/* Primary Size */}
                      <div className="col-span-1 lg:col-span-2 self-center ">
                        <div className="flex flex-col">
                          <div className="w-full flex flex-row">
                            <label htmlFor="primarySize" className="text-sm font-medium">
                              Primary Size (cm)
                            </label>
                            <div className="relative group ml-6">
                              <InformationCircleIcon className="w-4 h-4 text-blue-600 absolute right-0 top-0" />
                              <div className="absolute hidden group-hover:block bg-slate-600 text-white text-xs p-2 rounded z-10 w-40">
                                at time of diagnoses
                              </div>
                            </div>
                          </div>

                          <div className="mt-2">
                            <input
                              {...register(`primarySize`)}
                              data-lpignore="true"
                              type="number"
                              min="0"
                              autoComplete="off"
                              className="rounded-md text-center h-10 w-full shadow-md mt-1 text-sm border placeholder-gray-500 text-gray-900  focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Current Size */}
                      <div className="col-span-1 lg:col-span-2 self-center">
                        <div className="flex flex-col w-full">
                          <div className="w-full flex flex-row">
                            <label htmlFor="title" className="text-sm font-medium">
                              Current Size (cm)
                            </label>
                            <div className="relative group ml-6">
                              <InformationCircleIcon className="w-4 h-4 text-blue-600 absolute right-0 top-0" />
                              <div className="absolute hidden group-hover:block bg-slate-600 text-white text-xs p-2 rounded z-10 w-40">
                                of the primary tumor, enter 0 if removed or not applicable
                              </div>
                            </div>
                          </div>

                          <div className="mt-2">
                            <input
                              {...register(`currentSize`)}
                              data-lpignore="true"
                              type="number"
                              min="0"
                              autoComplete="off"
                              className="rounded-md w-full text-center h-10 shadow-md mt-1 text-sm border placeholder-gray-500 text-gray-900  focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Disease Status */}
                      <div className="col-span-1 lg:col-span-3 self-center">
                        <label htmlFor="cateogry" className="text-sm font-medium">
                          Current Disease Status
                        </label>
                        <div className="mt-2">
                          <Controller
                            control={control}
                            name="diseaseStatus"
                            rules={{ required: 'Status is required' }}
                            render={({ field, fieldState: { error } }) => (
                              <div {...field} className='h-fullpb-10'>
                                <SingleSelectDropdown
                                  defaultValue={currentDiseaseStatus}
                                  value={field.value}
                                  items={diseaseStatusOptions}
                                  onValueChange={field.onChange}
                                  placeholder="Select Status"
                                />
                              </div>
                            )}
                          />
                          {/* <Controller
                            control={control}
                            name="diseaseStatus"
                            render={({ field }) => (
                              <SingleSelectDropdown
                                defaultValues={currentDiseaseStatus}
                                items={diseaseStatusOptions}
                                onValueChange={field.onChange}
                                placeholder="Select disease status"
                                maxHeight={'lg:max-h-[200px] max-h-[400px]'}
                              />
                            )}
                          /> */}
                        </div>
                      </div>



                    </div>
                    {/* Involved organs */}
                    <div className="w-full self-center mt-4">
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
                              placeholder="Select Imaging Location"
                              maxHeight={'lg:max-h-[200px] max-h-[400px]'}
                            />
                          )}
                        />
                      </div>
                    </div>
                  </div>
                )}
                {watch('category') === 'allergy' && (
                  <div className="flex flex-col w-full mt-3">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 w-full 
                      ">
                      {/* Severity Type */}
                      <div className="col-span-1 self-center">
                        <label htmlFor="cancerType" className="text-sm font-medium">
                          Severity
                        </label>
                        <div className="mt-2">
                          <Controller
                            defaultValue={currentCancerType}
                            control={control}
                            name="cancerType"
                            rules={{ required: 'severity type is required' }}
                            render={({ field, fieldState: { error } }) => (
                              <SingleSelectDropdown
                                defaultValue={currentCancerType}
                                items={severityOptions}
                                onValueChange={field.onChange}
                                placeholder="Select Severity"
                                maxHeight={'lg:max-h-[200px] max-h-[400px]'}
                              />
                            )}
                          />

                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className='lg:col-span-5 col-span-1 gap-2 pt-4'>
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
                  <div className="grid grid-cols-1 lg:grid-cols-8 gap-2 mt-5">
                    <div className="col-span-1 lg:col-span-8">
                      <label htmlFor="institutions" className="text-sm font-medium">
                        Institution
                      </label>
                      <Controller
                        control={control}
                        name="institutions"
                        defaultValue={currentInstitutions}
                        render={({ field, fieldState: { error } }) => (
                          <MultiSelectTypeahead
                            defaultValue={currentInstitutions}
                            items={institutionOptions}
                            onValueChange={field.onChange}
                            placeholder="Select Institutions"
                          />
                        )}
                      />

                    </div>
                  </div>
                  {/* Keywords */}
                  <div className='flex flex-col w-full mt-4'>
                    <label htmlFor="trial_keywords" className="text-sm font-medium">
                      Trial Search Keywords <span className="text-xs font-normal text-gray-600">(separate each by a comma)</span>
                    </label>
                    <div className="pt-2 w-full">
                      <Controller
                        control={control}
                        name="clinicalTrialsKeywords"
                        render={({ field }) => (
                          <input
                            {...register('clinicalTrialsKeywords', { required: false })}
                            type="text"
                            autoComplete="off"
                            className="rounded-md px-3 w-full py-2 shadow-md placeholder-gray-500  border text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          />
                        )}
                      />

                    </div>
                  </div>

                  <div className='flex flex-col w-full mt-4'>
                    <label htmlFor="pubmed_keywords" className="text-sm font-medium">
                      PubMed Search Keywords <span className="text-xs font-normal text-gray-600">(separate each by a comma)</span>
                    </label>
                    <div className="pt-2 w-full">
                      <Controller
                        control={control}
                        name="pubMedKeywords"
                        render={({ field }) => (
                          <input
                            {...register('pubMedKeywords', { required: false })}
                            type="text"
                            autoComplete="off"
                            className="rounded-md px-3 w-full py-2 shadow-md placeholder-gray-500  border text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          />
                        )}
                      />

                    </div>
                  </div>


                  {/* notes  */}
                  <div className="mt-6 flex flex-col">
                    <label htmlFor="notes" className="text-sm font-medium">
                      Notes
                    </label>
                    <div className="mt-2 w-full">
                      <Controller
                        control={control}
                        name="notes"
                        render={({ field }) => (
                          <textarea
                            {...register('notes', { required: false })}
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


      </div >


    </div >
  );
}
