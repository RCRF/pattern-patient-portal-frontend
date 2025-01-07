import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import PhotoUpload from "../common/PhotoUpload";
import { useMutation, useQueryClient } from "react-query";
import { toast } from "react-hot-toast";
import { useAuth } from "@clerk/nextjs";
import { usePatientContext } from "@/components/context/PatientContext";
import { updatePatientPATCH, usePatient } from "@/hooks/api";
import { FileUploader } from "../common/FileUploader";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/20/solid";
import { useRouter } from "next/router";

export default function ProfileForm({ closeModal }) {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();
  const [group2Expanded, setGroup2Expanded] = useState(false);
  const [group1Expanded, setGroup1Expanded] = useState(true);
  const { patientId } = usePatientContext();
  const router = useRouter();

  const { data: patient } = usePatient({ id: patientId });


  const { mutate: updatePatient } = useMutation(
    (payload) => updatePatientPATCH({ data: payload }),
    {
      onSuccess: () => {
        toast.success("Successfully updated patient");
        queryClient.invalidateQueries(["patient"]);
        if (closeModal) {
          closeModal();
        }
        //push back to homepage
        router.push('/dashboard')

      },
      onError: (error) => {
        toast.error("Unable to update patient" + error);
      },
    }
  );

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


  useEffect(() => {
    if (patient) {
      reset(patient);
    }
  }, [patient, reset]);


  const onSubmit = async (data) => {
    const token = await getToken();
    data.token = token;
    updatePatient(data);

  };


  return (
    <div className="flex items-center self-center justify-center h-1/2">

      <div className="w-394 p-5">
        <div className="flex flex-col w-full justify-center">
          <h2 className="text-center text-3xl font-extrabold text-gray-900  mt-12">
            Update Profile
          </h2>
          <div className="flex flex-row justify-center mt-2 text-sm">Use the form below to update your profile</div>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className=" rounded p-3">
          <div className="rounded-md shadow-sm -space-y-px p-6">


            <div className="flex flex-row justify-between pt-10">
              <h3 className="text-xl font-bold leading-6 text-gray-900 mb-5">Basics</h3>
              <button type="button" onClick={() => setGroup1Expanded(!group1Expanded)} className="self-center h-full font-bold pr-2 rounded ">
                {group1Expanded ? <ChevronUpIcon className="w-7 h-7" /> : <ChevronDownIcon className="w-7 h-7" />}
              </button>
            </div>

            {
              group1Expanded && (
                <div className="w-full">
                  <div className="grid grid-cols-1 lg:grid-cols-7 gap-2 mt-4">
                    <div className='col-span-1 lg:col-span-3'>
                      <div className="flex flex-row gap-2">
                        <div className='flex flex-col w-full'>
                          <label htmlFor="reason" className="text-sm font-medium">
                            First Name
                          </label>
                          <div className="pt-3 w-full">
                            <Controller
                              control={control}
                              name="firstName"
                              render={({ field }) => (
                                <input
                                  {...register('firstName', { required: true })}
                                  type="text"
                                  autoComplete="off"
                                  className="rounded-md px-3 w-full py-2 shadow-md placeholder-gray-500  border text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                />
                              )}
                            />

                          </div>
                        </div>
                        <div className='flex flex-col w-full'>
                          <label htmlFor="reason" className="text-sm font-medium">
                            Last Name
                          </label>
                          <div className="pt-3 w-full">
                            <Controller
                              control={control}
                              name="lastName"
                              render={({ field }) => (
                                <input
                                  {...register('lastName', { required: true })}
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
                    <div className="col-span-1 lg:col-span-1 self-center mt-1">
                      <div className="flex flex-col ">
                        <label htmlFor="category" className="text-sm font-medium mb-2">
                          Phone
                        </label>
                        <Controller
                          control={control}
                          name="phone"
                          render={({ field }) => (
                            <input
                              {...register('phone')}
                              type="text"
                              autoComplete="off"
                              className="rounded-md px-3 w-full py-2 shadow-md placeholder-gray-500  border text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                          )}
                        />
                      </div>
                    </div>
                    <div className="col-span-1 lg:col-span-2 self-center mt-1">
                      <div className="flex flex-col ">
                        <label htmlFor="category" className="text-sm font-medium mb-2">
                          Email
                        </label>
                        <Controller
                          control={control}
                          name="email"
                          render={({ field }) => (
                            <input
                              {...register('email')}
                              type="text"
                              autoComplete="off"
                              className="rounded-md px-3 w-full py-2 shadow-md placeholder-gray-500  border text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                          )}
                        />
                      </div>
                    </div>
                    <div className="flex flex-row gap-2">
                      <div className='flex flex-col w-full'>
                        <label htmlFor="name" className="text-sm font-semibold">
                          Date of Birth
                        </label>
                        <div className="pt-3">
                          <Controller
                            control={control}
                            name="dob"
                            render={({ field }) => (
                              <input
                                {...register('dob')}
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

                  {/* Address  */}
                  <div className="grid grid-cols-5 gap-2 pt-4">
                    <div className='col-span-3'>
                      <div className='flex flex-col w-full'>
                        <label htmlFor="address_1" className="text-sm font-medium">
                          Address 1
                        </label>
                        <div className="pt-2 w-full">
                          <Controller
                            control={control}
                            name="address_1"
                            render={({ field }) => (
                              <input
                                {...register('address_1')}
                                type="text"
                                autoComplete="off"
                                className="rounded-md px-3 w-full py-2 shadow-md placeholder-gray-500  border text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              />
                            )}
                          />

                        </div>
                      </div>
                    </div>
                    <div className='flex flex-row col-span-2'>
                      <div className='flex flex-col w-full'>
                        <label htmlFor="address_2" className="text-sm font-medium">
                          Address 2
                        </label>
                        <div className="pt-2 w-full">
                          <Controller
                            control={control}
                            name="address_2"
                            render={({ field }) => (
                              <input
                                {...register('address_2')}
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
                  {/* These all need to be revised to be drop downs  */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 w-full gap-2 pt-4">
                    <div className='flex flex-col cols-span-1'>
                      <label htmlFor="city" className="text-sm font-medium">
                        City
                      </label>
                      <div className="pt-2 w-full">
                        <Controller
                          control={control}
                          name="city"
                          render={({ field }) => (
                            <input
                              {...register('city')}
                              type="text"
                              autoComplete="off"
                              className="rounded-md px-3 w-full py-2 shadow-md placeholder-gray-500  border text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                          )}
                        />

                      </div>
                    </div>
                    <div className='flex flex-col cols-span-1'>
                      <label htmlFor="state" className="text-sm font-medium">
                        State
                      </label>
                      <div className="pt-2 w-full">
                        <Controller
                          control={control}
                          name="state"
                          render={({ field }) => (
                            <input
                              {...register('state')}
                              type="text"
                              autoComplete="off"
                              className="rounded-md px-3 w-full py-2 shadow-md placeholder-gray-500  border text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                          )}
                        />

                      </div>
                    </div>

                    <div className='flex flex-col cols-span-1'>
                      <label htmlFor="country" className="text-sm font-medium">
                        Country
                      </label>
                      <div className="pt-2 w-full">
                        <Controller
                          control={control}
                          name="country"
                          render={({ field }) => (
                            <input
                              {...register('country')}
                              type="text"
                              autoComplete="off"
                              className="rounded-md px-3 w-full py-2 shadow-md placeholder-gray-500  border text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                          )}
                        />

                      </div>
                    </div>
                    <div className='flex flex-col cols-span-1'>
                      <label htmlFor="postal" className="text-sm font-medium">
                        Postal
                      </label>
                      <div className="pt-2 w-full">
                        <Controller
                          control={control}
                          name="postalCode"
                          render={({ field }) => (
                            <input
                              {...register('postalCode')}
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
              )
            }



            <div className="flex flex-row justify-between pt-10">
              <h3 className="text-xl font-bold leading-6 text-gray-900 mb-5">Details</h3>
              <button type="button" onClick={() => setGroup2Expanded(!group2Expanded)} className="self-center h-full font-bold pr-2 rounded ">
                {group2Expanded ? <ChevronUpIcon className="w-7 h-7" /> : <ChevronDownIcon className="w-7 h-7" />}
              </button>
            </div>

            {group2Expanded &&
              (
                <div>
                  {/* image  */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
                    <div className='col-span-1 lg:col-span-2 mt-4'>
                      <label htmlFor="link" className="text-sm font-medium">
                        Photo Link
                      </label>
                      <div className="pt-2 w-full">
                        <Controller
                          control={control}
                          name="image"
                          render={({ field }) => (
                            <input
                              {...register('image')}
                              type="url"
                              autoComplete="off"
                              className="rounded-md px-3 w-full py-2 shadow-md placeholder-gray-500  border text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                          )}
                        />

                      </div>
                    </div>
                    {/* todo: This needs to be revised this will upload a photo but we may need to change how it is displayed */}
                    <div className='col-span-1 lg:col-span-1 mt-4 self-center flex flex-col gap-1'>
                      <label htmlFor="link" className="text-sm font-medium mb-1">
                        Upload Photo
                      </label>
                      <FileUploader
                        control={control}
                        name="file"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-5 gap-2 mt-5">
                    {/* emergency contact  */}
                    <div className='col-span-1 lg:col-span-2'>
                      <div className='flex flex-col w-full'>
                        <label htmlFor="reason" className="text-sm font-medium">
                          Emergency Contact Name
                        </label>
                        <div className="pt-3 w-full">
                          <Controller
                            control={control}
                            name="emergencyContactName"
                            render={({ field }) => (
                              <input
                                {...register('emergencyContactName')}
                                type="text"
                                autoComplete="off"
                                className="rounded-md px-3 w-full py-2 shadow-md placeholder-gray-500  border text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              />
                            )}
                          />

                        </div>
                      </div>
                    </div>

                    <div className='col-span-1 lg:col-span-1'>
                      <div className='flex flex-col w-full'>
                        <label htmlFor="reason" className="text-sm font-medium">
                          Emergency Contact Phone
                        </label>
                        <div className="pt-3 w-full">
                          <Controller
                            control={control}
                            name="emergencyContactPhone"
                            render={({ field }) => (
                              <input
                                {...register('emergencyContactPhone')}
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
                          Emergency Contact Email
                        </label>
                        <Controller
                          control={control}
                          name="emergencyContactEmail"
                          render={({ field }) => (
                            <input
                              {...register('emergencyContactEmail')}
                              type="text"
                              autoComplete="off"
                              className="rounded-md px-3 w-full py-2 shadow-md placeholder-gray-500  border text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                          )}
                        />
                      </div>
                    </div>

                    <div className="col-span-1 lg:col-span-1 self-center mt-1">
                      <div className="flex flex-col ">
                        <label htmlFor="category" className="text-sm font-medium mb-2">
                          Emergency Contact Relationship
                        </label>
                        <Controller
                          control={control}
                          name="emergencyContactRelationship"
                          render={({ field }) => (
                            <input
                              {...register('emergencyContactRelationship')}
                              type="text"
                              autoComplete="off"
                              className="rounded-md px-3 w-full py-2 shadow-md placeholder-gray-500  border text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                          )}
                        />
                      </div>
                    </div>

                  </div>


                  {/* notes  */}
                  <div className="pt-6 flex flex-col">
                    <label htmlFor="notes" className="text-sm font-medium">
                      Summary
                    </label>
                    <div className="mt-2 w-full">
                      <Controller
                        control={control}
                        name="summary"
                        render={({ field }) => (
                          <textarea
                            {...register('summary')}
                            rows="3"
                            type="text"
                            autoComplete="off"
                            className="rounded-md px-3 w-full py-2 shadow-md placeholder-gray-500  border text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          />
                        )}
                      />

                    </div>
                  </div>
                </div>

              )}




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
