import React, { useState, session, useEffect, use } from "react";
import {
  filterItemsToDuringPlusIntervalBeforeAndAfter,
  formatDate,
  listWithCommas,
} from "@/utils/helpers";
import ScanCard from "../cards/scanCard";
import MedicationsTable from "../tables/MedicationsTable";
import AppointmentsTable from "../tables/AppointmentsTable";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/20/solid";

import InterventionCard from "../cards/InterventionCard";
import AttachmentsTable from "../tables/AttachmentsTable";
import { sortByListOrderAndDate } from "@/utils/helpers";
import InterventionsTable from "../tables/InterventionsTable";
import BasicTable from "../tables/BasicTable";
import PubMedArticles from "../PubMedArticles";
import ResultsTable from "../tables/ResultsTable";
import ScansTable from "../tables/ScansTable";
import Spinner from "../common/Spinner";

const Relations = ({
  imaging,
  interventions,
  labs,
  medications,
  appointments,
  attachments,
  links,
  linkColumns,
  articles,
  labsSearch = false,
}) => {
  const [isMedicationsOpen, setIsMedicationsOpen] = useState(false);
  const [isInterventionsOpen, setIsInterventionsOpen] = useState(false);
  const [isImagingOpen, setIsImagingOpen] = useState(false);
  const [isAppointmentsOpen, setIsAppointmentsOpen] = useState(false);
  const [isLabsOpen, setIsLabsOpen] = useState(false);
  const [isAttachmentsOpen, setIsAttachmentsOpen] = useState(false);
  const [isLinksOpen, setIsLinksOpen] = useState(false);
  const [isArticlesOpen, setIsArticlesOpen] = useState(false);
  const [sortedImaging, setSortedImaging] = useState([]);
  const [viewAllImaging, setViewAllImaging] = useState(false);
  const [viewAllInterventions, setViewAllInterventions] = useState(false);

  useEffect(() => {
    if (imaging) {
      setSortedImaging(sortByListOrderAndDate(imaging));
    }
  }, [imaging]);

  useEffect(() => {
    interventions && interventions?.length > 0
      ? setIsInterventionsOpen(true)
      : setIsInterventionsOpen(false);
    interventions?.length === 0 && sortedImaging && sortedImaging.length > 0
      ? setIsImagingOpen(true)
      : setIsImagingOpen(false);
  }, [interventions]);

  return (
    <div className="w-full">
      <hr className="mt-5" />
      {/* Break each of these sections out into their own components, this could be a reusable component that you pass values into */}

      {/* Interventions */}
      {interventions && interventions.length > 0 && (
        <div className="mt-7">
          <div
            className="font-semibold text-xl mt-5 flex justify-between items-center cursor-pointer "
            onClick={() => setIsInterventionsOpen(!isInterventionsOpen)}
          >
            <p>
              Interventions{" "}
              <span className="text-slate-500 text-base">
                ({interventions?.length})
              </span>
            </p>
            <span>
              {isInterventionsOpen ? (
                <ChevronUpIcon className="h-6 w-6 text-black" />
              ) : (
                <ChevronDownIcon className="h-6 w-6 text-black" />
              )}
            </span>{" "}
          </div>

          {isInterventionsOpen && (
            <div className="pb-5">
              {!viewAllInterventions ? (
                <>
                  <div className="grid sm:grid-cols-1 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 w-full gap-4">
                    {interventions?.slice(0, 3).map((intervention, index) => (
                      <InterventionCard
                        className="shadow-md"
                        key={index}
                        intervenions={interventions}
                        isActive={false}
                        intervention={intervention}
                        session={session}
                        index={index}
                      />
                    ))}
                    .
                  </div>
                  <div className="w-full mt-[-10px]">
                    <button
                      className="text-blue-600 float-right font-medium text-sm"
                      onClick={() => setViewAllInterventions(true)}
                    >
                      {" "}
                      ({interventions?.length}) View all interventions
                    </button>
                  </div>
                </>
              ) : (
                <div className="mt-4">
                  <InterventionsTable
                    interventions={interventions}
                    modal={false}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Imaging */}
      {sortedImaging && sortedImaging.length > 0 && (
        <div className="w-full">
          <div
            className="font-semibold text-xl mt-7 flex justify-between items-center cursor-pointer"
            onClick={() => setIsImagingOpen(!isImagingOpen)}
          >
            <p>
              {" "}
              Imaging{" "}
              <span className="text-slate-500 text-base">
                ({sortedImaging?.length})
              </span>
            </p>
            <span>
              {isImagingOpen ? (
                <ChevronUpIcon className="h-6 w-6 text-black" />
              ) : (
                <ChevronDownIcon className="h-6 w-6 text-black" />
              )}
            </span>{" "}
          </div>
          {isImagingOpen && sortedImaging && sortedImaging.length > 0 && (
            <div>
              {viewAllImaging ? (
                <div className="w-full mt-4 pl-2">
                  <ScansTable scans={sortedImaging} modal={true} />
                </div>
              ) : (
                <>
                  <div className="grid sm:grid-cols-1 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 w-full gap-4">
                    {sortedImaging?.slice(0, 3)?.map((scan, index) => (
                      <ScanCard
                        className="shadow-md"
                        key={index}
                        scans={sortedImaging}
                        isActive={false}
                        scan={scan}
                        index={index}
                      />
                    ))}
                  </div>
                  <div className="w-fulf mt-4 pb-5">
                    <button
                      className="text-blue-600 float-right font-medium text-sm"
                      onClick={() => setViewAllImaging(true)}
                    >
                      {" "}
                      ({sortedImaging?.length}) View all imaging
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Medications */}
      <div
        className="font-semibold text-xl w-full"
        onClick={() => setIsMedicationsOpen(!isMedicationsOpen)}
      >
        {medications && medications.length > 0 && (
          <div>
            <div className="mt-7 flex justify-between">
              <p>
                {" "}
                Medications{" "}
                <span className="text-slate-500 text-base">
                  ({medications?.length})
                </span>
              </p>
              <div>
                {isMedicationsOpen ? (
                  <ChevronUpIcon className="h-6 w-6 text-black" />
                ) : (
                  <ChevronDownIcon className="h-6 w-6 text-black" />
                )}
              </div>
            </div>
            <div>
              {isMedicationsOpen && (
                <div className="w-full mt-2">
                  <MedicationsTable medications={medications} modal={true} />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Labs */}
      <div className="font-semibold text-xl  w-full">
        {labs && labs.length > 0 && (
          <div
            className="mt-7 flex justify-between"
            onClick={() => setIsLabsOpen(!isLabsOpen)}
          >
            <p>
              {" "}
              Labs{" "}
              <span className="text-slate-500 text-base">({labs?.length})</span>
            </p>
            <div>
              {isAppointmentsOpen ? (
                <ChevronUpIcon className="h-6 w-6 text-black" />
              ) : (
                <ChevronDownIcon className="h-6 w-6 text-black" />
              )}
            </div>
          </div>
        )}

        {isLabsOpen && (
          <div className="mt-2 w-full sm:w-full mx-auto">
            <ResultsTable
              labResults={labs}
              displaySearch={labs.length > 7 ? true : false}
            />
          </div>
        )}
      </div>

      {/* Appointments */}
      <div
        className="font-semibold text-xl  w-full"
        onClick={() => setIsAppointmentsOpen(!isAppointmentsOpen)}
      >
        {appointments && appointments.length > 0 && (
          <div className="mt-7 flex justify-between">
            <p>
              {" "}
              Appointments{" "}
              <span className="text-slate-500 text-base">
                ({appointments?.length})
              </span>
            </p>
            <div>
              {isAppointmentsOpen ? (
                <ChevronUpIcon className="h-6 w-6 text-black" />
              ) : (
                <ChevronDownIcon className="h-6 w-6 text-black" />
              )}
            </div>
          </div>
        )}

        {isAppointmentsOpen && (
          <div className="w-full mt-2">
            <AppointmentsTable appointments={appointments} modal={true} />
          </div>
        )}
      </div>

      {/* Attachments */}
      {attachments && attachments.length > 0 && (
        <div className="w-full">
          <div
            className="font-semibold text-xl mt-7 flex justify-between items-center cursor-pointer"
            onClick={() => setIsAttachmentsOpen(!isAttachmentsOpen)}
          >
            <p>
              {" "}
              Attachments{" "}
              <span className="text-slate-500 text-base">
                ({attachments?.length})
              </span>
            </p>
            <span>
              {isAttachmentsOpen ? (
                <ChevronUpIcon className="h-6 w-6 text-black" />
              ) : (
                <ChevronDownIcon className="h-6 w-6 text-black" />
              )}
            </span>{" "}
          </div>
          {isAttachmentsOpen && attachments && attachments.length > 0 && (
            <div className="w-full mt-2">
              <AttachmentsTable attachments={attachments} />
            </div>
          )}
        </div>
      )}

      {/* Links */}
      {links && links.length > 0 && (
        <div className="w-full">
          <div
            className="font-semibold text-xl mt-7 flex justify-between items-center cursor-pointer"
            onClick={() => setIsLinksOpen(!isLinksOpen)}
          >
            <p>
              {" "}
              Links{" "}
              <span className="text-slate-500 text-base">
                ({links?.length})
              </span>
            </p>
            <span>
              {isLinksOpen ? (
                <ChevronUpIcon className="h-6 w-6 text-black" />
              ) : (
                <ChevronDownIcon className="h-6 w-6 text-black" />
              )}
            </span>{" "}
          </div>
          {isLinksOpen && links && links.length > 0 && (
            <div className="w-full mt-2">
              <BasicTable data={links} columns={linkColumns} />
            </div>
          )}
        </div>
      )}

      {/* PubMed Articles */}

      {articles && (
        <div className="w-full">
          <div
            className="font-semibold text-xl mt-7 flex justify-between items-center cursor-pointer"
            onClick={() => setIsArticlesOpen(!isArticlesOpen)}
          >
            <div className="font-semibold text-lg flex flex-row">
              PubMed Articles{" "}
              {!articles || articles?.length < 1 ? (
                <div className="self-center">
                  <Spinner />
                </div>
              ) : (
                <span className="text-slate-500 text-base self-center ml-1">
                  ({articles?.length})
                </span>
              )}
            </div>
            <span>
              {isArticlesOpen ? (
                <ChevronUpIcon className="h-6 w-6 text-black" />
              ) : (
                <ChevronDownIcon className="h-6 w-6 text-black" />
              )}
            </span>{" "}
          </div>
          {isArticlesOpen && (
            <div className="w-full mt-4 pb-10">
              <PubMedArticles articles={articles} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Relations;
