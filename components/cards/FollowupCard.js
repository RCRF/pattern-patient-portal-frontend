import { React, useState, Fragment, useEffect } from "react";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/solid";
import {
  ArrowDownCircleIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import Modal from "../Modal";
import InternalResearchForm from "../LabsInputForm";
import { useMutation, useQueryClient } from "react-query";
import { updateArticlePATCH } from "@/hooks/api";
import AdminEditCard from "../AdminEditCard";
import { toast } from "react-hot-toast";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  FaceFrownIcon,
  FaceSmileIcon,
  StarIcon,
} from "@heroicons/react/20/solid";
import { formatDate } from "@/utils/helpers";
import Link from "next/link";
import { followupFrequency } from "@/pages/appointments";

export default function FollowupCard({
  followup,
  isActive,
  session,
  index,
  isEditing,
  type,
}) {
  const [isAddResearchOpen, setIsAddResearchOpen] = useState(false);

  const queryClient = useQueryClient();

  const { mutate } = useMutation(updateArticlePATCH, {
    onSuccess: (data) => {
      // Handle successful response
      // fetchAllOrganizations(session).then((data) => {
      //   setOrganizations(data);
      // });
    },
    onError: (error) => {
      // Handle error
      toast.error("Error updating order");
    },
  });




  const closeAddResearch = () => {
    setIsAddResearchOpen(false);
  };

  const cardStyle = isActive
    ? "border-4 border-blue-700 shadow-lg border-opacity-20"
    : "shadow-md border-2 border-gray-200 ";

  const redirectToArticle = () => {
    if (session?.isAdmin) {
      if (session?.isAdmin && isEditing) {
        setIsAddResearchOpen(true);
      } else {
        window.open(article.link, "_blank");
      }
    } else {
      window.open(article.link, "_blank");
    }
  };



  const handleReportClick = () => {
    const url = `${followup?.report}`;
    window.open(url, "_blank");
  };



  return (
    <div
      className={`m-2 max-w-sm w-full h-full mx-auto lg:max-w-full lg:flex bg-white shadow-lg  ${cardStyle}  flex flex-col`}
    >
      <a href={`/imaging/${followup.id}`} target="_blank">
        <div className="p-4 flex flex-col leading-normal w-full">
          <div className="bg-indigo-50 pt-1 mb-2 line-clamp-1 flex flex-row text-slate-500 ">
            <div className="mr-1 ml-1 self-center">
              <InformationCircleIcon className="w-4 h-4 text-blue-500" />{" "}
            </div>
            <div className="line-clamp-3 overflow-auto">
              {followup?.reason}
            </div>
          </div>
          <div className="flex flex-col justify-between w-full">
            <div className="flex flex-row">
              <div className="flex flex-col w-full mb-5">
                <div className="text-gray-700 text-2xl l:h-28 text-right font-semibold flex lg:line-clamp-3 md-line-clamp-2 capitalize">
                  {followup?.title}
                </div>
                <div className="text-gray-400 text-xs text-right uppercase">
                  <div>{followup?.status}</div>
                  {followupFrequency.map((item) => {
                    if (item.value === followup?.frequency) {
                      return (
                        <div key={item.value}>
                          <span className="font-medium">Frequency:</span>{" "}
                          {item.label}
                        </div>
                      );
                    }
                  }
                  )}
                </div>
                <div className="text-gray-400 text-xs text-right">
                  Due Date: {formatDate(followup?.dueDate)}
                </div>

              </div>

            </div>
            <div className="text-sm line-clamp-5">
              <button
                className="flex flex-row gap-1"
                onClick={() => window.location.href = `provider/${followup.provider.id}`}>
                <span className="font-medium">Physician:</span>{" "}
                <span className="text-blue-700">
                  {followup?.provider && followup?.provider?.length > 0
                    ? followup?.provider[0]?.firstName
                    : "N/A"}{" "}
                  {followup?.provider && followup?.provider?.length > 0
                    ? followup?.provider[0]?.lastName
                    : null}{" "}
                  {followup?.provider && followup?.provider?.length > 0
                    ? followup?.provider[0]?.designation
                    : null}
                </span>
              </button>

              <button
                className="flex flex-row gap-1"
                onClick={() => window.location.href = `institution/${followup.provider.id}`}>
                <span className="font-medium">Institution:</span>{" "}
                <span className="text-blue-700">
                  {followup?.institution && followup?.institution?.length > 0
                    ? followup.institution[0]?.title
                    : null}
                </span>
              </button>
              {/* 
              "lastAppointments": [
      {
        "title": "Dermatology",
        "date": "2021-01-01",
        "provider": "John Doe, MD"
      }
    ], */}
              <hr className="my-2" />
              {/* Last appointments */}
              <div className="flex flex-row gap-1">
                <div className="font-medium">Last Appointment:</div>
                {followup?.lastAppointments?.map((appointment) => (
                  <button
                    key={appointment.title}
                    className="flex flex-row gap-1 text-xs self-center"
                    onClick={() => window.open(`/appointments/${appointment.id}`, "_blank")}>
                    <span className="text-blue-700">
                      {appointment.title}{" "}
                      {formatDate(appointment.date)}{" "}
                    </span>
                  </button>
                ))}
              </div>


              <div className="flex flex-row gap-1">
                {" "}
                <div className="font-medium">Notes:</div>{" "}
                <div className="line-clamp-3 overflow-auto text-xs self-center">
                  {followup?.notes ? followup?.notes : "N/A"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </a>

    </div>
  );
}
