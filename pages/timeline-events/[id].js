"use client";

import {
  useTimelineEvent,
  updatetimelineItemPATCH,
  useDiagnoses,
  useMedications,
  useInterventions,
  useImaging,
  useLabsByDateRange,
} from "@/hooks/api";
import React, { Fragment, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useSession, getSession } from "next-auth/react";
import { PencilSquareIcon } from "@heroicons/react/24/solid";
import Modal from "@/components/Modal";
import AuthorsForm from "@/components/forms/MedicationForm";
import { queryClient } from "@/queryClient";
import { useForm } from "react-hook-form";
import { useMutation } from "react-query";
import { toast } from "react-hot-toast";
import TagDetails from "@/components/timeline/TagDetails";
import { usePatientContext } from "@/components/context/PatientContext";

const TimelineEvent = () => {
  //get the id from the url
  const router = useRouter();
  const { data: session } = useSession();
  const { id } = router.query;
  const timelineItemId = router.query.id;
  const { patientId } = usePatientContext();

  const {
    data: timelineItem,
    isLoading,
    isError,
  } = useTimelineEvent({
    patientId: patientId,
    timelineId: timelineItemId,
  });

  const { data: diagnoses } = useDiagnoses({ id: patientId });
  const { data: medications } = useMedications(
    { id: patientId }
  );
  const { data: interventions } = useInterventions(
    { id: patientId }
  );
  const { data: imaging } = useImaging(
    { id: patientId }
  );

  const { data: labs } = useLabsByDateRange(
    {
      id: patientId,
      startDate: timelineItem?.startDate,
      daysBefore: 14,
      daysAfter: 21,
    },
    {
      enabled:
        timelineItem?.startDate !== undefined,
    }
  );

  const { mutate } = useMutation(updatetimelineItemPATCH, {
    onSuccess: (data) => {
      // Handle successful response
      // fetchAllOrganizations(session).then((data) => {
      //   setOrganizations(data);
      // });
    },
    onError: (error) => {
      // Handle error
      toast.error("Error updating order");
    },
  });

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: timelineItem?.title ?? "",
      manufacturer: timelineItem?.manufacturer ?? "",
      category: timelineItem?.category ?? "",
      tags: timelineItem?.tags ?? [],
      prescribing_provider: timelineItem?.prescribing_provider ?? "",
      startDate: timelineItem?.startDate ?? "",
      startDate: timelineItem?.endDate ?? "",
      status: timelineItem?.status ?? "",
      dosage: timelineItem?.dosage ?? "",
      notes: timelineItem?.notes ?? "",
      diagnosis: timelineItem?.diagnosis ?? "",
      reason: timelineItem?.reason ?? "",
      timelineItemId: timelineItem?.timelineItemId ?? "",
      patientId: timelineItem?.patientId ?? "",
      sideEffects: timelineItem?.sideEffects ?? [],
      diagnoses: timelineItem?.diagnoses ?? null,
    },
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (timelineItem) {
      setValue("title", timelineItem.title);
      setValue("link", timelineItem.link);
      setValue("datePublished", timelineItem.datePublished);
      setValue("headline", timelineItem.headline);
      setValue("description", timelineItem.description);
      setValue("highlighted", timelineItem.highlighted);
      setValue("management", timelineItem.management);
      setValue("organizationId", timelineItem.organizationId);
      setValue("sideEffects", timelineItem.timelineItemSideEffects);
    } else {
    }
  }, [timelineItem]);

  const onSubmit = async (data) => {
    const pasttimelineItem = {
      id: timelineItem.id,
      title: timelineItem.title,
      link: timelineItem.link,
      datePublished: timelineItem.datePublished,
      headline: timelineItem.headline,
      description: timelineItem.description,
      highlighted: timelineItem.highlighted,
      management: timelineItem.management,
      organizationId: timelineItem.organizationId,
      sideEffects: timelineItem.timelineItemSideEffects,
    };

    const currenttimelineItem = {
      id: timelineItem.id,
      title: data.title,
      link: data.link,
      datePublished: data.datePublished,
      headline: data.headline,
      description: data.description,
      highlighted: data.highlighted,
      management: data.management,
      organizationId: data.organizationId,
      sideEffects: data.sideEffects,
    };

    const payloadData = {
      pasttimelineItem: pasttimelineItem,
      currenttimelineItem: currenttimelineItem,
      updateOrder: false,
    };

    const payload = {
      data: payloadData,
      session,
    };

    const hasUpdated = mutate(payload, {
      onSuccess: (data) => {
        // setIsToggled(!isToggled);
        toast.success("timelineItem updated successfully");
        queryClient.invalidateQueries("timelineItems");
        //TODO: update this to the proper route
        router.push("/dashboard");
      },
    });
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  return (
    <div>
      {timelineItemId !== "create" ? (
        <div className="pl-3 pr-3 w-[80%] mx-auto mt-14 pb-20">
          <TagDetails
            selectedItem={timelineItem}
            displayFull={true}
            medications={medications ?? []}
            interventions={interventions ?? []}
            imaging={imaging ?? []}
            diagnoses={diagnoses ?? []}
            links={timelineItem?.links ?? []}
            labs={labs}
          />
        </div>
      ) : (
        <>
          {isModalOpen && (
            <Modal
              show={isModalOpen}
              fragment={Fragment}
              closeModal={closeModal}
            >
              <AuthorsForm
                closeModal={closeModal}
                timelineItem={timelineItem}
                sideEffects={watch("sideEffects")}
              />
            </Modal>
          )}
          <div className="flex items-center self-center justify-center">
            <div className="w-3/4 p-5">
              <h2 className="text-left pt-10 text-3xl font-semibold pl-5 text-gray-900 mb-5">
                {timelineItem?.title ?? "timelineItem"}
              </h2>
              <div className="grid grid-cols-1">
                <form onSubmit={handleSubmit(onSubmit)} className="rounded p-3">
                  <div className="rounded-md shadow-sm -space-y-px p-6">
                    <div className="flex-row flex gap-2">
                      <div className="w-1/2">
                        <label className="text-sm font-medium">
                          timelineItem
                        </label>
                        <div className="pt-2">
                          <input
                            {...register("title", {
                              required: "timelineItem title is required",
                            })}
                            name="title"
                            type="text"
                            required
                            autoComplete="off"
                            className="rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900  focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 text-sm"
                          />

                          {errors.title && (
                            <p className="text-red-500 text-xs italic">
                              {errors.title.message}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="w-1/2">
                        <label htmlFor="status" className="text-sm font-medium">
                          Status
                        </label>
                        <div className="pt-2">
                          <input
                            {...register("status")}
                            id="status"
                            name="status"
                            type="text"
                            autoComplete="off"
                            className="rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900  focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                          />

                          {errors.name && (
                            <p className="text-red-500 text-xs italic">
                              {errors.status.message}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-row w-full gap-2">
                      <div className="pt-2 w-1/2">
                        <label
                          htmlFor="start-date"
                          className="text-sm font-medium"
                        >
                          Start Date
                        </label>
                        <div className="pt-2">
                          <input
                            {...register("startDate", {
                              required: "startDate is required",
                            })}
                            id="startDate"
                            name="startDate"
                            type="date"
                            required
                            autoComplete="off"
                            className="rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900  focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                          />

                          {errors.name && (
                            <p className="text-red-500 text-xs italic">
                              {errors.startDate.message}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="pt-2 w-1/2">
                        <label
                          htmlFor="end-date"
                          className="text-sm font-medium"
                        >
                          End Date
                        </label>
                        <div className="pt-2">
                          <input
                            {...register("endDate", {
                              required: "endDate is required",
                            })}
                            id="endDate"
                            name="endDate"
                            type="date"
                            required
                            autoComplete="off"
                            className="rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900  focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                          />

                          {errors.name && (
                            <p className="text-red-500 text-xs italic">
                              {errors.endDate.message}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="w-full flex flex-row gap-2">
                      <div className="pt-2 w-1/2">
                        <label
                          htmlFor="manufacturer"
                          className="text-sm font-medium"
                        >
                          Manufacturer
                        </label>
                        <div className="pt-2">
                          <input
                            {...register("manufacturer")}
                            id="manufacturer"
                            name="manufacturer"
                            type="text"
                            autoComplete="off"
                            className="rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900  focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                          />

                          {errors.name && (
                            <p className="text-red-500 text-xs italic">
                              {errors.manufacturer.message}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="pt-2 w-1/2">
                        <label
                          htmlFor="category"
                          className="text-sm font-medium"
                        >
                          Category
                        </label>
                        <div className="pt-2">
                          <input
                            {...register("category")}
                            id="category"
                            name="category"
                            type="text"
                            autoComplete="off"
                            className="rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900  focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                          />

                          {errors.name && (
                            <p className="text-red-500 text-xs italic">
                              {errors.category.message}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="pt-2">
                      <label htmlFor="tags" className="text-sm font-medium">
                        Tags
                      </label>
                      <textarea
                        {...register("tags")}
                        id="tags"
                        type="text"
                        className="rounded-md mt-2 relative h-20 block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900  focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                      />
                      {errors.tags && (
                        <p className="text-red-500 text-xs italic">
                          {errors.tags.message}
                        </p>
                      )}
                    </div>
                    <div className="pt-2">
                      <label htmlFor="notes" className="text-sm font-medium">
                        Notes
                      </label>
                      <textarea
                        {...register("notes")}
                        id="notes"
                        type="text"
                        className="rounded-md mt-2 relative h-40 block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900  focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                      />
                      {errors.notes && (
                        <p className="text-red-500 text-xs italic">
                          {errors.notes.message}
                        </p>
                      )}
                    </div>

                    <div className="pt-4 pb-4 mb-10">
                      <div className="divide-y divide-gray-200">
                        <div className="flex gap-2">
                          <div className="w-full h-full">
                            <label
                              htmlFor="diagnosis"
                              className="text-sm font-medium text-gray-700"
                            >
                              Diagnosis
                            </label>
                            <div className="w-full h-full self-center">
                              <select
                                {...register("diagnosis")}
                                id="diagnosis"
                                name="diagnosis"
                                className="self-center w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                              >
                                <option value="">Select a Diagnosis</option>
                                {diagnoses.map((diagnosis, index) => (
                                  <option key={index} value={diagnosis}>
                                    {diagnosis.title}{" "}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                          <div className="w-1/2">
                            <label
                              htmlFor="list-order"
                              className="text-sm font-medium"
                            >
                              List Order
                            </label>
                            <div className="">
                              <input
                                {...register("listOrder")}
                                id="listOrder"
                                name="listOrder"
                                type="number"
                                autoComplete="off"
                                className="rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900  focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                              />

                              {errors.name && (
                                <p className="text-red-500 text-xs italic">
                                  {errors.listOrder.message}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-row mt-10 ">
                      <div className="font-semibold text-lg">Side Effects</div>
                      <button onClick={openModal} type="button">
                        <PencilSquareIcon className="h-5 w-5 text-blue-500 ml-2" />
                      </button>
                    </div>
                    <div className="">
                      {watch("sideEffects")
                        .sort((a, b) => {
                          // if either value is null, sort it last
                          if (a.listOrder === null) return 1;
                          if (b.listOrder === null) return -1;

                          return a.listOrder - b.listOrder;
                        })
                        .map((item, index) => (
                          <div
                            key={item.id}
                            className="col-span-2 p-2 border-b mt-2 mb-2 rounded"
                          >
                            <div className="flex flex-row self-center h-full">
                              <div>
                                <div key={index} className="text-sm font-light">
                                  {item.firstName} {item.lastName}{" "}
                                  {item.designation}, {item.institution}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                  <div>
                    <button
                      type="submit"
                      className="mt-10 group relative w-full mb-10 flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Save timelineItem
                    </button>
                  </div>
                </form>
                {/* <div>
          <div className="flex flex-row mt-10 ">
            <div className="font-semibold text-lg">sideEffects</div>
            <button
              onClick={() =>
                append({ firstName: "", lastName: "", institution: "" })
              }
              type="button"
            >
              <PlusCircleIcon className="h-5 w-5 text-blue-500 ml-2" />
            </button>
          </div>
          <div className="w-full flex flex-col">
            {watch("sideEffects").map((item, index) => (
              <div
                key={item.id}
                className="w-full p-4 border-b mt-2 mb-2 rounded"
              >
                <div className="flex flex-row self-center h-full">
                  <div>
                    <div key={index} className="grid gap-1 grid-cols-12">
                      <input
                        {...register(`sideEffects[${index}].firstName`, {
                          required: "first name is required",
                        })}
                        data-lpignore="true"
                        type="text"
                        required
                        autoComplete="off"
                        className="rounded-md col-span-5 px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900  focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 text-sm"
                        placeholder="First Name"
                      />
                      <input
                        {...register(`sideEffects[${index}].lastName`, {
                          required: "Last name is required",
                        })}
                        data-lpignore="true"
                        type="text"
                        required
                        autoComplete="off"
                        className="rounded-md col-span-5 px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900  focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                        placeholder="Last Name"
                      />
                      <input
                        {...register(`sideEffects[${index}].designation`)}
                        data-lpignore="true"
                        type="text"
                        autoComplete="off"
                        className="rounded-md col-span-2 px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900  focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                        placeholder="Designation"
                      />
                    </div>
                    <div>
                      <input
                        {...register(`sideEffects[${index}].institution`, {
                          required: "Institution is required",
                        })}
                        data-lpignore="true"
                        type="text"
                        required
                        autoComplete="off"
                        className="rounded-md mt-2 relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900  focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                        placeholder="Institution"
                      />
                    </div>
                  </div>
                  <TrashIcon
                    type="button"
                    className="h-6 w-6 ml-4 text-blue-500  self-center"
                    onClick={() => remove(index)}
                  />
                </div>
              </div>
            ))}
          </div>
          {errors.sideEffects && (
            <p className="text-red-500 text-xs italic">
              {errors.sideEffects.message}
            </p>
          )}
        </div> */}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TimelineEvent;
