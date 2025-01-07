import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import PhotoUpload from "../common/PhotoUpload";
import { useMutation, useQueryClient } from "react-query";
import { toast } from "react-hot-toast";
import { useAuth } from "@clerk/nextjs";
import { usePatientContext } from "@/components/context/PatientContext";
import { createAttachmentPOST, useDiagnoses, useInstitutions, useInterventions, useMedications, useProviders, useImaging } from "@/hooks/api";
import SingleSelectDropdown from "../common/SingleSelectDropDown";
import { FileUploader } from "../common/FileUploader";
import MultiSelectTypeahead from "../common/MultiSelectTypeAheadCombo";
import { transformForSelect } from "@/utils/helpers";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/20/solid";

export default function AttachmentsForm({ closeModal, type = "attachment", timelineID = null }) {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();
  const { patientId } = usePatientContext();
  const [transformedDiagnoses, setTransformedDiagnoses] = useState([]);
  const [transformedInstitutions, setTransformedInstitutions] = useState([]);
  const [transformedInterventions, setTransformedInterventions] = useState([]);
  const [transformedMedications, setTransformedMedications] = useState([]);
  const [transformedProviders, setTransformedProviders] = useState([]);
  const [providersInstitutionsExpanded, setProvidersInstitutionsExpanded] = useState(false);
  const [group2Expanded, setGroup2Expanded] = useState(false);
  const [transformedImaging, setTransformedImaging] = useState([]);

  const { data: imaging } = useImaging(
    { id: patientId }
  );


  const { data: diagnoses } = useDiagnoses(
    {
      id: patientId,
    }
  );

  const { data: institutions } = useInstitutions(
    {
      id: patientId,
    }
  );

  const { data: interventions } = useInterventions(
    {
      id: patientId,
    }
  );

  const { data: medications } = useMedications(
    {
      id: patientId,
    }
  );

  const { data: providers } = useProviders(
    {
      id: patientId,
    }
  );

  useEffect(() => {
    if (diagnoses) {

      setTransformedDiagnoses(transformForSelect(diagnoses));
    }
  }, [diagnoses]);

  useEffect(() => {
    if (institutions) {
      setTransformedInstitutions(transformForSelect(institutions));
    }
  }, [institutions]);

  useEffect(() => {
    if (interventions) {
      setTransformedInterventions(transformForSelect(interventions));
    }
  }, [interventions]);

  useEffect(() => {
    if (medications) {
      setTransformedMedications(transformForSelect(medications));
    }
  }, [medications]);

  useEffect(() => {
    if (providers) {
      const transformed = providers.map((provider) => {
        return { label: provider.firstName + " " + provider.lastName + ", " + provider.designation, value: provider };
      }
      )
      setTransformedProviders(transformed);
    }
  }, [providers]);

  useEffect(() => {
    if (imaging) {
      setTransformedImaging(transformForSelect(imaging));
    }
  }, [imaging]);


  const { mutate: createAttachment } = useMutation(
    (payload) => createAttachmentPOST({ data: payload, type: type, timelineID: timelineID }),
    {
      onSuccess: () => {
        toast.success("Successfully added attachment");
        queryClient.invalidateQueries(["attachment"]);
        reset();
        if (closeModal) {
          closeModal();
        }
      },
      onError: (error) => {
        toast.error("Unable to add attachment" + error);
      },
    }
  );


  const categories = [
    { label: "Image", value: "image" },
    { label: "Report", value: "report" },
    { label: "Video", value: "video" },
    { label: "Operative", value: "operative" },
    { label: "Sequencing", value: "sequencing" },
    { label: "Visit Summary", value: "visit_summary" },
    { label: "Pathology", value: "pathology" },
    { label: "Other", value: "other" },
  ]

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      highlight: false,
    },
  });


  const onSubmit = async (data) => {
    const token = await getToken();
    data.token = token;
    createAttachment({ data: data });

  };


  return (
    <div className="flex items-center self-center justify-center h-1/2">

      <div className="w-full p-5">
        <div className="flex flex-col w-full justify-center">
          <h2 className="text-center text-3xl font-extrabold text-gray-900  mt-12">
            Add Attachment
          </h2>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className=" rounded p-3">

          <div className="rounded-md shadow-sm -space-y-px p-6">
            <div className="col-span-1 lg:col-span-1 self-center mt-2 mx xl:mr-8">
              <div className="flex flex-row  gap-2 mt-3">
                <div className="pt-1">
                  <Controller
                    control={control}
                    name="highlight"
                    render={({ field }) => (
                      <input
                        {...register('highlight')}
                        type="checkbox"
                        value={field.value}
                        onChange={field.onChange}
                        className="rounded-md px-3 w-5 h-5 self-center placeholder-gray-500  border text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    )}
                  />
                </div>
                <label htmlFor="highlight" className="text-md font-medium">
                  Highlighted Attachment
                </label>
              </div>
            </div>

            <div className="w-full">
              <div className="grid grid-cols-1 lg:grid-cols-7 gap-2 mt-4">
                <div className='col-span-1 lg:col-span-4'>
                  <div className='flex flex-col w-full'>
                    <label htmlFor="reason" className="text-sm font-medium">
                      Title
                    </label>
                    <div className="pt-3 w-full">
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
                <div className="col-span-1 lg:col-span-1 self-center mt-1">
                  <div className="flex flex-col ">
                    <label htmlFor="category" className="text-sm font-medium mb-2">
                      Category
                    </label>
                    <Controller
                      control={control}
                      name="category"
                      render={({ field }) => (
                        <SingleSelectDropdown
                          items={categories}
                          onValueChange={field.onChange}
                          placeholder="Select Intervention Category"
                        />
                      )}
                    />
                  </div>
                </div>
                <div className="flex flex-row gap-2">
                  <div className='flex flex-col w-full'>
                    <label htmlFor="name" className="text-sm font-semibold">
                      Date
                    </label>
                    <div className="pt-3">
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

                </div>


              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
                <div className='col-span-1 lg:col-span-2 mt-4'>
                  <label htmlFor="link" className="text-sm font-medium">
                    Link
                  </label>
                  <div className="pt-2 w-full">
                    <Controller
                      control={control}
                      name="link"
                      render={({ field }) => (
                        <input
                          {...register('link')}
                          type="url"
                          autoComplete="off"
                          className="rounded-md px-3 w-full py-2 shadow-md placeholder-gray-500  border text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      )}
                    />

                  </div>
                </div>
                <div className='col-span-1 lg:col-span-1 mt-4 self-center flex flex-col gap-1'>
                  <label htmlFor="link" className="text-sm font-medium mb-1">
                    Upload File
                  </label>
                  <FileUploader
                    control={control}
                    name="file"
                  />
                </div>
              </div>
            </div>


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
                      rows="3"
                      type="text"
                      autoComplete="off"
                      className="rounded-md px-3 w-full py-2 shadow-md placeholder-gray-500  border text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  )}
                />

              </div>
            </div>
            <hr className="border-1 border-gray-300" />
            <div className="flex flex-col w-full justify-center">
              <h2 className="text-center text-3xl font-extrabold text-gray-900 mb-5 mt-7">
                Link to other records
              </h2>
              <hr className="border-1 border-gray-300 w-1/2 mx-auto" />

            </div>


            <div className="flex flex-row justify-between pt-10">
              <h3 className="text-xl font-bold leading-6 text-gray-900 mb-5">Providers / Institutions</h3>
              <button type="button" onClick={() => setProvidersInstitutionsExpanded(!providersInstitutionsExpanded)} className="self-center h-full font-bold pr-2 rounded ">
                {providersInstitutionsExpanded ? <ChevronUpIcon className="w-7 h-7" /> : <ChevronDownIcon className="w-7 h-7" />}
              </button>
            </div>

            {providersInstitutionsExpanded &&
              (
                <div>
                  <div className="col-span-1 lg:col-span-3 self-center flex flex-col gap-1 pt-4">
                    <label htmlFor="institutions" className="text-sm font-medium">
                      Institutions
                    </label>
                    <Controller
                      control={control}
                      name="institutions"
                      render={({ field }) => (
                        <MultiSelectTypeahead
                          items={transformedInstitutions}
                          onValueChange={field.onChange}
                          placeholder="Search and attach institutions"
                          maxHeight={150}
                        />
                      )}
                    />
                  </div>
                  <div className="col-span-1 lg:col-span-3 self-center flex flex-col gap-1 pt-4">
                    <label htmlFor="providers" className="text-sm font-medium">
                      Providers
                    </label>
                    <Controller
                      control={control}
                      name="providers"
                      render={({ field }) => (
                        <MultiSelectTypeahead
                          items={transformedProviders}
                          onValueChange={field.onChange}
                          placeholder="Search and attach providers"
                          maxHeight={150}
                        />
                      )}
                    />
                  </div>
                </div>

              )}

            <div className="flex flex-row justify-between pt-10">
              <h3 className="text-xl font-bold leading-6 text-gray-900 mb-5">Diagnoses / Interventions / Imaging / Medications</h3>
              <button type="button" onClick={() => setGroup2Expanded(!group2Expanded)} className="self-center h-full font-bold pr-2 rounded ">
                {group2Expanded ? <ChevronUpIcon className="w-7 h-7" /> : <ChevronDownIcon className="w-7 h-7" />}
              </button>
            </div>

            {
              group2Expanded && (
                <div>
                  <div className="col-span-1 lg:col-span-3 self-center flex flex-col gap-1 pt-4">
                    <label htmlFor="diagnoses" className="text-sm font-medium">
                      Diagnoses
                    </label>
                    <Controller
                      control={control}
                      name="diagnoses"
                      render={({ field }) => (
                        <MultiSelectTypeahead
                          items={transformedDiagnoses}
                          onValueChange={field.onChange}
                          placeholder="Search and attach diagnoses"
                          maxHeight={150}
                        />
                      )}
                    />
                  </div>

                  <div className="col-span-1 lg:col-span-3 self-center flex flex-col gap-1 pt-4">
                    <label htmlFor="interventions" className="text-sm font-medium">
                      Interventions
                    </label>
                    <Controller
                      control={control}
                      name="interventions"
                      render={({ field }) => (
                        <MultiSelectTypeahead
                          items={transformedInterventions}
                          onValueChange={field.onChange}
                          placeholder="Search and attach interventions"
                          maxHeight={150}
                        />
                      )}
                    />
                  </div>

                  <div className="col-span-1 lg:col-span-3 self-center flex flex-col gap-1 pt-4">
                    <label htmlFor="imaging" className="text-sm font-medium">
                      Imaging
                    </label>
                    <Controller
                      control={control}
                      name="imaging"
                      render={({ field }) => (
                        <MultiSelectTypeahead
                          items={transformedImaging}
                          onValueChange={field.onChange}
                          placeholder="Search and attach imaging"
                          maxHeight={150}
                        />
                      )}
                    />
                  </div>

                  <div className="col-span-1 lg:col-span-3 self-center flex flex-col gap-1 pt-4">
                    <label htmlFor="medications" className="text-sm font-medium">
                      Medications
                    </label>
                    <Controller
                      control={control}
                      name="medications"
                      render={({ field }) => (
                        <MultiSelectTypeahead
                          items={transformedMedications}
                          onValueChange={field.onChange}
                          placeholder="Search and attach medications"
                          maxHeight={150}
                        />
                      )}
                    />
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
