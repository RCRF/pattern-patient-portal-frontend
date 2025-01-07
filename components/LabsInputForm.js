import { TrashIcon } from "@heroicons/react/24/solid";
import React, { useState, useEffect } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import Select from "./common/Select";
import { createLabsPOST, useLabPanels } from "@/hooks/api";
import { useMutation, queryClient } from "react-query";
import { toast } from "react-hot-toast";
import { useAuth } from "@clerk/nextjs";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { usePatientContext } from '@/components/context/PatientContext';

export default function LabsIntputForm({
  closeModal,
  addLabs,
  institutions,
  providers,
}) {
  const { getToken } = useAuth();
  const [startDateOpen, setStartDateOpen] = useState(false);
  const { data: panels } = useLabPanels();
  const { patientId } = usePatientContext();

  const { mutate: createLabs } = useMutation(
    (labsData) => createLabsPOST({ data: labsData, patientId }),
    {
      onSuccess: () => {
        toast.success("Successfully added labs");
        closeModal();
      },
      onError: (error) => {
        toast.error("User not authorized to add labs");
      },
    }
  );
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      panelFields: [],
      notes: "",
      startDate: new Date(),
    },
  });

  // Register the DatePicker component for react-hook-form
  useEffect(() => {
    register("startDate");
  }, [register]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "panelFields",
  });

  const selectedPanel = watch("panel");

  const onSubmit = async (data) => {
    const token = await getToken();

    const labsData = {
      institution: data.institution,
      provider: data.provider,
      panel: data.panel.title,
      notes: data.notes,
      startDate: data.startDate.toISOString().split("T")[0],
      panelFields: data.panelFields,
      patientId: patientId,
    };

    createLabs({ labsData, token });
  };
  useEffect(() => {
    if (selectedPanel && selectedPanel.fields) {
      if (fields.length === 0) {
        // Only initialize fields if they haven't been already
        append(selectedPanel.fields.map((field) => ({ ...field, value: "" })));
      }
    }
  }, [selectedPanel, fields, append]);

  const removeField = (index) => {
    remove(index); // Remove the field at the specified index
  };
  return (
    <div className="flex min-h-[500px] items-center self-center justify-center h-1/2">
      <div className="w-11/12 p-5">
        <h2 className="text-center text-3xl font-extrabold text-gray-900 mb-5">
          Add Lab Results
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className=" rounded p-3">
          <div className="rounded-md p-6">
            <div className="pt-2 flex w-full flex-col float-right mb-2 relative">
              <div htmlFor="startDate" className="text-base font-medium float-right">
                Date
              </div>
              <div className="relative z-50">
                <Controller
                  control={control}
                  name="startDate"
                  render={({ field }) => (
                    <ReactDatePicker
                      className="rounded-md relative w-full z-50 px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      dateFormat="yyyy-MM-dd"
                      onChange={(date) => field.onChange(date)}
                      selected={field.value}
                      open={startDateOpen}
                      onClick={() => setStartDateOpen(!startDateOpen)}
                      onFocus={() => setStartDateOpen(true)}
                      onBlur={() => setStartDateOpen(false)}
                    />
                  )}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 w-full gap-2">
              <div className="pt-2 w-full">
                <label htmlFor="name" className="text-base font-medium">
                  Institution
                </label>
                <div className="w-full mx-auto relative z-40">
                  <Select
                    setValue={setValue}
                    {...register("institution", {
                      required: "institution is required",
                    })}
                    type="button"
                    id="institution"
                    name="institution"
                    options={institutions ?? []}
                  />
                </div>
                <div className="pt-2">
                  {errors.institution && (
                    <p className="text-red-500 text-xs italic">
                      {errors.institution.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-2 w-full">
                <label htmlFor="lab" className="text-base font-medium">
                  Provider
                </label>
                <div className="relative w-full z-30 mx-auto">
                  <Select
                    setValue={setValue}
                    {...register("provider", {
                      required: "provider is required",
                    })}
                    type="select"
                    id="provider"
                    name="provider"
                    options={providers ?? []}
                  />
                </div>
                <div className="pt-2">
                  {errors.provider && (
                    <p className="text-red-500 text-xs italic">
                      {errors.provider.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-2 w-full">
                <label htmlFor="name" className="text-base font-medium">
                  Type
                </label>
                <div className="relative w-full z-20 mx-auto">
                  <Select
                    setValue={setValue}
                    {...register("panel", {
                      required: "panel is required",
                    })}
                    type="button"
                    id="panel"
                    name="panel"
                    options={panels ?? []}
                  />
                </div>
                <div className="pt-2">
                  {errors.panels && (
                    <p className="text-red-500 text-xs italic">
                      {errors.panels.message}
                    </p>
                  )}
                </div>
              </div>
            </div>


            <div className="mt-2 w-full">
              <label htmlFor="name" className="text-base font-medium">
                Notes
              </label>
              <div className="w-full mx-auto">
                <Controller
                  name="notes"
                  control={control}
                  render={({ field }) => (
                    <textarea
                      {...field}
                      type="text"
                      autoComplete="off"
                      className="rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  )}
                />
              </div>
              <div className="pt-2">
                {errors.panels && (
                  <p className="text-red-500 text-xs italic">
                    {errors.panels.message}
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-10 md:ml-4">
            {fields?.map((field, index) => (
              <div className="rounded-md shadow-sm bg-slate-100 text-slate-800 p-6">
                <div className="flex justify-between">
                  <label htmlFor="name" className="text-md font-semibold">
                    {field.title}
                  </label>
                  <TrashIcon
                    type="button"
                    className="h-6 w-6 ml-4 text-blue-500 self-center"
                    onClick={() => removeField(index)}
                  />
                </div>
                <div className="flex flex-row w-full gap-2">
                  <div className="pt-2 w-full">
                    <label htmlFor="name" className="text-sm font-medium">
                      Value
                    </label>
                    <div className="pt-2">
                      <Controller
                        name={`panelFields[${index}].value`}
                        control={control}
                        defaultValue={field.value}
                        render={({ field }) => (
                          <input
                            {...field}
                            type="text"
                            required
                            autoComplete="off"
                            className="rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          />
                        )}
                      />
                    </div>
                  </div>
                  <div className="pt-2 w-full">
                    <label htmlFor="name" className="text-sm font-medium">
                      Units
                    </label>
                    <div className="pt-2">
                      <Controller
                        name={`panelFields[${index}].units`}
                        control={control}
                        defaultValue={field.units}
                        render={({ field }) => (
                          <input
                            {...field}
                            type="text"
                            required
                            autoComplete="off"
                            className="rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          />
                        )}
                      />
                    </div>
                  </div>

                  <div className="pt-2 w-full">
                    <label htmlFor="name" className="text-sm font-medium">
                      Low
                    </label>
                    <div className="pt-2">
                      <Controller
                        name={`panelFields[${index}].low`}
                        control={control}
                        defaultValue={field.low}
                        render={({ field }) => (
                          <input
                            {...field}
                            type="text"
                            required
                            autoComplete="off"
                            className="rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          />
                        )}
                      />
                    </div>
                  </div>
                  <div className="pt-2 w-full">
                    <label htmlFor="name" className="text-sm font-medium">
                      High
                    </label>
                    <div className="pt-2">
                      <Controller
                        name={`panelFields[${index}].high`}
                        control={control}
                        defaultValue={field.high}
                        render={({ field }) => (
                          <input
                            {...field}
                            type="text"
                            required
                            autoComplete="off"
                            className="rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          />
                        )}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div>
            <button
              type="submit"
              className="mt-2 group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
