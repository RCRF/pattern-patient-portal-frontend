import { isEmpty, set } from "lodash";
import { type } from "os";
import React, { Fragment, useState } from "react";
import Modal from "../Modal";
import { Switch } from "@headlessui/react";
import { formatDate } from "@/utils/helpers";

export default function InterventionsTable({
  interventions,
  modal,
  isAdmin,
  isEditing,
}) {
  return (
    <div className="z-10 bg-white w-full">
      <div className="max-h-[400px] overflow-auto">
        <table className="border w-full">
          <thead className="bg-slate-100 w-full">
            <tr>
              <th
                scope="col"
                className="py-3.5 px-3.5 w-1/4 pl-4 pr-3 text-left text-md font-semibold text-gray-900"
              >
                Procedure
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-left text-md font-semibold text-gray-900 hidden sm:table-cell"
              >
                Date
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-left text-md font-semibold text-gray-900 hidden sm:table-cell"
              >
                Category
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-left text-md font-semibold text-gray-900 hidden sm:table-cell"
              >
                Organ(s)
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-left w-1/4 text-md line-clamp-1 overflow-hidden whitespace-nowrap truncate font-semibold text-gray-900 hidden sm:table-cell"
              >
                Notes
              </th>
              <th
                scope="col"
                className="w-1/8 pr-6 line-clamp-1 overflow-hidden whitespace-nowrap truncate text-center text-md font-semibold text-gray-900 hidden sm:table-cell"
              >
                Report
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200 bg-white">
            {Array.isArray(interventions) &&
              interventions.map((intervention, index) => (
                <tr key={index}>
                  <td className="lg:pl-4 max-w-0 py-4 pl-1 text-sm font-medium  text-blue-800 sm:w-auto sm:max-w-none sm:pl-0">
                    <a
                      href={`/interventions/${intervention.id}`}
                      target="_blank"
                    >
                      {intervention.title}
                    </a>
                  </td>
                  <td className="py-4 pl-3 pr-4 text-left text-xs font-medium sm:pr-0 text-gray-600 hidden sm:table-cell">
                    {formatDate(intervention.startDate)}
                  </td>

                  <td className="py-4 pl-3 pr-4 text-left text-xs capitalize font-medium sm:pr-0 text-gray-600 hidden sm:table-cell">
                    {intervention.category}
                  </td>
                  <td className="py-4 pl-3 pr-4  text-left text-xs font-medium sm:pr-0 text-gray-600 hidden sm:table-cell line-clamp-1">
                    {intervention?.organs?.length > 0 ? intervention.organs.split(",").map((organ, index) => (
                      <span className="capitalize" key={index}>
                        {index !== intervention?.organs.split(",").length - 1
                          ? organ + ", "
                          : organ}
                      </span>
                    )) : null}
                  </td>
                  <td className="py-4 pl-3 pr-4 w-1/2 text-left text-xs text-md line-clamp-3 font-medium sm:pr-0 text-gray-600 hidden sm:table-cell">
                    <p className="line-clamp-3 overflow-auto">
                      {intervention.notes}
                    </p>
                  </td>

                  <td className="text-blue-500 break-all text-md text-center text-xs font-medium sm:pr-0 underline hidden sm:table-cell">
                    <a href={intervention.report} target="_blank">
                      View
                    </a>
                  </td>

                  <td className="hidden py-4 pl-3 pr-4 text-left text-sm font-medium sm:pr-0 md:hidden sm:table-cell">
                    {!isEmpty(intervention.abstract) ? (
                      <button
                        className="text-blue-600 hover:text-blue-900"
                        onClick={() => openModal(intervention)}
                      >
                        Preview
                      </button>
                    ) : (
                      <a
                        target="_blank"
                        href={`interventions/${intervention.report}/`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View
                      </a>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
