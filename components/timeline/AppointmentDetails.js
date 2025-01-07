import React, { use, useEffect, useState } from "react";
import {
  formatDate,
  convertToTimeZone,
  filterItemsToDuringPlusInterval,
  filterItemsToDuringPlusIntervalBeforeAndAfter,
} from "@/utils/helpers";
import Relations from "./Relations";
import { ArrowDownTrayIcon } from "@heroicons/react/20/solid";
import ReactMarkdown from "react-markdown";
import { ArrowUpRightIcon } from "@heroicons/react/20/solid";

const AppointmentDetails = ({
  selectedItem,
  displayFull,
  imaging,
  medications,
  interventions,
  labs,
}) => {
  const [filteredMedications, setFilteredMedications] = useState([]);
  const [filteredScans, setFilteredScans] = useState([]);
  const [filteredInterventions, setFilteredInterventions] = useState([]);
  const [filteredLabs, setFilteredLabs] = useState([]);
  const [highlightedAttachments, setHighlightedAttachments] = useState([]);

  useEffect(() => {
    if (!labs) return;
    const filterLabs = filterItemsToDuringPlusIntervalBeforeAndAfter(
      labs,
      selectedItem,
      30,
      14
    );

    setFilteredLabs(filterLabs);
  }, [labs]);



  useEffect(() => {
    if (!selectedItem) return;
    if (!medications) return;
    const medicationsFilt = filterItemsToDuringPlusInterval(
      medications,
      selectedItem,
      7
    ).sort((a, b) => {
      const startDate = new Date(a.startDate);
      const endDate = new Date(b.startDate);
      return endDate - startDate;
    });
    setFilteredMedications(medicationsFilt);

    if (!imaging) return;
    const scansFilt = filterItemsToDuringPlusIntervalBeforeAndAfter(
      imaging,
      selectedItem,
      60,
      40
    ).sort((a, b) => {
      const startDate = new Date(a.startDate);
      const endDate = new Date(b.startDate);
      return endDate - startDate;
    });

    setFilteredScans(scansFilt);

    if (!interventions) return;
    const interventionsFilt = filterItemsToDuringPlusIntervalBeforeAndAfter(
      interventions,
      selectedItem,
      7,
      90
    ).sort((a, b) => {
      const startDate = new Date(a.startDate);
      const endDate = new Date(b.startDate);
      return endDate - startDate;
    });
    setFilteredInterventions(interventionsFilt);

  }, [selectedItem, imaging, medications, interventions]);

  useEffect(() => {
    if (!selectedItem) return;

    const highlighted = selectedItem?.appointmentAttachments?.filter(
      (attachment) => attachment.highlight === true
    );
    debugger;
    setHighlightedAttachments(highlighted);
  }, [selectedItem]);


  return (
    <div className="pl-3 pr-3">
      <div className="bg-slate-100 p-2 pl-4 pr-4">
        <div className="flex md:flex-row flex-col justify-between">
          <div className="flex flex-row">
            <a href={`/appointments/${selectedItem?.id}`}>
              <h2 className="font-bold text-3xl mb-2">{selectedItem?.title}</h2>
            </a>
            {selectedItem?.diagnosis && (
              <div className="ml-3 self-center mb-2">
                <span className="bg-blue-500 p-1 rounded text-white">
                  {selectedItem?.diagnosis[0]?.title}
                </span>
              </div>
            )}
          </div>
          <div className="flex md:flex-row flex-col mt-3">
            <p className="mr-5">
              <span className="font-medium">Date:</span>{" "}
              {formatDate(selectedItem?.startDate)}
            </p>
            <p className="mr-5">
              <span className="font-medium">Time:</span>{" "}
              {convertToTimeZone(selectedItem?.time, "eastern")}
            </p>
          </div>
        </div>

        {selectedItem?.category === "labs" && (
          <div>
            {/* <span className="font-medium">Panels:</span>{" "} */}
            <span className="font-regular">
              <div className="text-xs mb-2 grid grid-cols-5 gap-1 text-gray-600">
                {selectedItem?.panels?.map((panel, index) => (
                  <div
                    className={`rounded-sm text-center p-1 capitalize text-white bg-slate-600`}
                    key={index}
                  >
                    <div className="flex flex-row w-full">
                      <div className="justify-center w-full">{panel} </div>
                      <div className="justify-en">
                        <ArrowDownTrayIcon className="w-4 h-4 text-gray-80" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </span>
          </div>
        )}

        <div>
          <span className="font-medium">Reason:</span>
          <span className="p-1 font-regular text-sm">
            {selectedItem?.reason}
          </span>
        </div>
        <div>
          <span className="font-medium">Provider:</span>{" "}
          <span className="text-blue-800 text-sm">
            {selectedItem?.providers &&
              selectedItem?.providers.map((provider, index) => (
                <a
                  key={provider.id}
                  href={`/providers/${provider.id}`}
                  target="_blank"
                >
                  {provider.firstName} {provider.lastName}{" "}
                  {provider.designation}
                </a>
              ))}
          </span>
        </div>

        {displayFull && (
          <div>
            <div className="overflow-x-auto">
              <span className="font-medium">Institution:</span>{" "}
              <span className="text-blue-800 text-sm">
                {selectedItem?.institutions &&
                  selectedItem?.institutions.map((institution, index) => (
                    <a
                      key={institution.id}
                      href={`/institutions/${institution.institutionId}`}
                      target="_blank"
                    >
                      {institution.institutionName}
                    </a>
                  ))}
              </span>
            </div>

            <div className="overflow-x-auto">
              <span className="font-medium">Notes:</span>{" "}
              <ReactMarkdown className="text-xs">
                {selectedItem?.notes}
              </ReactMarkdown>

            </div>

            {highlightedAttachments && (
              <div className="grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-5 gap-2 mt-4">
                {highlightedAttachments.slice(0, 6).map((attachment) => (
                  <div className="group">
                    {" "}
                    {/* Added group class here */}
                    <a href={attachment.link} target="_blank" className="block">
                      <div className="text-white bg-slate-600 flex flex-row text-xs h-8 p-2 border rounded-sm self-center border-slate-600 w-full text-center">
                        <div className="justify-center w-full line-clamp-2 overflow-auto">
                          {attachment.title}
                          <div
                            className="absolute hidden mb-2 group-hover:block ml-2 text-left w-80 
                         text-slate-800 text-sm p-3 flex-wrap bg-white border border-slate-100 rounded-sm shadow-md
                        whitespace-normal z-50
                        overflow-hidden"
                          >
                            <div className="flex flex-row gap-1 col-span-1">
                              <div>Date: {formatDate(attachment.startDate)}</div>
                            </div>

                            {attachment.institutions && (
                              <div className="line-clamp-3 overflow-auto normal-case">
                                <strong> Institution:</strong>{" "}
                                {attachment.institutions
                                  .map((institution) => institution.institutionName)
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
              </div>
            )}
          </div>
        )}
      </div>
      <div className="flex flex-row">
        <Relations
          imaging={filteredScans}
          medications={filteredMedications}
          interventions={filteredInterventions}
          labs={filteredLabs}
          attachments={selectedItem?.appointmentAttachments}
        />
      </div>
    </div>
  );
};

export default AppointmentDetails;
