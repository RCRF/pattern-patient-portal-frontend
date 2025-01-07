import React, { useState, useEffect } from "react";
import {
  formatDate,
  filterItemsToDuringPlusInterval,
  filterItemsToDuringPlusIntervalBeforeAndAfter,
  linkColumns,
} from "@/utils/helpers";
import Relations from "./Relations";

import { ArrowDownTrayIcon, ArrowUpRightIcon } from "@heroicons/react/20/solid";
import ReactMarkdown from "react-markdown";

const TagDetails = ({
  idView = false,
  selectedItem,
  displayFull,
  medications,
  imaging,
  interventions,
  diagnoses,
  links,
  labs,
}) => {
  const [filteredLabs, setFilteredLabs] = useState([]);

  // const filteredScans = scans.filter((scan) => {
  //   const scanDate = new Date(scan.startDate);
  //   const appointmentStartDate = new Date(selectedItem?.startDate);
  //   const appointmentEndDate = selectedItem?.endDate
  //     ? new Date(selectedItem?.endDate)
  //     : new Date(selectedItem?.startDate);
  //   const twoWeeksAfterDate = new Date(appointmentEndDate);
  //   twoWeeksAfterDate.setDate(appointmentEndDate.getDate() + 14);

  //   const fourteenDaysBefore = new Date(appointmentStartDate);
  //   fourteenDaysBefore.setDate(appointmentStartDate.getDate() - 14);
  //   return scanDate >= fourteenDaysBefore && scanDate <= twoWeeksAfterDate;
  // });

  useEffect(() => {
    if (labs) {
      const filteredLabs1 = filterItemsToDuringPlusIntervalBeforeAndAfter(
        labs,
        selectedItem,
        7,
        10
      );

      setFilteredLabs(filteredLabs1);
    }
  }, [labs]);

  const filteredMedications = filterItemsToDuringPlusInterval(
    medications,
    selectedItem,
    7
  ).sort((a, b) => {
    const startDate = new Date(a.startDate);
    const endDate = new Date(b.startDate);
    return endDate - startDate;
  });

  const filteredScans = filterItemsToDuringPlusIntervalBeforeAndAfter(
    imaging,
    selectedItem,
    60,
    40
  ).sort((a, b) => {
    const startDate = new Date(a.startDate);
    const endDate = new Date(b.startDate);
    return endDate - startDate;
  });

  const filteredInterventions = filterItemsToDuringPlusIntervalBeforeAndAfter(
    interventions,
    selectedItem,
    7,
    90
  ).sort((a, b) => {
    const startDate = new Date(a.startDate);
    const endDate = new Date(b.startDate);
    return endDate - startDate;
  });

  // const filteredMedications = medications.filter((medication) => {
  //   const itemStartDate = new Date(medication.startDate);
  //   const itemEndDate = medication.endDate
  //     ? new Date(medication.endDate)
  //     : itemStartDate;
  //   const selectedItemStartDate = new Date(selectedItem?.startDate);
  //   const selectedItemEndDate = selectedItem?.endDate
  //     ? new Date(selectedItem?.endDate)
  //     : selectedItemStartDate;

  //   const oneWeekOfterItemEnd = new Date(itemEndDate);
  //   oneWeekOfterItemEnd.setDate(itemEndDate.getDate() + 7);

  //   return (
  //     // Condition 1: Check if is between medication start and end dates
  //     (selectedItemStartDate >= itemStartDate &&
  //       selectedItemStartDate <= itemEndDate) ||
  //     (selectedItemEndDate >= itemStartDate &&
  //       selectedItemEndDate <= itemEndDate) ||
  //     // Condition 2: Check if is within 7 days after medication's end date
  //     (selectedItemStartDate >= itemEndDate &&
  //       selectedItemStartDate <= oneWeekOfterItemEnd) ||
  //     (selectedItemEndDate >= itemEndDate &&
  //       selectedItemEndDate <= oneWeekOfterItemEnd)
  //   );
  // });

  // const filteredDiagnoses = diagnoses?.filter((diagnoses) => {
  //   const itemStartDate = new Date(diagnoses.startDate);
  //   const itemEndDate = diagnoses.endDate
  //     ? new Date(diagnoses.endDate)
  //     : diagnoses;
  //   const selectedItemStartDate = new Date(selectedItem?.startDate);
  //   const selectedItemEndDate = selectedItem?.endDate
  //     ? new Date(selectedItem?.endDate)
  //     : selectedItemStartDate;

  //   const oneWeekOfterItemEnd = new Date(itemEndDate);
  //   oneWeekOfterItemEnd.setDate(oneWeekOfterItemEnd.getDate() + 7);

  //   return (
  //     // Condition 1: Check if is between medication start and end dates
  //     (selectedItemStartDate >= itemStartDate &&
  //       selectedItemStartDate <= itemEndDate) ||
  //     (selectedItemEndDate >= itemStartDate &&
  //       selectedItemEndDate <= itemEndDate) ||
  //     // Condition 2: Check if is within 7 days after medication's end date
  //     (selectedItemStartDate >= itemEndDate &&
  //       selectedItemStartDate <= oneWeekOfterItemEnd) ||
  //     (selectedItemEndDate >= itemEndDate &&
  //       selectedItemEndDate <= oneWeekOfterItemEnd)
  //   );
  // });

  return (
    <div className="pl-3 pr-3">
      <div className={`${idView ? 'bg-white p-3' : 'bg-slate-100 p-2'} p-2 pl-4 pr-4`}>
        <div className="flex flex-row justify-between">
          <div className="flex flex-row">
            <h2 className="font-bold text-3xl mb-2">{selectedItem?.title}</h2>
          </div>
          <div className="flex flex-row mt-3">
            <p className="mr-5">
              <span className="font-medium">Start Date:</span>{" "}
              {formatDate(selectedItem?.startDate)}
            </p>
            <p className="mr-5">
              <span className="font-medium">End Date:</span>{" "}
              {formatDate(selectedItem?.endDate)}
            </p>
          </div>
        </div>

        {selectedItem?.category === "labs" && (
          <div>
            <span className="font-regular">
              <div className="text-xs mb-2 grid grid-cols-5 gap-1 text-gray-600">
                {selectedItem?.panels?.map((panel, index) => (
                  <div
                    className={`rounded rounded-sm text-center p-1 capitalize bg-white`}
                    key={index}
                  >
                    <div className="flex flex-row w-full">
                      <div className="justify-center w-full">{panel} </div>
                      <div className="justify-en">
                        <ArrowUpRightIcon className="w-4 h-4 text-gray-80" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </span>
          </div>
        )}
        {selectedItem?.category === "diet" && (
          <div>
            <span className="font-medium">Reason:</span>
            <span className="p-1 font-regular text-sm">
              {selectedItem?.reason}
            </span>
          </div>
        )}

        {/* <div>
          <span className="font-medium">Description:</span>{" "}
          <span className="text-sm line-clamp-2">{selectedItem?.description}</span>
        </div> */}

        {displayFull && (
          <div>
            <div className="overflow-x-auto">
              <span className="font-medium">Notes:</span>{" "}
              <ReactMarkdown className="text-xs">
                {selectedItem?.notes}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </div>
      <div className="flex flex-row mb-5">
        <Relations
          interventions={filteredInterventions}
          imaging={filteredScans}
          medications={filteredMedications}
          links={links}
          linkColumns={linkColumns}
          labs={filteredLabs}
        />
      </div>
    </div>
  );
};

export default TagDetails;
