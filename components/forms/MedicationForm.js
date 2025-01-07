import { PlusCircleIcon, TrashIcon } from "@heroicons/react/24/solid";
import { add } from "lodash";
import React, { use, useState, useEffect } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { useMutation } from "react-query";
import { toast } from "react-hot-toast";
import {
  createAuthorPOST,
  deleteSideEffectPOST,
  updateAuthorsPOST,
} from "@/hooks/api";
import { useSession } from "next-auth/react";
import { queryClient } from "@/queryClient";
import MedicationSearch from "../AddMedication";

export default function MedicationForm({
  closeModal,
  sideEffects,
  medication,
}) {
  const { data: session } = useSession();
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {

    },
  });

  const onSubmit = (data) => {
    console.log(data);
  }


  return (
    <div className="flex min-h-[500px] items-center self-center justify-center h-1/2">
      <div className="w-11/12 p-3">
        <h2 className="text-center text-3xl font-extrabold text-gray-900 mb-5">
          Add Comment
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="">
          <div className="pt-2 w-full flex flex-row p-5">
            <div className="pt-2">
              {errors.comments && (
                <p className="text-red-500 text-xs italic">
                  {errors.comments.message}
                </p>
              )}
            </div>
          </div>
          <div className="w-full">
            <div className="rounded-md shadow-sm text-slate-800 p-6 flex flex-row mb-5">
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
                <div className="flex flex-row">
                  <div className="pt-2 w-full">
                    <label htmlFor="name" className="text-sm font-medium">
                      Title
                    </label>

                    <MedicationSearch />
                    {/* <div className="pt-2">
                      <Controller
                        name={`title`}
                        control={control}
                        defaultValue={medication?.title ?? null}
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
                    </div> */}
                  </div>
                  {/* <div className="relative z-50 flex-col w-1/3 pt-4 pl-4 self-center">
                    <label htmlFor="category" className="text-sm font-medium">
                      Category
                    </label>
                    <div>
                      <Controller
                        name={`category`}
                        control={control}
                        defaultValue={medication?.category ?? "note"}
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
                  </div> */}
                </div>
                {/* <div className="pt-2 w-full">
                  <label htmlFor="name" className="text-sm font-medium">
                    Description
                  </label>
                  <div className="pt-2">
                    <Controller
                      name={`description`}
                      control={control}
                      defaultValue={medication?.description ?? ""}
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
                      name={`notes`}
                      control={control}
                      defaultValue={medication?.notes ?? ""}
                      render={({ field }) => (
                        <textarea
                          {...field}
                          rows="15"
                          type="text"
                          required
                          autoComplete="off"
                          className="rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      )}
                    />
                  </div>
                </div> */}
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
