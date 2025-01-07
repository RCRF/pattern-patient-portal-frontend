import { React, useState, Fragment, useEffect } from "react";
import { useMutation, useQueryClient } from "react-query";
import { updateArticlePATCH } from "@/hooks/api";
import { toast } from "react-hot-toast";
import { formatDate, formatShortDate } from "@/utils/helpers";
import ReactMarkdown from "react-markdown";

export default function ResearchCard({
  researchInterest,
  isActive,
  session,
  index,
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

  return (
    <a
      target="_blank"
      href={`/research/${researchInterest?.id}`}
      className={`m-2 max-w-sm w-full h-full mx-auto lg:max-w-full lg:flex bg-white shadow-lg  ${cardStyle}  flex flex-col`}
    >
      <div className="pt-7 pl-7 pr-7 pb-5 flex flex-row leading-normal w-full text-slate-800 ">
        <div className="flex flex-col justify-between w-full">
          <div
            className={`border-1 rounded-sm w-full col-span-3 mb-2 border-slate-400 text-gray-600 text-xs text-right uppercase flex justify-between`}
          >
            <div className="text-gray-600 text-sm text-left w-full uppercase self-center">
              <div className="flex flex-col xl:flex-row sm:justify-between">
                <div className="font-semibold ">
                  {researchInterest?.category}
                </div>
                <p className="capitalize text-sm font-medium">
                  Added:{" "}
                  <span className="font-medium text-sm">
                    {formatShortDate(researchInterest?.createdAt)}
                  </span>
                </p>
              </div>
              <hr className="w-full border-2 border-green-100 mt-2" />
            </div>
          </div>
          <div className="flex flex-col w-full text-left">
            <div className="font-bold self-center w-full xl:h-15 text-lg line-clamp-2 overflow-auto">
              {researchInterest?.title}
            </div>
          </div>
          <div>
            {/* <div className="text-xs mb-2 grid grid-cols-3 gap-2 text-gray-600">
              {researchInterest.sideEffects.map((sideEffect, index) => (
                <p
                  className="bg-blue-400 rounded rounded-sm text-center p-1 capitalize"
                  key={index}
                >
                  {sideEffect}
                </p>
              ))}
            </div> */}
          </div>
          <div className="text-sm line-clamp-5">
            {/* //format the date to be more readable */}

            <div className="flex flex-row mt-5">
              <div className="font-bold">
                Description{" "}
                <p className="font-medium line-clamp-3 overflow-auto">
                  <ReactMarkdown>{researchInterest?.description}</ReactMarkdown>
                </p>
              </div>
            </div>

            <div className="flex flex-row xl:h-32 mt-5">
              <div className="font-bold">
                Notes{" "}
                <p className="font-medium line-clamp-4 overflow-auto">
                  <ReactMarkdown>{researchInterest?.notes}</ReactMarkdown>
                </p>
              </div>
            </div>

            <div className="flex flex-row gap-4 float-right mt-4">
              <p className="bg-blue-100 rounded p-2 font-medium text-xs">
                Links: {researchInterest?.researchLinks.length}
              </p>
              <p className="bg-blue-100 rounded p-2 font-medium text-xs">
                Notes: {researchInterest?.researchNotations.length}
              </p>
              {/* <p className="bg-blue-100 rounded p-2 font-medium text-xs">
                Interested Funders: 0
              </p> */}
            </div>
          </div>
        </div>
      </div>
    </a>
  );
}
