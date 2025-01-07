import { isEmpty, set } from "lodash";
import { type } from "os";
import React, { Fragment, useState, useRef } from "react";
import Modal from "../Modal";
import { formatDate } from "@/utils/helpers";

export default function ProvidersTable({
  providers,
  modal,
  isAdmin,
  isEditing,
}) {
  const scrollableTableRef = useRef(null);
  return (
    <div className="pl-4">
      <div className="overflow-x-auto" ref={scrollableTableRef}>
        <table className="border w-[130%]">
          <thead className="bg-slate-100 w-full">
            <tr>
              <th
                scope="col"
                className="py-3.5 px-3.5 w-1/5 pl-4 pr-3 text-left text-md font-semibold text-gray-900"
              >
                Title
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-left text-md line-clamp-1 overflow-hidden whitespace-nowrap truncate font-semibold text-gray-900 hidden sm:table-cell"
              >
                Status
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 w-1/5 text-left text-md line-clamp-1 overflow-hidden whitespace-nowrap truncate font-semibold text-gray-900 hidden sm:table-cell"
              >
                Role
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-left  text-md line-clamp-1 overflow-hidden whitespace-nowrap truncate font-semibold text-gray-900 hidden sm:table-cell"
              >
                Start Date
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-left  text-md line-clamp-1 overflow-hidden whitespace-nowrap truncate font-semibold text-gray-900 hidden sm:table-cell"
              >
                End Date
              </th>

              <th
                scope="col"
                className="px-3 py-3.5 text-left text-md font-semibold text-gray-900 hidden sm:table-cell"
              >
                Institution
              </th>

              <th
                scope="col"
                className="px-3 py-3.5 text-left w-1/6 text-md line-clamp-1 overflow-hidden font-semibold text-gray-900 hidden sm:table-cell"
              >
                Manages
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-left w-1/2 text-md line-clamp-1 overflow-hidden whitespace-nowrap truncate font-semibold text-gray-900 hidden sm:table-cell"
              >
                Notes
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200 bg-white overflow-auto">
            {Array.isArray(providers) &&
              providers.map((provider, index) => (
                <tr key={index}>
                  <td className="lg:pl-4 max-w-0 py-4 pl-1 text-sm font-medium  text-gray-900 sm:w-auto sm:max-w-none sm:pl-0">
                    <a
                      target="_blank"
                      href={`/providers/${provider?.providerId}`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      {provider.firstName +
                        " " +
                        provider.lastName +
                        ", " +
                        provider.designation}
                    </a>
                  </td>

                  <td
                    className={`py-4 pl-3 pr-4 text-left text-xs capitalize ${
                      provider.status === "active"
                        ? "text-green-500 font-bold"
                        : "text-gray-600 font-medium"
                    } sm:pr-0  hidden sm:table-cell`}
                  >
                    {provider.status}
                  </td>
                  <td className="py-4 pl-3 pr-4 text-left text-xs capitalize font-medium sm:pr-0 text-gray-600 hidden sm:table-cell">
                    {provider.role}
                  </td>
                  <td className="py-4 pl-3 pr-4 text-left text-xs capitalize font-medium sm:pr-0 text-gray-600 hidden sm:table-cell">
                    {formatDate(provider.startDate)}
                  </td>
                  <td className="py-4 pl-3 pr-4 text-left text-xs capitalize font-medium sm:pr-0 text-gray-600 hidden sm:table-cell">
                    {formatDate(provider.endDate)}
                  </td>

                  <td className="py-4 pl-3 pr-4 w-1/5 text-left text-xs font-medium sm:pr-0 text-gray-600 hidden sm:table-cell line-clamp-1">
                    {provider?.institutions?.length > 0
                      ? provider?.institutions[0]?.title
                      : null}
                  </td>

                  <td className="py-4 pl-3 pr-4 text-left text-xs text-md line-clamp-3 font-medium sm:pr-0 text-gray-600 hidden sm:table-cell">
                    <div>
                      {provider?.diagnoses?.map((disease, index) => (
                        <a
                          className="line-clamp-3 text-blue-800 text-left rounded-sm w-full items-center  text-xxs font-medium"
                          href={`/diagnoses/${disease.id}`}
                          key={index}
                        >
                          <div className="w-full line-clamp-1">
                            {disease.title}
                          </div>
                        </a>
                      ))}
                    </div>
                  </td>

                  <td className="py-4 pl-3 pr-4 text-left text-xs text-md  line-clamp-3 font-medium sm:pr-0 text-gray-600 hidden sm:table-cell">
                    <p className="line-clamp-3 overflow-scroll">
                      {provider.notes}
                    </p>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
