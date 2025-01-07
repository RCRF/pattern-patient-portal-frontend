import React from "react";
import { useForm } from "react-hook-form";

export default function EntryForm({ closeModal, createOrg }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const onSubmit = (data) => {
    createOrg(data);
    closeModal();
  };

  return (
    <div className="flex items-center self-center justify-center h-1/2">
      <div className="w-4/5 p-4">
        <form onSubmit={handleSubmit(onSubmit)}>
          <h2 className="text-center text-3xl font-extrabold text-gray-900 mb-10">
            Organization Details
          </h2>
          <div className="rounded-md shadow-sm -space-y-px p-6">
            <div>
              <label htmlFor="org-name" className="sr-only">
                Organization Name
              </label>
              <div>
                <input
                  {...register("name", {
                    required: "Organization name is required",
                  })}
                  id="org-name"
                  name="name"
                  type="text"
                  required
                  className="rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900  focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Organization Name"
                />

                {errors.name && (
                  <p className="text-red-500 text-xs italic">
                    {errors.name.message}
                  </p>
                )}
              </div>
            </div>
            <div className="pt-2">
              <label htmlFor="org-name" className="sr-only">
                Email
              </label>
              <div>
                <input
                  {...register("email", {
                    required: "email is required",
                  })}
                  id="email"
                  name="email"
                  type="text"
                  required
                  className="rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900  focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Email"
                />

                {errors.name && (
                  <p className="text-red-500 text-xs italic">
                    {errors.name.message}
                  </p>
                )}
              </div>
            </div>

            <div className="pt-2">
              <label htmlFor="address1" className="sr-only">
                Address
              </label>
              <input
                {...register("address1", {})}
                id="address1"
                name="address1"
                type="text"
                required
                className="rounded-md mt-4 relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900  focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Address 1"
              />
              <input
                {...register("address2")}
                id="address2"
                name="address2"
                type="text"
                className="rounded-md mt-2 relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900  focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Address 2"
              />
            </div>
            <div></div>

            <div className="w-full grid grid-cols-3 gap-2 pt-2 pb-2">
              <div>
                <label htmlFor="city" className="sr-only">
                  City
                </label>
                <input
                  {...register("city", { required: "City is required" })}
                  id="city"
                  name="city"
                  type="text"
                  required
                  className="rounded-md mt-4 relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900  focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="City"
                />
                {errors.city && (
                  <p className="text-red-500 text-xs italic">
                    {errors.city.message}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="state" className="sr-only">
                  State
                </label>
                <input
                  {...register("state", { required: "State is required" })}
                  id="state"
                  name="state"
                  type="text"
                  required
                  className="rounded-md mt-4 relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900  focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="State"
                />
                {errors.state && (
                  <p className="text-red-500 text-xs italic">
                    {errors.state.message}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="postalCode" className="sr-only">
                  Zipcode
                </label>
                <input
                  {...register("postalCode", {
                    required: "Zipcode is required",
                  })}
                  id="postalCode"
                  name="postalCode"
                  type="text"
                  required
                  className="rounded-md mt-4 relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900  focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Zipcode"
                />
                {errors.postalCode && (
                  <p className="text-red-500 text-xs italic">
                    {errors.postalCode.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="country" className="sr-only">
                Country
              </label>
              <input
                {...register("country", {
                  required: "Country is required",
                })}
                id="country"
                name="country"
                type="text"
                required
                className="rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900  focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Country"
              />
              {errors.country && (
                <p className="text-red-500 text-xs italic">
                  {errors.country.message}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="summary" className="sr-only">
                Summary
              </label>
              <textarea
                {...register("summary", {
                  required: "Summary is required",
                })}
                id="summary"
                name="summary"
                type="text"
                required
                className="rounded-md mt-6 relative h-40 block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900  focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Summary"
              />
              {errors.summary && (
                <p className="text-red-500 text-xs italic">
                  {errors.summary.message}
                </p>
              )}
            </div>
          </div>
          <div>
            <button
              type="submit"
              className="mt-4 group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
