import { isEmpty, set } from "lodash";
import { type } from "os";
import React, { Fragment, useState, useRef, useEffect } from "react";
import Modal from "../Modal";
import { Switch } from "@headlessui/react";
import { formatDate } from "@/utils/helpers";

export default function DiagnosesTable({
  diagnoses,
}) {

  const scrollableTableRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (scrollableTableRef.current) {
        scrollableTableRef.current.scrollLeft = 0;
      }
    }, 10);

    return () => clearTimeout(timer); // Clean up the timer when the component unmounts or updates
  }, []);


  return (
    <div>
      <div className="overflow-x-auto max-h-[400px]" ref={scrollableTableRef}>
        <table className="border w-[120%] overflow-auto">
          <thead className="bg-slate-100  overflow-auto">
            <tr>
              <th
                scope="col"
                className="py-3.5 px-3.5 pl-4 pr-3 w-60 text-left font-semibold text-gray-900 text-base"
              >
                Diagnoses
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-left font-semibold text-gray-900 hidden sm:table-cell text-base"
              >
                Category
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-left font-semibold text-gray-900  text-base"
              >
                Status
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-left font-semibold text-gray-900 hidden sm:table-cell text-base whitespace-nowrap"
              >
                Start Date
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-left font-semibold text-gray-900 hidden sm:table-cell text-base whitespace-nowrap"
              >
                End Date
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-left font-semibold text-gray-900 hidden sm:table-cell text-base whitespace-nowrap"
              >
                Type
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-left font-semibold text-gray-900 hidden sm:table-cell text-base whitespace-nowrap"
              >
                Disease Status
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-left font-semibold text-gray-900 hidden sm:table-cell text-base"
              >
                Organs
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-left font-semibold text-gray-900 hidden sm:table-cell text-base"
              >
                Notes
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white overflow-x-auto ">
            {Array.isArray(diagnoses) &&
              diagnoses.map((diagnosis, index) => (
                <tr key={index} className="pr-8">
                  <td className="lg:pl-4 py-4 pl-1 text-sm font-medium text-gray-900 sm:w-auto sm:max-w-none sm:pl-0">
                    <div>
                      <a
                        className="text-blue-80 capitalize"
                        href={`/diagnoses/${diagnosis.id}`}
                      >
                        {diagnosis.title}
                      </a>
                    </div>
                  </td>
                  <td className="py-4 pl-3 pr-4 text-center text-sm font-medium sm:pr-0 text-gray-600 hidden sm:table-cell capitalize">
                    {diagnosis.category}
                  </td>


                  <td className="py-4 pl-3 text-left text-sm font-medium pr-4">
                    <div className="text-xs text-gray-600 capitalize">
                      {diagnosis.status ? diagnosis.status.split("_").join(" ") : ''}
                    </div>
                    { }
                  </td>

                  <td className="py-4 pl-3 pr-4 text-left text-xs font-medium sm:pr-0 text-gray-600 hidden sm:table-cell">
                    {formatDate(diagnosis.startDate)}
                  </td>
                  <td className="py-4 pl-3 pr-4 text-left text-xs font-medium sm:pr-0 text-gray-600 hidden sm:table-cell">
                    {diagnosis.endDate
                      ? formatDate(diagnosis.endDate)
                      : "N/A"}
                  </td>

                  <td className="py-4 pl-3 pr-4 text-left text-xs font-medium sm:pr-0 text-gray-600 hidden sm:table-cell capitalize">
                    {diagnosis.type}
                  </td>

                  <td className="py-4 pl-3 pr-4 text-center text-xs font-medium sm:pr-0 text-gray-600 hidden sm:table-cell capitalize">
                    {diagnosis.diseaseStatus}
                  </td>

                  <td className="py-4 pl-3 pr-4 text-left text-xs font-medium sm:pr-0 text-gray-600 hidden sm:table-cell">
                    {diagnosis?.metadata.organs.map((organ, index) => (
                      <span className="capitalize" key={index}>
                        {organ}
                        {index !== diagnosis.metadata.organs.length - 1
                          ? ", "
                          : ""}
                      </span>
                    ))}
                  </td>
                  <td className="py-4 pl-3 pr-4 w-1/4 text-left text-xs font-medium sm:pr-0 text-gray-600 hidden sm:table-cell">
                    <div className="line-clamp-3 overflow-auto">
                      {diagnosis?.notes}
                    </div>
                  </td>

                  <td className="hidden py-4 pl-3 pr-4 text-left text-sm font-medium sm:pr-0 md:hidden sm:table-cell">
                    {!isEmpty(diagnosis.abstract) ? (
                      <button
                        className="text-blue-600 hover:text-blue-900"
                        onClick={() => openModal(diagnosis)}
                      >
                        Preview
                      </button>
                    ) : (
                      <a
                        target="_blank"
                        href={`https://pubmed.ncbi.nlm.nih.gov/${diagnosis.PMID}/`}
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
