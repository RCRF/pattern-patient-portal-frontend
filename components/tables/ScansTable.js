import { isEmpty, set } from "lodash";
import { type } from "os";
import React, { Fragment, useState } from "react";
import Modal from "../Modal";
import { Switch } from "@headlessui/react";
import { formatDate } from "@/utils/helpers";

export default function ScansTable({ scans, modal, isAdmin, isEditing }) {
  return (
    <div className="z-10 bg-white w-full">
      <div className="max-h-[400px] overflow-auto">
        <table className="border w-full">
          <thead className="w-full bg-slate-100">
            <tr>
              <th
                scope="col"
                className="py-3.5 px-3.5 md:w-1/5 w-1/2 pl-4 pr-3 text-left text-md font-semibold text-gray-900"
              >
                Title
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-left text-md font-semibold text-gray-900"
              >
                Dates
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-left text-md font-semibold text-gray-900 hidden sm:table-cell"
              >
                Status
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-left text-md font-semibold text-gray-900 hidden sm:table-cell"
              >
                Institution
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-left w-1/4 text-md line-clamp-1 overflow-hidden whitespace-nowrap truncate font-semibold text-gray-900 hidden sm:table-cell"
              >
                Impression
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
            {Array.isArray(scans) &&
              scans.map((scan, index) => (
                <tr key={index}>
                  <td className="lg:pl-4 max-w-0 py-4 pl-1 text-sm font-medium text-blue-800 sm:w-auto sm:max-w-none sm:pl-0">
                    <a href={`/imaging/${scan.id}`} target="_blank">
                      {scan.title}
                    </a>
                  </td>
                  <td className="py-4 pl-3 pr-4 text-left text-xs font-medium sm:pr-0 text-gray-600 ">
                    {formatDate(scan.startDate)}
                  </td>

                  <td className="py-4 pl-3 pr-4 text-left text-xs capitalize font-medium sm:pr-0 text-gray-600 hidden sm:table-cell">
                    {scan.status}
                  </td>
                  <td className="py-4 pl-3 pr-4 w-1/5 text-left text-xs font-medium sm:pr-0 text-gray-600 hidden sm:table-cell line-clamp-1 cursor-pointer">
                    {scan?.institution && scan?.institution.length > 0 ? (
                      <a
                        className="text-blue-800 text-xs cursor-pointer"
                        href={`/institutions/${scan.institution[0].id}`}
                        target="_blank"
                      >
                        {scan?.institution[0]?.title}
                      </a>
                    ) : null}
                    {/* {scans.organ.map((organ, index) => (
                      <span className="capitalize" key={index}>
                        {organ}
                        {index !== scans.organ.length - 1 ? ", " : ""}
                      </span>
                    ))} */}
                  </td>
                  <td className="py-4 pl-3 pr-4 w-1/3 text-left text-xs text-md line-clamp-3 font-medium sm:pr-0 text-gray-600 hidden sm:table-cell">
                    <p className="line-clamp-3 overflow-auto">
                      {scan.impression}
                    </p>
                  </td>

                  <td className="py-4 pl-3 pr-4 w-1/2 text-left text-xs text-md  line-clamp-3 font-medium sm:pr-0 text-gray-600 hidden sm:table-cell">
                    <p className="line-clamp-3 overflow-scroll">{scan.notes}</p>
                  </td>

                  <td className="text-blue-500 break-all text-md text-center text-xs font-medium sm:pr-0 underline hidden sm:table-cell">
                    <a href={scan?.report} target="_blank">
                      View
                    </a>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
