import { React, useState } from "react";
import Link from "next/link";

import { colorLookup } from "@/utils/helpers";

export default function InstitutionCard({ institution, isActive }) {



  return (
    <Link href={`/institutions/${institution.institutionId}`} target="_blank">
      <div
        className={`lg:m-2 lg:max-w-full lg:flex border bg-white shadow-lg flex flex-col p-4 ${institution.status === "inactive" && "opacity-50"
          }`}
      >
        <div className="w-full row-span-4 overflow-hidden grid grid-cols-4 gap-2 xl:h-38 md:h-36">
          <div className="col-span-1 flex">
            <img
              className={
                institution.image !== null
                  ? "object-fit rounded-sm self-center"
                  : "opacity-60 object-fit rounded-sm self-center"
              }
              src={`${institution.image !== null
                ? institution.image
                : "/img/emptyInstitution.png"
                }`}
              alt="institution image"
            />
          </div>
          <div className="col-span-3 flex items-center pl-4">
            <div className="flex flex-col ">
              <div className="max-h-20 min-h-20">
                {institution?.status === "inactive" && (
                  <div className="w-full text-xxs capitalize">
                    {institution.status}
                  </div>
                )}
                <p className="text-gray-700 text-lg font-semibold line-clamp-1">
                  {institution?.title}
                </p>
              </div>
              <div className="text-xs mb-2 flex flex-col text-gray-600">
                <p>
                  {institution?.city}, {institution?.state},{" "}
                  {institution?.country}
                </p>
              </div>
              <div className="flex flex-col max-h-20 justify-center mt-2 overflow-scroll">
                {institution?.diagnoses?.length > 0 && (
                  <div className="text-slate-700 text-sm font-medium">
                    Manages{" "}
                  </div>
                )}
                <div className="grid grid-cols-1 gap-1 mt-2 justify-center opacity-50 overflow-scroll">
                  {institution?.diagnoses
                    ?.filter((d) => d.category !== "allergy")
                    .map((diagnosis, index) => (
                      <div
                        key={index}
                        className={`text-center rounded-sm h-5 p-1 flex items-center text-xxs rounded-1 text-white font-medium ${diagnosis.color ? colorLookup[diagnosis.color] : 'bg-gray-600 opacity-50'
                          }}`}
                      >
                        <div className="w-full line-clamp-1">
                          {diagnosis.title}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
