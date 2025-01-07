import { React, useState } from "react";
import {
  VideoCameraIcon,
  DocumentTextIcon,
  HeadphonesIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline";

export default function ResourceCard({ resource, isActive }) {
  const iconLookup = {
    video: (
      <VideoCameraIcon className="h-6 w-6 text-white" aria-hidden="true" />
    ),
    article: (
      <DocumentTextIcon className="h-6 w-6 text-white" aria-hidden="true" />
    ),
    website: <GlobeAltIcon className="h-6 w-6 text-gray" aria-hidden="true" />,
  };

  const cardStyleLookup = {
    video: "bg-green-300",
    article: "bg-blue-300",
    website: "bg-gray-300",
  };

  return (
    <a href={resource.link} target="_blank">
      <div
        className={`ml-2 mr-2 lg:max-w-full lg:flex border bg-white shadow-lg flex flex-col h-52 justify-center bg-slate-100`}
      >
        <div className="w-full overflow-hidden grid xl:grid-cols-4 sm:grid-cols-1 gap-2 xl:pr-8 p-2 self-center">
          <div
            className={`relative self-center rounded p-4 w-30 h-30 justify-center flex xl:m-2 items-center ${
              cardStyleLookup[resource.resourceType]
            }`}
          >
            {iconLookup[resource.resourceType]}
          </div>

          <div className="xl:col-span-3 pt-3 pb-3 pl-2 flex justify-center items-center ">
            <div className="flex flex-col w-full">
              <p className="text-gray-700 text-xl font-semibold mb-1">
                {resource.title}
              </p>
              <div className="text-gray-700 h-20 overflow-scroll text-sm mb-2">
                {resource.description}
              </div>
            </div>
          </div>
        </div>
      </div>
    </a>
  );
}
