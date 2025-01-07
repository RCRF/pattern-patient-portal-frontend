import { formatShortDate } from "@/utils/helpers";
import { filter } from "lodash";
import React, { Fragment, useState, useEffect } from "react";

export default function ResultsTable({ labResults, displaySearch = true }) {
  let lastDate = null;
  let isWhite = true;
  const [filterBy, setFilterBy] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredResults, setFilteredResults] = useState(labResults);


  useEffect(() => {
    let results = labResults;

    if (filterBy === "dateDec") {
      results = results.sort(
        (a, b) => new Date(a.startDate) - new Date(b.startDate)
      );
    } else if (filterBy === "dateAsc") {
      results = results.sort(
        (a, b) => new Date(b.startDate) - new Date(a.startDate)
      );
    } else if (filterBy === "category") {
      results = results.sort((a, b) => a.panel.localeCompare(b.panel));
    } else if (filterBy === "institution") {
      results = results.sort((a, b) =>
        a?.institution?.institutionName?.localeCompare(
          b?.institution?.institutionName
        )
      );
    }

    if (searchTerm) {
      results = results.filter(
        (result) =>
          result.itemsTested.toLowerCase().includes(searchTerm.toLowerCase()) ||
            result.panel.toLowerCase().includes(searchTerm.toLowerCase()) ||
            result.institution?.institutionName ?
            .toLowerCase()
              .includes(searchTerm.toLowerCase())
      );
    }

    setFilteredResults(results);
  }, [labResults, filterBy, searchTerm]);

  const filterOptions = [
    { value: "dateAsc", label: "Date Ascending" },
    { value: "dateDec", label: "Date Decending" },
    { value: "category", label: "Category" },
    { value: "institution", label: "Institution" },
  ];

  return (
    <div className="w-full mt-2 overflow-auto flex flex-col">
      {displaySearch && (
        <div className="flex gap-4 mb-6 w-full justify-end opacity-80 overflow-auto pl-10 sm:pl-0 pr-10 sm:pr-0">
          <div>
            <label
              htmlFor="filter"
              className="block text-sm text-gray-500"
            >
              Filter by
            </label>
            <select
              id="filter"
              className="mt-1 block w-full pl-3 pr-10 py-2 font-normal border-gray-300 bg-slate-300 text-slate-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
            >
              {filterOptions.map((option) => (
                <option value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="search"
              className="block text-sm font-medium text-gray-700 "
            >
              Search
            </label>
            <input

              type="text"
              autoComplete="off"
              id="search"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none bg-slate-300 text-slate-600 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      )}


      <div className="max-h-[500px] border rounded-sm overflow-auto">
        <table className="min-w-full">
          <thead className="sticky top-0 bg-gray-50">
            <tr className="w-full">
              <th
                scope="col"
                className="py-3.5 px3.5 pl-4 pr-3 text-left text-md font-semibold text-gray-900"
              >
                Date
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-left text-md font-semibold text-gray-900 hidden sm:table-cell"
              >
                Institution
              </th>

              <th
                scope="col"
                className="py-3.5 px3.5 pl-3 pr-3 text-left text-md font-semibold text-gray-900 hidden sm:table-cell"
              >
                Category
              </th>
              <th
                scope="col"
                className="py-3.5 px3.5 pl-4 pr-3 text-left text-md font-semibold text-gray-900"
              >
                Item
              </th>
              <th
                scope="col"
                className="py-3.5 px3.5 pl-4 pr-3 text-left text-md font-semibold text-gray-900"
              >
                Value
              </th>
              <th
                scope="col"
                className="py-3.5 px3.5 pl-4 pr-3 sm:w-1/6 text-left text-md font-semibold text-gray-900 hidden sm:table-cell"

              >
                Imaging
              </th>
              <th
                scope="col"
                className="py-3.5 px3.5 pl-4 pr-3 text-left text-md font-semibold text-gray-900 hidden sm:table-cell"
              >
                Interventions
              </th>
              <th
                scope="col"
                className="py-3.5 px3.5 pl-4 sm:w-1/4 pr-3 text-left text-md font-semibold text-gray-900"
              >
                Notes
              </th>

            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {Array.isArray(labResults) &&
              filteredResults.map((labResult, index) => {
                if (labResult.startDate !== lastDate) {
                  lastDate = labResult.startDate;
                  isWhite = !isWhite;
                }
                return (
                  <tr key={index}>
                    <td className="w-full lg:pl-4 lg:w-1/12 max-w-0 py-4 pl-2 text-xs text-sm font-medium text-gray-900 sm:w-auto sm:pl-1 md:pl-1">
                      {formatShortDate(labResult.startDate)
                      }
                    </td>

                    <td className="py-4 pl-3 pr-4 lg:w-1/4 text-left text-xs font-medium sm:pr-0 text-gray-600 hidden sm:table-cell">
                      {labResult?.institution?.institutionName}
                    </td>
                    <td className="py-4 pl-3 pr-4 sm:w-1/12 text-left text-xs font-medium sm:pr-0 text-gray-600 hidden sm:table-cell">
                      {labResult.panel}
                    </td>
                    <td className="py-4 pl-3 pr-4 sm:w-1/6 text-left text-xs font-medium sm:pr-0 text-gray-600 ">
                      <div> {labResult.itemsTested}</div>
                    </td>

                    <td className="py-4 pl-3 pr-4 sm:w-1/6 text-left text-xs font-medium sm:pr-0 text-gray-600">
                      <div>
                        <p
                          className={`${Number(labResult?.value) >=
                            Number(labResult?.referenceRangeHigh)
                            ? "text-red-500"
                            : Number(labResult?.value) <=
                              Number(labResult?.referenceRangeLow)
                              ? "text-blue-600"
                              : "text-gray-500"
                            }`}
                        >
                          {labResult.value} {labResult.units}
                        </p>
                        <p className="text-xxs text-gray-400">
                          Range: {labResult.referenceRangeLow} -{" "}
                          {labResult.referenceRangeHigh}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 pl-3 pr-4 sm:w-1/5 text-left text-xs font-medium sm:pr-0 text-gray-600 hidden sm:table-cell">
                      <div>
                        {labResult?.imaging?.map((image) => (
                          <a
                            href={`/imaging/${image.id}`}
                            target="_blank"
                            className="text-blue-600 hover:text-blue-900 capitalize cursor-pointer"
                          >
                            <div className="flex flex-row">
                              <div></div>{" "}
                              <div
                                className={`${image.status === "ned" ? "uppercase" : ""
                                  } line-clamp-1 overflow-auto`}
                              >
                                (
                                {new Date(image.date).toLocaleDateString(
                                  "en-US",
                                  {
                                    month: "numeric",
                                    day: "numeric",
                                    year: "2-digit",
                                  }
                                )}
                                ) {image?.title?.slice(0, 9)}: {image.status}
                              </div>
                            </div>
                          </a>
                        ))}
                      </div>
                    </td>

                    <td className="py-4 pl-3 pr-4 sm:w-1/3 text-left text-xs font-medium sm:pr-0 text-gray-600 hidden sm:table-cell">
                      <div>
                        {labResult?.interventions?.map((intervention) => (
                          <a
                            href={`/interventions/${intervention.id}`}
                            target="_blank"
                            className="text-blue-600 hover:text-blue-900 capitalize cursor-pointer"
                          >
                            <div>{intervention.title}</div>
                          </a>
                        ))}
                      </div>
                    </td>

                    <td className="py-4 pl-3 pr-4 text-left text-xs font-medium sm:pr-0 text-gray-600 overflow-auto flex w-40">
                      <div className="overflow-auto line-clamp-3"> {labResult?.notes}</div>
                    </td>



                    {/* <td className="hidden py-3.5 px-3.5 pl-3 pr-3 text-md font-semibold sm:pr-0 lg:table-cell">
                      <div className="flex flex-row w-3/4 pl-4">
                        {labResult?.category?.split(",").map((category) => (
                          <div
                            className={`h-3 w-3 m-1 rounded ${
                              colorMap[category] || "bg-blue-900"
                            }`}
                            key={category}
                          ></div>
                        ))}
                      </div>
                    </td> */}
                    {/* <td className="hidden py-3.5 px-3.5 pl-3 pr-3 text-left text-md font-semibold sm:pr-0 lg:table-cell">
                      <a
                        target="_blank"
                        href={labResult.credit}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View
                      </a> */}

                    {/* <td className="text-left h-full  hidden sm:table-cell text-xs font-medium  items-center justify-center sm:pr-0 text-gray-600">
                    {labResult.type === "case" ||
                    labResult.type === "review" ||
                    labResult.type === "retro" ? (
                      <div
                        className={`${getTagColor(labResult.type)}`}
                        key={labResult.type}
                      >
                        {tagsLookup[labResult.type]}
                      </div>
                    ) : null}
                  </td> */}
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
