import React, { useEffect, useState } from "react";
import {
  formatDate,
  formatShortDate,
  sortByListOrderAndDate,
} from "@/utils/helpers";

export default function TimelineEventsTable({ events }) {
  events;

  return (
    <div className="mt-5">
      <div className="max-h-[600px] overflow-auto">
        <table className="border w-full">
          <thead>
            <tr className="bg-slate-50 w-full">
              <th
                scope="col"
                className="py-3.5 px-3.5 pl-4 text-left text-md font-semibold text-gray-900"
              >
                Date
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 w-1/12 text-left text-md font-semibold text-gray-900"
              >
                Title
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-left text-md font-semibold text-gray-900 hidden sm:table-cell"
              >
                Category
              </th>
              <th
                scope="col"
                className="py-3.5 px3.5 pl-4 sm:w-1/4 pr-3 text-left text-md font-semibold text-gray-900"
              >
                Notes
              </th>
              <th
                scope="col"
                className="py-3.5 px3.5 pl-4 pr-3 sm:w-1/6 text-left text-md font-semibold text-gray-900"
              >
                Links
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {Array.isArray(events) &&
              events.map((event, index) => (
                <tr key={index}>
                  <td className="py-4 pl-3 pr-4 text-left text-xs font-medium sm:pr-0 text-gray-600 hidden sm:table-cell">
                    {formatDate(event.startDate)}
                  </td>

                  <td className="lg:pl-4 max-w-0 py-4 pl-1 text-sm font-medium text-blue-800 sm:w-auto sm:max-w-none sm:pl-0">
                    <div className="h-full self-center">{event.title}</div>
                  </td>

                  <td
                    className={`lg:pl-4 max-w-0 py-4 pl-1 text-sm text-gray-600 sm:w-auto sm:table-cell hidden sm:max-w-none sm:pl-0 capitalize`}
                  >
                    <>{event.category}</>
                  </td>

                  <td className="py-4 pl-3 pr-4 w-1/3 text-left text-xs font-medium sm:pr-0 text-gray-600 hidden sm:table-cell">
                    <div className="line-clamp-3 overflow-auto">
                      {event.notes}
                    </div>
                  </td>
                  <td className="py-4 pl-3 pr-4 text-left text-xs font-medium sm:pr-0 text-gray-600 sm:table-cell">
                    {event.links?.map((l) => (
                      <a
                        href={l.link}
                        target="_blank"
                        className="text-blue-800 cursor-pointer capitalize"
                      >
                        {l.category}: {l.title}
                      </a>
                    ))}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
