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

export default function ScanCard({
  scan,
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

  const submitArticle = (data) => {
    const payload = {
      data,
      session,
    };
    mutate(payload, {
      onSuccess: (data) => {
        // setIsToggled(!isToggled);
        queryClient.invalidateQueries(["internalArticles"]);
      },
    });
  };

  const saveOrder = (data) => {
    if (type) {
      data.updateOrder = true;
      data.order = index + 1;
      data.type = type;
      const payload = {
        data,
        session,
      };

      mutate(payload, {
        onSuccess: (data) => {
          // setIsToggled(!isToggled);
          toast.success("Order saved");
          queryClient.invalidateQueries(["internalArticles"]);
        },
      });
    }
  };

  const handleReportClick = () => {
    const url = `${scan?.report}`;
    window.open(url, "_blank");
  };

  return (
    <div
      className={`m-2 max-w-sm w-full h-full mx-auto lg:max-w-full lg:flex bg-white shadow-lg  ${cardStyle}  flex flex-col`}
    >
      <a href={`/imaging/${scan.id}`} target="_blank">
        <div className="p-4 flex flex-col leading-normal w-full">
          <div className="flex flex-col justify-between w-full">
            <div className="flex flex-row">
              <div
                className={`w-7 h-7 rounded-sm flex items-center justify-center
  ${scan.status === "stable" || scan.status === "normal"
                    ? "bg-blue-400"
                    : scan.status === "progression" || scan.status === "growth" || scan.status === "abnormal finding"
                      ? "bg-red-400"
                      : scan.status === "decrease" || scan.status === "ned" || scan.status === "partial response"
                        ? "bg-green-400"
                        : "bg-gray-400"
                  }`}
              >
                <p className="text-white">
                  {scan.status === "stable" ? (
                    <div className="w-5 h-5 text-white"></div>
                  ) : scan.status === "progression" ? (
                    <ArrowUpIcon className="w-5 h-5 text-white" />
                  ) : scan.status === "decrease" ? (
                    <ArrowDownIcon className="w-5 h-5 text-white" />
                  ) : scan.status === "ned" ? (
                    <StarIcon className="w-5 h-5 text-white" />
                  ) : scan.status === "growth" ? (
                    <ArrowUpIcon className="w-5 h-5 text-white" />
                  ) : (
                    ""
                  )}
                </p>
              </div>
              <div className="flex flex-col w-full mb-5">
                <div className="text-gray-700 text-2xl l:h-28 text-right font-semibold flex lg:line-clamp-3 md-line-clamp-2 capitalize">
                  {scan?.title}
                </div>
                <div className="text-gray-400 text-xs text-right uppercase">
                  <div>{scan?.status}</div>
                  <div>{formatDate(scan.startDate)}</div>
                </div>
              </div>
            </div>
            <div className="text-sm line-clamp-5">
              <p>
                <span className="font-medium">Physicans:</span>{" "}
                {scan?.orderingProvider && scan?.orderingProvider?.length > 0
                  ? scan?.orderingProvider[0]?.firstName
                  : "N/A"}{" "}
                {scan?.orderingProvider && scan?.orderingProvider?.length > 0
                  ? scan?.orderingProvider[0]?.lastName
                  : null}{" "}
                {scan?.orderingProvider && scan?.orderingProvider?.length > 0
                  ? scan?.orderingProvider[0]?.designation
                  : null}
              </p>

              <p>
                <span className="font-medium">Institution:</span>{" "}
                {scan?.institution && scan?.institution?.length > 0
                  ? scan.institution[0]?.title
                  : null}
              </p>
              <hr className="my-2" />
              <div className="bg-indigo-50 pt-1 mt-2 mb-2 line-clamp-1 flex flex-row text-slate-500 ">
                <div className="mr-1 ml-1 self-center">
                  <InformationCircleIcon className="w-4 h-4 text-blue-500" />{" "}
                </div>
                <div className="line-clamp-3 overflow-auto">
                  <span className="font-medium">Impression:</span>{" "}
                  {scan?.impression}
                </div>
              </div>
              <p className="line-clamp-3 h-24 overflow-auto">
                {" "}
                <span className="font-medium">Notes:</span>{" "}
                {scan?.notes ? scan?.notes : "N/A"}
              </p>
            </div>
          </div>
        </div>
      </a>
      {scan?.report && (
        <div
          className="text-sm w-full text-right pr-10 bottom text-blue-500"
          onClick={handleReportClick}
        >
          View Report
        </div>
      )}
    </div>
  );
}
