import { isEmpty, set } from "lodash";
import { type } from "os";
import React, { Fragment, useState, useRef, useEffect } from "react";
import Modal from "../Modal";
import { Switch } from "@headlessui/react";
import { formatDate } from "@/utils/helpers";

export default function MedicationsTable({
  medications,
  medicationRelations,
  isEditing = false,
}) {
  const [stateMedications, setStateMedications] = useState(medications);
  const scrollableTableRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (scrollableTableRef.current) {
        scrollableTableRef.current.scrollLeft = 0;
      }
    }, 10);

    return () => clearTimeout(timer); // Clean up the timer when the component unmounts or updates
  }, []);

  const toggleSwitch = (id) => {
    const updatedMedications = stateMedications.map((medication) => {
      if (medication.id === id) {
        return {
          ...medication,
          status: medication.status === "active" ? "discontinued" : "active",
        };
      }
      return medication;
    });

    setStateMedications(updatedMedications);
  };

  const prescribedForLookup = {
    primary: "Primary",
    side_effect: "Side Effect",
  };

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
                Medication
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-left font-semibold text-gray-900 hidden sm:table-cell text-base"
              >
                Dosage
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
                className="px-3 py-3.5 text-left font-semibold text-gray-900 hidden sm:table-cell text-base"
              >
                Diagnosis
              </th>

              <th
                scope="col"
                className="px-3 py-3.5 text-left font-semibold text-gray-900 hidden sm:table-cell text-base"
              >
                Prescriber
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-left w-1/5 font-semibold text-gray-900 hidden sm:table-cell text-base"
              >
                Reason
              </th>

              <th
                scope="col"
                className="px-3 py-3.5 font-semibold text-gray-900 hidden sm:table-cell text-base whitespace-nowrap"
              >
                Side Effects
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
            {Array.isArray(stateMedications) &&
              stateMedications.map((medication, index) => (
                <tr key={index} className="pr-8">
                  <td className="lg:pl-4 max-w-0 py-4 pl-1 text-sm font-medium text-gray-900 sm:w-auto sm:max-w-none sm:pl-0">
                    <div>
                      <a
                        className="text-blue-80 capitalize"
                        href={`/medications/${medication.id}`}
                      >
                        {medication.title}
                      </a>
                      {medicationRelations && (
                        <div className="text-xs text-slate-400">
                          {
                            prescribedForLookup[
                            medicationRelations.filter(
                              (relation) =>
                                relation.medicationId === medication.id
                            )[0]?.prescribedFor
                            ]
                          }
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-4 pl-3 pr-4 text-center text-sm font-medium sm:pr-0 text-gray-600 hidden sm:table-cell">
                    {medication.dosage} {medication.units}
                    <div className="flex flex-row justify-center">
                      <span className="text-xs text-center">{medication.frequency ? ` ${medication.frequency}x` : ""}</span>
                      <span className="text-xs text-center">{medication.interval ? "/" + medication.interval : ""}</span>
                    </div>
                  </td>

                  <td className="py-4 pl-3 text-left text-sm font-medium pr-4">
                    {isEditing ? (
                      <Switch
                        checked={medication.status === "active"}
                        onChange={() => toggleSwitch(medication.id)}
                        className={
                          `relative inline-flex flex-shrink-0 h-5 w-10 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75` +
                          (medication.status === "active"
                            ? ` bg-green-400`
                            : ` bg-gray-500`)
                        }
                      ></Switch>
                    ) : (
                      <div className="text-xs text-gray-600 capitalize">
                        {medication.status}
                      </div>
                    )}
                    { }
                  </td>

                  <td className="py-4 pl-3 pr-4 text-left text-xs font-medium sm:pr-0 text-gray-600 hidden sm:table-cell">
                    {formatDate(medication.startDate)}
                  </td>
                  <td className="py-4 pl-3 pr-4 text-left text-xs font-medium sm:pr-0 text-gray-600 hidden sm:table-cell">
                    {medication.endDate
                      ? formatDate(medication.endDate)
                      : "N/A"}
                  </td>

                  <td className="py-4 pl-3 pr-4 text-left text-xs font-medium sm:pr-0 text-gray-600 hidden sm:table-cell">
                    {medication?.diagnosis?.length > 0
                      ? medication.diagnosis[0]?.title
                      : ""}
                  </td>

                  <td className="py-4 pl-3 pr-4 text-center text-xs font-medium sm:pr-0 text-gray-600 hidden sm:table-cell">
                    {medication?.prescribingProvider?.length > 0
                      ? medication.prescribingProvider[0]?.firstName
                      : ""}{" "}
                    {medication.prescribingProvider?.length > 0
                      ? medication.prescribingProvider[0]?.lastName
                      : ""}
                  </td>

                  <td className="py-4 pl-3 pr-4 text-left text-xs font-medium sm:pr-0 text-gray-600 hidden sm:table-cell">
                    <div className="line-clamp-2">{medication?.reason}</div>
                  </td>

                  <td className="py-4 pl-3 pr-4 w-1/4 text-left text-xs font-medium sm:pr-0 text-gray-600 hidden sm:table-cell line-clamp-1">
                    {medication?.sideEffects
                      ?.slice(0, 3)
                      .map((sideEffect, index) => (
                        <span className="capitalize" key={index}>
                          {sideEffect.title}
                          {index !== medication.sideEffects.length - 1
                            ? index === 2
                              ? "..."
                              : ", "
                            : ""}
                        </span>
                      ))}
                  </td>
                  <td className="py-4 pl-3 pr-4 w-1/4 text-left text-xs font-medium sm:pr-0 text-gray-600 hidden sm:table-cell">
                    <div className="line-clamp-3 overflow-auto">
                      {medication?.notes}
                    </div>
                  </td>

                  <td className="hidden py-4 pl-3 pr-4 text-left text-sm font-medium sm:pr-0 md:hidden sm:table-cell">
                    {!isEmpty(medication.abstract) ? (
                      <button
                        className="text-blue-600 hover:text-blue-900"
                        onClick={() => openModal(medication)}
                      >
                        Preview
                      </button>
                    ) : (
                      <a
                        target="_blank"
                        href={`https://pubmed.ncbi.nlm.nih.gov/${medication.PMID}/`}
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
