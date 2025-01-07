import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import Select from "../common/Select";
import {
  createResearchInterestLinkPOST,
  updateResearchInterestLinkPATCH,
} from "@/hooks/api";
import { useMutation, queryClient } from "react-query";
import { toast } from "react-hot-toast";
import { useAuth } from "@clerk/nextjs";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useQueryClient } from "react-query";
import { usePatientContext } from "@/components/context/PatientContext";

export default function ResearchLinkInputForm({
  closeModal,
  researchLink,
  researchInterestId,
}) {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();
  const [startDateOpen, setStartDateOpen] = useState(false);
  const { patientId } = usePatientContext();

  const { mutate: createLink } = useMutation(
    (payload) => createResearchInterestLinkPOST({ data: payload, patientId }),
    {
      onSuccess: () => {
        toast.success("Successfully added research link");
        queryClient.invalidateQueries(["researchInterest", researchInterestId]);
        closeModal();
      },
      onError: (error) => {
        toast.error("User not authorized to add research link");
      },
    }
  );

  const { mutate: updateLink } = useMutation(
    (payload) => updateResearchInterestLinkPATCH({ data: payload, patientId }),
    {
      onSuccess: () => {
        toast.success("Successfully updated research link");
        queryClient.invalidateQueries(["researchInterest", researchInterestId]);
        closeModal();
      },
      onError: (error) => {
        toast.error("User not authorized to update research link");
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
      startDate: new Date(researchInterestId?.startDate ?? new Date()),
      highlighted: researchLink?.highlighted ?? false,
    },
  });

  const visibilityOptions = [
    {
      title: "Public",
      id: "public",
    },
    {
      title: "Research",
      id: "research",
    },
    {
      title: "Private",
      id: "private",
    },
  ];

  // Register the DatePicker component for react-hook-form
  useEffect(() => {
    register("startDate");
  }, [register]);

  const onSubmit = async (data) => {
    const token = await getToken();

    const payload = {
      ...data,
      startDate: data.startDate.toISOString().split("T")[0],
      status: "unreviewed",
      researchInterestId: researchInterestId,
      patientId: patientId,
    };

    if (researchLink) {
      payload.id = researchLink.researchLinkId;
      updateLink({ payload, token });
    } else {
      createLink({ payload, token });
    }
  };

  const handleDatePickerOpen = () => {
    setStartDateOpen(!startDateOpen);
  };

  return (
    <div className="flex min-h-[500px] items-center self-center justify-center h-1/2">
      <div className="w-11/12 p-3">
        <h2 className="text-center text-3xl font-extrabold text-gray-900 mb-5">
          Add Research Link
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="rounded ">
          <div className="pt-2 w-full flex flex-row p-5">
            <div className="pt-2">
              {errors.links && (
                <p className="text-red-500 text-xs italic">
                  {errors.links.message}
                </p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 p-5 pt-0">
            <div className="rounded-md shadow-sm  text-slate-800 p-6 flex flex-row mb-10 ">
              <div className="flex flex-col w-full gap-2">
                <div className="flex self-end">
                  <label
                    htmlFor="highlighted"
                    className="text-base font-medium pr-3 self-center text-slate-600"
                  >
                    Highlighted
                  </label>

                  <Controller
                    name={`highlighted`}
                    control={control}
                    render={({ field }) => (
                      //add check box for highlighted
                      <input
                        {...field}
                        checked={field.value}
                        type="checkbox"
                        autoComplete="off"
                        className="rounded-md w-5 h-5 self-center  border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    )}
                  />
                </div>
                <div className="pt-2 w-full">
                  <div className="w-full flex flex-row justify-between">
                    <div className="flex flex-col">
                      <div
                        htmlFor="startDate"
                        className="text-base font-medium"
                      >
                        Associated Date
                        <p className="text-xs italic mb-2 text-slate-500">
                          Example, date an article was published
                        </p>
                      </div>
                      <div>
                        <Controller
                          control={control}
                          name={`startDate`}
                          render={({ field }) => (
                            <ReactDatePicker
                              className="rounded-md relative w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              dateFormat="yyyy-MM-dd"
                              onChange={(date) => field.onChange(date)}
                              selected={field.value}
                              open={startDateOpen}
                              onClick={() => handleDatePickerOpen()}
                              onFocus={() => handleDatePickerOpen()}
                              onBlur={() => handleDatePickerOpen()}
                            />
                          )}
                        />
                      </div>
                    </div>
                    <div className="relative z-50 flex-col w-1/3 pt-2">
                      <label htmlFor="category" className="text-sm font-medium">
                        Category
                        <p className="text-xs italic p-2 text-slate-500">
                        </p>
                      </label>
                      <div>
                        <Controller
                          name={`category`}
                          control={control}
                          defaultValue={researchLink?.category ?? "supporting"}
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
                    <div className="relative z-50 flex-col w-1/3 pt-2">
                      <label htmlFor="category" className="text-sm font-medium">
                        Link Type
                        <p className="text-xs italic p-2 text-slate-500">
                        </p>
                      </label>
                      <div>
                        <Controller
                          name={`linkType`}
                          control={control}
                          defaultValue={researchLink?.linkType ?? "article"}
                          render={({ field }) => (
                            <select
                              {...field}
                              className="border rounded-md p-2 text-gray-800 w-full text-sm"
                            >
                              <option value="article">Article</option>
                              <option value="image">Image</option>
                              <option value="social">Social</option>
                              <option value="resource">Resource</option>
                              <option value="reference">Reference</option>
                              <option value="other">Other</option>
                            </select>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-row w-full">
                    <div className="w-full mt-">
                      <label htmlFor="title" className="text-sm font-medium">
                        Title
                      </label>
                      <div className="pt-2 flex">
                        <Controller
                          name={`title`}
                          control={control}
                          defaultValue={researchLink?.title ?? null}
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
                  <label htmlFor="description" className="text-sm font-medium">
                    Description
                  </label>
                  <div className="pt-2">
                    <Controller
                      name={`description`}
                      control={control}
                      defaultValue={researchLink?.description ?? null}
                      render={({ field }) => (
                        <textarea
                          rows="4"
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
                      name={`link`}
                      control={control}
                      defaultValue={researchLink?.link ?? null}
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
                      name={`notes`}
                      control={control}
                      defaultValue={researchLink?.notes ?? null}
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
            </div>
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
