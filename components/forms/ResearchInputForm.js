import { TrashIcon } from "@heroicons/react/24/solid";
import React, { useState, useEffect } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import Select from "../common/Select";
import { createResearchPOST, useLabPanels } from "@/hooks/api";
import { useMutation, queryClient } from "react-query";
import { toast } from "react-hot-toast";
import { useAuth } from "@clerk/nextjs";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useQueryClient } from "react-query";
import { visibilityOptions } from "./ResearchCommentInputForm";
import { usePatientContext } from "@/components/context/PatientContext";
import { PlusCircleIcon } from "@heroicons/react/20/solid";


export default function ResearchInputForm({
  closeModal,
  addLabs,
  statuses,
  researchCategories,
}) {
  const { getToken } = useAuth();
  const [startDateOpen, setStartDateOpen] = useState(false);
  const { patientId } = usePatientContext();


  const queryClient = useQueryClient();

  const { mutate: createResearch } = useMutation(
    (researchData) => createResearchPOST({ researchData }),
    {
      onSuccess: () => {
        toast.success("Successfully added research interest");
        queryClient.invalidateQueries(["researchInterest"]);
        closeModal();
      },
      onError: (error) => {
        toast.error("User not authorized to add research interests" + error);
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
    name: "comments",
  });

  const {
    fields: linkFields,
    append: appendLink,
    remove: removeLink,
  } = useFieldArray({
    control,
    name: "links",
  });
  const [datePickersOpen, setDatePickersOpen] = useState(
    linkFields.map(() => false)
  );
  const selectedPanel = watch("panel");

  const onSubmit = async (data) => {
    const token = await getToken();

    const researchData = {
      category: data.category.title,
      status: data.status.title,
      title: data.title,
      description: data.description,
      createdAt: data.startDate.toISOString().split("T")[0],
      notes: data.notes,
      links: data.links,
      comments: data.comments,
      visibility: data.visibility.id,
      pubmedKeywords: data.pubmedKeywords.trim(),
      token: token,
    };
    createResearch({ researchData });
  };

  const handleDatePickerOpen = (index) => {
    const newState = datePickersOpen.map((state, idx) =>
      idx === index ? !state : false
    );
    setDatePickersOpen(newState);
  };

  useEffect(() => {
    if (selectedPanel && selectedPanel.fields) {
      if (fields.length === 0) {
        append(selectedPanel.fields.map((field) => ({ ...field })));
      }
    }
  }, [selectedPanel, fields, append]);

  const removeField = (index, fieldType) => {
    fieldType === "comments" ? remove(index) : removeLink(index);
  };
  return (
    <div className="flex min-h-[500px] items-center self-center justify-center h-1/2">
      <div className="w-11/12 p-3">
        <h2 className="text-center text-3xl font-extrabold text-gray-900 mb-5">
          Add Research
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="rounded ">
          <div className="rounded-md pt-8 pb-3 p-5">
            <div className="pt-2 relative flex col-span-1 flex-col float-right z-40">
              <div
                htmlFor="startDate"
                className="text-base font-medium float-right"
              >
                Date
              </div>
              <div className="">
                <Controller
                  control={control}
                  name="startDate"
                  render={({ field }) => (
                    <ReactDatePicker
                      className="rounded-md z-40 relative w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
                  Research Category
                </label>
                <div className="w-full mx-auto relative z-10">
                  <Select
                    setValue={setValue}
                    {...register("category", {
                      required: "category is required",
                    })}
                    type="button"
                    id="category"
                    name="category"
                    options={researchCategories ?? []}
                  />
                </div>
                <div className="pt-2">
                  {errors.category && (
                    <p className="text-red-500 text-xs italic">
                      {errors.category.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="pt-2 w-full ">
                <label htmlFor="lab" className="text-base font-medium">
                  Status
                </label>
                <div className="relative w-full mx-auto z-10">
                  <Select
                    setValue={setValue}
                    {...register("status", {
                      required: "status is required",
                    })}
                    type="select"
                    id="status"
                    name="status"
                    options={statuses ?? []}
                  />
                </div>
                <div className="pt-2">
                  {errors.status && (
                    <p className="text-red-500 text-xs italic">
                      {errors.status.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="pt-2 w-full ">
                <label htmlFor="lab" className="text-base font-medium">
                  Visibility
                </label>
                <div className="relative w-full mx-auto z-10">
                  <Select
                    setValue={setValue}
                    {...register("visibility", {
                      required: "visibility is required",
                    })}
                    type="visibility"
                    id="visibility"
                    name="visibility"
                    options={visibilityOptions ?? []}
                  />
                </div>
                <div className="pt-2">
                  {errors.visibility && (
                    <p className="text-red-500 text-xs italic">
                      {errors.visibility.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-2 flex w-full flex-col float-right mb-4">
              <div
                htmlFor="title"
                className="text-base font-medium float-right"
              >
                Title
              </div>
              <div>
                <Controller
                  control={control}
                  name="title"
                  render={({ field }) => (
                    <input
                      {...field}
                      required
                      type="text"
                      className="rounded-md relative w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  )}
                />
              </div>
            </div>

            <div className="pt-2 flex w-full flex-col float-right mb-4">
              <div
                htmlFor="title"
                className="text-base font-medium float-right"
              >
                Description
              </div>
              <div>
                <Controller
                  control={control}
                  name="description"
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      className="rounded-md relative w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  )}
                />
              </div>
            </div>
            <div className="pt-2 flex w-full flex-col mb-4">
              <div
                htmlFor="keywords"
                className="text-base font-medium float-right"
              >
                PubMed Keywords
              </div>
              <div>
                <Controller
                  control={control}
                  name="pubmedKeywords"
                  render={({ field }) => (
                    <input
                      {...field}
                      required
                      type="text"
                      className="rounded-md relative w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  )}
                />
              </div>
            </div>
            <div className="pt-2 w-full">
              <label htmlFor="name" className="text-base font-medium">
                Notes
              </label>
              <div className="w-full mx-auto">
                <Controller
                  name="notes"
                  control={control}
                  render={({ field }) => (
                    <textarea
                      rows="5"
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

          <div className="pt-2 w-full flex flex-row p-5">
            <label htmlFor="links" className="text-base font-medium">
              Links
            </label>
            <div className="relative z-50">
              <button
                onClick={() => appendLink({})}
                type="button"
                className="rounded-full self-center text-white shadow-sm"
              >
                <PlusCircleIcon
                  className="h-6 w-6 text-blue-500 pl-1 hover:text-blue-600"
                  aria-hidden="true"
                />
              </button>
            </div>
            <div className="pt-2">
              {errors.links && (
                <p className="text-red-500 text-xs italic">
                  {errors.links.message}
                </p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 p-5 pt-0">
            {linkFields?.map((field, index) => (
              <div className="rounded-md shadow-sm bg-slate-200 text-slate-800 p-6 flex flex-row mb-10 border">
                <div className="flex flex-col w-full gap-2">
                  <div className="flex self-end">
                    <label
                      htmlFor="highlighted"
                      className="text-sm font-medium pr-3 self-center text-slate-600"
                    >
                      Highlighted
                    </label>

                    <Controller
                      name={`links[${index}].highlighted`}
                      control={control}
                      defaultValue={false}
                      render={({ field }) => (
                        //add check box for highlighted
                        <input
                          {...field}
                          type="checkbox"
                          autoComplete="off"
                          className="rounded-md w-4 h-4 self-center  border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      )}
                    />
                  </div>
                  <div className="pt-2 w-full">
                    <div className="w-full flex flex-row justify-between">
                      <div className="pt-2 flex flex-col">
                        <div
                          htmlFor="startDate"
                          className="text-base font-medium"
                        >
                          Date
                        </div>
                        <div>
                          <Controller
                            control={control}
                            name={`links[${index}].startDate`}
                            render={({ field }) => (
                              <ReactDatePicker
                                className="rounded-md relative w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                dateFormat="yyyy-MM-dd"
                                onChange={(date) => field.onChange(date)}
                                selected={field.value}
                                open={datePickersOpen[index]}
                                onClick={() => handleDatePickerOpen(index)}
                                onFocus={() => handleDatePickerOpen(index)}
                                onBlur={() => handleDatePickerOpen(index)}
                              />
                            )}
                          />
                        </div>
                      </div>
                      <div className="relative z-50 flex-col w-1/3 pt-2">
                        <label
                          htmlFor="category"
                          className="text-sm font-medium"
                        >
                          Category
                        </label>
                        <div>
                          <Controller
                            name={`links[${index}].category`}
                            control={control}
                            defaultValue={""} // Set the default value
                            render={({ field }) => (
                              <select
                                {...field}
                                className="border rounded-md p-2 text-gray-800 w-full text-sm"
                              >
                                <option value="supporting">Supporting</option>
                                <option value="refuting">Refuting</option>
                              </select>
                            )}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-row w-full">
                      <div className="w-full">
                        <label htmlFor="title" className="text-sm font-medium">
                          Title
                        </label>
                        <div className="pt-2 flex">
                          <Controller
                            name={`links[${index}].title`}
                            control={control}
                            defaultValue={field.title}
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
                  <div className="pt-2 w-full">
                    <label
                      htmlFor="description"
                      className="text-sm font-medium"
                    >
                      Description
                    </label>
                    <div className="pt-2">
                      <Controller
                        name={`links[${index}].description`}
                        control={control}
                        defaultValue={field.description}
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
                    <label htmlFor="link" className="text-sm font-medium">
                      Link
                    </label>
                    <div className="pt-2">
                      <Controller
                        name={`links[${index}].link`}
                        control={control}
                        defaultValue={field.link}
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
                    <label htmlFor="notes" className="text-sm font-medium">
                      Notes
                    </label>
                    <div className="pt-2">
                      <Controller
                        name={`links[${index}].notes`}
                        control={control}
                        defaultValue={field.notes}
                        render={({ field }) => (
                          <textarea
                            {...field}
                            type="text"
                            required
                            autoComplete="off"
                            className="rounded-md relative block w-full h-[100px] overflow-auto px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          />
                        )}
                      />
                    </div>
                  </div>
                </div>
                <TrashIcon
                  type="button"
                  className="h-6 w-6 ml-4 text-blue-500 self-center"
                  onClick={() => removeField(index, "links")}
                />
              </div>
            ))}
          </div>

          <div className="pt-2 w-full flex flex-row p-5">
            <label htmlFor="name" className="text-base font-medium">
              Add Note/Comment
            </label>
            <div className="relative z-50">
              <button
                onClick={() => append({})}
                type="button"
                className="rounded-full self-center text-white shadow-sm"
              >
                <PlusCircleIcon
                  className="h-6 w-6 text-blue-500 pl-1 hover:text-blue-600"
                  aria-hidden="true"
                />
              </button>
            </div>
            <div className="pt-2">
              {errors.comments && (
                <p className="text-red-500 text-xs italic">
                  {errors.comments.message}
                </p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 p-5">
            {fields?.map((field, index) => (
              <div className="rounded-md shadow-sm bg-slate-200 text-slate-800 p-6 flex flex-row mb-10">
                <div className="flex flex-col w-full gap-2">
                  <div className="flex self-end">
                    <label
                      htmlFor="name"
                      className="text-sm font-medium pr-3 self-center text-slate-600"
                    >
                      Highlighted
                    </label>

                    <Controller
                      name={`comments[${index}].highlighted`}
                      control={control}
                      defaultValue={false}
                      render={({ field }) => (
                        //add check box for highlighted
                        <input
                          {...field}
                          type="checkbox"
                          autoComplete="off"
                          className="rounded-md w-4 h-4 self-center  border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      )}
                    />
                  </div>
                  <div className="flex flex-row">
                    <div className="pt-2 w-full">
                      <label htmlFor="name" className="text-sm font-medium">
                        Title
                      </label>
                      <div className="pt-2">
                        <Controller
                          name={`comments[${index}].title`}
                          control={control}
                          defaultValue={field.title}
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
                    <div className="relative z-50 flex-col w-1/3 pt-4 pl-4 self-center">
                      <label htmlFor="category" className="text-sm font-medium">
                        Category
                      </label>
                      <div>
                        <Controller
                          name={`comments[${index}].category`}
                          control={control}
                          defaultValue={""} // Set the default value
                          render={({ field }) => (
                            <select
                              {...field}
                              className="border rounded-md p-2 text-gray-800 w-full text-sm"
                            >
                              <option value="note">Note</option>
                              <option value="question">Question</option>
                              <option value="brainstorm">Brainstorm</option>
                              <option value="other">Other</option>
                            </select>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="pt-2 w-full">
                    <label htmlFor="name" className="text-sm font-medium">
                      Description
                    </label>
                    <div className="pt-2">
                      <Controller
                        name={`comments[${index}].description`}
                        control={control}
                        defaultValue={field.description}
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
                      Notes
                    </label>
                    <div className="pt-2">
                      <Controller
                        name={`comments[${index}].notes`}
                        control={control}
                        defaultValue={field.notes}
                        render={({ field }) => (
                          <textarea
                            {...field}
                            type="text"
                            required
                            autoComplete="off"
                            className="rounded-md relative block w-full h-[400px] px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          />
                        )}
                      />
                    </div>
                  </div>
                </div>
                <TrashIcon
                  type="button"
                  className="h-6 w-6 ml-4 text-blue-500 self-center"
                  onClick={() => removeField(index, "comments")}
                />
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
