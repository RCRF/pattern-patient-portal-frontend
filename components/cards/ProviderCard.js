import { React, useState } from "react";
import {
  ArrowTopRightOnSquareIcon,
  BeakerIcon,
  BuildingOffice2Icon,
  LightBulbIcon,
  StarIcon,
} from "@heroicons/react/24/solid";
import { colorLookup } from "@/utils/helpers";

export default function ProviderCard({ provider, isActive }) {
  const colorMap = {
    lab: "bg-green-400",
    physician_scientist: "bg-red-400",
    oncology: "bg-blue-400",
    research: "bg-green-400",
    surgery: "bg-indigo-400",
    chief_urologic: "bg-indigo-400",
  };

  const tagsLookup = {
    lab: "Lab",
    physician_scientist: "Physician Scientist",
    oncology: "Oncologist",
    research: "Research",
    surgery: "Surgeon",
    chief_urologic: "Chief Urologic Oncology",
  };

  // This needs to be built into a table
  const researchingInstutitions = [
    "MD Anderson Cancer Center",
    "Memorial Sloan Kettering Cancer Center",
    "Dana Farber Cancer Institute",
    "National Cancer Institute",
    "Yale Cancer Center",
  ];

  return (
    <a
      href={`/providers/${provider?.providerId}`}
      target="_blank"
      className="w-full"
    >
      <div
        className={` lg:max-w-full h-64 m:h-64 mx-auto overflow-auto lg:pl-6 lg:pr-6 sm:w-full lg:flex border bg-white shadow-lg flex sm:flex-row lg:flex-col p-4 center-self`}
      >
        <div className="flex flex-row xl:flex-row w-full">
          <div className={`w-full flex row-span-4 overflow-hidden 2xl:grid 2xl:grid-cols-4 gap-2 self-center justify-center ${provider.status === "inactive" && "opacity-50"
            }`}>
            <div className="flex col-span-1 aspect-w-1 aspect-h-1 overflow-hidden self-center h-full h-20 w-20 sm:h-20 sm:w-20 lg:h-80 xl:h-full lg:pb-4">
              <img
                className={
                  provider.image
                    ? "object-fit rounded-sm self-center"
                    : "opacity-30 object-fit rounded-sm self-center"
                }
                src={
                  provider.image ? provider.image : "/img/emptyProfilePhoto.png"
                }
                alt="profile picture"
              />
            </div>

            <div className="xl:col-span-3 lg:pt-3 pb-3 pl-2">
              <div className="flex flex-col">
                <p className="text-gray-700 text-xl font-semibold ">
                  {provider.firstName} {provider.lastName},{" "}
                  {provider.designation}
                </p>

                <p className="text-gray-700 text-lg font-semibold md:line-clamp-1">
                  {provider?.institutions?.length > 0
                    ? provider?.institutions[0]?.title
                    : null}
                </p>
                <div className="text-xs flex flex-col text-gray-600">
                  <p>
                    {provider.city}, {provider.state}, {provider.country}
                  </p>
                </div>
                <p className="text-gray-700 text-lg">{provider.role}</p>

                <div className="hidden lg:block">
                  <div className="text-xs  text-gray-700 italic line-clamp-3 overflow-y-auto">
                    Role: {provider.role}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:gap-1 max-h-14 mt-2 gap-1 justify-center w-full overflow-x-auto">

                  {provider.diagnoses.map((diagnosis, index) => (
                    <div
                      key={index}
                      className={`text-center rounded-sm w-full h-6 flex items-center text-white text-xxs rounded-1 font-medium ${diagnosis.color ? colorLookup[diagnosis.color] : 'bg-gray-600 opacity-50'
                        }`}
                    >
                      <p className="w-full">{diagnosis.title}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </a>
  );
}
