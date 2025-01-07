import React, { useState, useEffect } from "react";
import {
  filterItemsToDuringPlusIntervalBeforeAndAfter,
  formatDate,
} from "@/utils/helpers";
import Relations from "./Relations";
import { ArrowDownTrayIcon, ArrowUpRightIcon } from "@heroicons/react/20/solid";
import Link from "next/link";
import { useAttachmentsByImaging } from "@/hooks/api";

const ImagingDetails = ({
  selectedItem,
  version,
  appointments,
  interventions,
  medications,
  imaging,
  labs,
}) => {
  const [filteredScans, setFilteredScans] = useState([]);
  const [filteredMedications, setFilteredMedications] = useState([]);
  const [filteredInterventions, setFilteredIntervenions] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [filteredLabs, setFilteredLabs] = useState([]);

  const { data: attachments } = useAttachmentsByImaging(
    { id: selectedItem?.id },
    {
      enabled: !!selectedItem?.id,
    }
  );

  useEffect(() => {
    if (imaging && selectedItem) {
      const filteredScans = imaging?.filter((scan) => {
        const scanDate = new Date(scan.startDate);
        const selectedItemStartDate = new Date(selectedItem.startDate);
        const selectedItemEndDate = new Date(selectedItem.endDate);

        const ninetyDaysBeforeItemStartDate = new Date(selectedItemStartDate);
        ninetyDaysBeforeItemStartDate.setDate(
          selectedItemStartDate.getDate() - 90
        );

        const ninetyDaysAfterItemEnds = new Date(selectedItemEndDate);
        ninetyDaysAfterItemEnds.setDate(selectedItemEndDate.getDate() + 90);

        return (
          scanDate >= ninetyDaysBeforeItemStartDate &&
          scanDate <= ninetyDaysAfterItemEnds &&
          scan.id !== selectedItem.id
        );
      });

      setFilteredScans(filteredScans);
    }
  }, [imaging, selectedItem]);

  useEffect(() => {
    if (labs) {
      const filterLabs = filterItemsToDuringPlusIntervalBeforeAndAfter(
        labs,
        selectedItem,
        7,
        10
      );

      setFilteredLabs(filterLabs);
    }
  }, [labs]);

  useEffect(() => {
    if (imaging && selectedItem) {
      const filteredMedications = medications?.filter((scan) => {
        const scanDate = new Date(scan.startDate);
        const selectedItemStartDate = new Date(selectedItem.startDate);
        const selectedItemEndDate = new Date(selectedItem.endDate);

        const thirtyDaysBeforeItemStartDate = new Date(selectedItemStartDate);
        thirtyDaysBeforeItemStartDate.setDate(
          selectedItemStartDate.getDate() - 30
        );

        const fourteenDaysAfterMedicationEnds = new Date(selectedItemEndDate);
        fourteenDaysAfterMedicationEnds.setDate(
          selectedItemEndDate.getDate() + 14
        );

        return (
          scanDate >= thirtyDaysBeforeItemStartDate &&
          scanDate <= fourteenDaysAfterMedicationEnds
        );
      });

      setFilteredMedications(filteredMedications);
    }
  }, [medications, selectedItem]);

  useEffect(() => {
    if (interventions && selectedItem) {
      const filteredInterventions = interventions?.filter((scan) => {
        const scanDate = new Date(scan.startDate);
        const interventionStartDate = new Date(selectedItem.startDate);
        const interventionEndDate = new Date(selectedItem.endDate);

        const oneWeekBeforeInterventionStarts = new Date(interventionStartDate);
        oneWeekBeforeInterventionStarts.setDate(
          interventionStartDate.getDate() - 7
        );

        const fourteenDaysAfterMedicationEnds = new Date(interventionEndDate);
        fourteenDaysAfterMedicationEnds.setDate(
          interventionEndDate.getDate() + 14
        );

        return (
          scanDate >= oneWeekBeforeInterventionStarts &&
          scanDate <= fourteenDaysAfterMedicationEnds &&
          scan.id !== selectedItem.id
        );
      });

      setFilteredIntervenions(filteredInterventions);
    }
  }, [interventions, selectedItem]);

  useEffect(() => {
    if (appointments && selectedItem) {
      const appointmentList = filterItemsToDuringPlusIntervalBeforeAndAfter(
        appointments,
        selectedItem,
        30,
        40
      ).sort((a, b) => {
        const startDate = new Date(a.startDate);
        const endDate = new Date(b.startDate);
        return endDate - startDate;
      });
      setFilteredAppointments(appointmentList);
    }
  }, [appointments, selectedItem]);

  const colorLookup = {
    stable: "bg-blue-400",
    decrease: "bg-green-400",
    increase: "bg-red-400",
  };

  return (
    <div className="pl-3 pr-3 bg-white pb-10 pt-5">
      <div
        className={`${version === "full" ? "" : "bg-slate-200"} p-2 pl-4 pr-4 `}
      >
        <div className="flex md:flex-row flex-col justify-between">
          <div className="flex md:flex-row flex-col">
            {version === "full" ? (
              <h2 className="font-bold text-2xl">{selectedItem?.title}</h2>
            ) : (
              <a href={`/imaging/${selectedItem?.id}`} target="_blank">
                <h2 className="font-bold text-2xl ">{selectedItem?.title}</h2>
              </a>
            )}

            {selectedItem?.status && (
              <div className="md:ml-10 mb-5">
                <p
                  className={`${colorLookup[selectedItem?.status]
                    } bg-blue-500 pl-2 pr-2 p-1 h-8 rounded text-white line-clamp-1 ${selectedItem?.status === "ned" ? "uppercase" : "capitalize"
                    } text-center`}
                >
                  {selectedItem?.status}
                </p>
              </div>
            )}

            {selectedItem?.diagnosis && (
              <div className="ml-3 mb-2 self-center">
                <span className="bg-blue-500 p-1 rounded text-white line-clamp-1 mr-10">
                  {selectedItem?.diagnosis[0]?.title}
                </span>
              </div>
            )}
          </div>
          <div className="flex flex-row mt-3 text-right">
            <p className="text-righ">
              <span className="font-medium">Date:</span>{" "}
              {formatDate(selectedItem?.startDate)}
            </p>
          </div>
        </div>
        <div
          className={`${version === "full" ? "bg-blue-100" : "bg-white"
            } p-2 rounded-sm opacity-70 mb-3`}
        >
          <span className="font-medium text-base">Impression:</span>
          <span className="text-sm line-clamp-3 overflow-auto">
            {selectedItem?.impression}
          </span>
        </div>
        <div>
          <span className="font-medium">Reason:</span>
          <span className="p-1 font-regular text-sm capitalize">
            {selectedItem?.reason}
          </span>
        </div>
        <div>
          <span className="font-medium">Ordering Physican:</span>{" "}
          <a
            className="text-blue-800 text-sm"
            href={`/providers/${selectedItem?.orderingProvider &&
              selectedItem?.orderingProvider.length > 0
              ? selectedItem?.orderingProvider[0]?.id
              : ""
              }`}
          >
            {selectedItem?.orderingProvider &&
              selectedItem?.orderingProvider.length > 0
              ? selectedItem?.orderingProvider[0]?.firstName +
              " " +
              selectedItem?.orderingProvider[0]?.lastName +
              ", " +
              selectedItem?.orderingProvider[0]?.designation
              : null}
          </a>
        </div>
        <div className="overflow-x-auto">
          <span className="font-medium">Institution:</span>{" "}
          <Link
            className="text-blue-800 text-sm"
            href={`/institutions/${selectedItem?.institution && selectedItem?.institution.length > 0
              ? selectedItem?.institution[0].id
              : ""
              }`}
          >
            {selectedItem?.institution && selectedItem?.institution.length > 0
              ? selectedItem?.institution[0]?.title
              : ""}
          </Link>
        </div>

        {attachments && (
          <div className="grid md:grid-cols-5 grid-cols-1 gap-2 mt-4">
            {attachments
              ?.sort((a, b) => {
                const aHighlight = a.highlight ? 1 : 0;
                const bHighlight = b.highlight ? 1 : 0;
                if (aHighlight === bHighlight) return 0;
                return bHighlight - aHighlight;
              })
              .slice(0, 4)
              .map((attachment) => (
                <div className="group">
                  {" "}
                  {/* Added group class here */}
                  <a href={attachment.link} target="_blank" className="block">
                    <div className="text-white bg-slate-600 flex flex-row text-xs h-8 p-2 border rounded-sm self-center border-slate-600 w-full text-center">
                      <div className="justify-center w-full">
                        {attachment.title}
                        <div
                          className="absolute hidden mb-2 group-hover:block ml-2 text-left w-80 
                         text-slate-800 text-sm p-3 flex-wrap bg-white border border-slate-100 rounded-sm shadow-md
                        whitespace-normal z-50
                        overflow-hidden"
                        >
                          {attachment.institutions && (
                            <div className="line-clamp-3 overflow-auto normal-case">
                              <strong> Institution:</strong>{" "}
                              {attachment.institutions
                                .map(
                                  (institution) => institution.institutionName
                                )
                                .join(", ")}
                            </div>
                          )}

                          {attachment.notes && (
                            <div className="line-clamp-3 overflow-auto normal-case">
                              <strong> Notes:</strong> {attachment.notes}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="justify-end">
                        <ArrowUpRightIcon className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  </a>
                </div>
              ))}
            <a
              className={`${version === "full"
                ? "bg-slate-600 text-white"
                : "bg-slate-600 text-white"
                } rounded-xs text-center p-1 capitalize text-sm`}
              href={selectedItem?.report}
              target="_blank"
            >
              <div className="flex flex-row w-full">
                <div className="justify-center w-full text-xs mt-1">Report</div>
                <div className="justify-end mt-1">
                  <ArrowUpRightIcon className="w-4 h-4 text-gray-80" />
                </div>
              </div>
            </a>
          </div>
        )}
        {/* {listWithCommas(selectedItem.sideEffects)} */}
      </div>

      <div className={`${version === "full" && "pl-4"} mt-3`}>
        <span className="font-medium">Notes:</span>{" "}
        <span className="text-sm line-clamp-6 overflow-auto">
          {selectedItem?.notes ?? "N/A"}
        </span>
      </div>
      <div
        className={`flex flex-row ${version === "full" ? "ml-4 mr-4" : null}`}
      >
        <Relations
          attachments={attachments}
          imaging={filteredScans}
          interventions={filteredInterventions}
          medications={filteredMedications}
          appointments={filteredAppointments}
          labs={filteredLabs}
          labsSearch={true}
        />
      </div>
    </div>
  );
};

export default ImagingDetails;
