import { BeakerIcon } from "@heroicons/react/24/solid";
import { React, useState } from "react";

export default function TissueCard({ tissue }) {
  return (
    <div
      className={`m-2 lg:max-w-full lg:flex border bg-white shadow-lg flex flex-row p-4`}
    >
      <div className="w-full row-span-5 overflow-hidden grid grid-cols-4 gap-2">
        <div className="col-span-1">
          <BeakerIcon
            className="text-blue-500 opacity-50 p-6"
            aria-hidden="true"
          />
        </div>

        <div className="col-span-3 self-center">
          <div className="flex flex-col">
            <p className="text-gray-700 text-xl pl-4 font-semibold">
              {tissue.title}
            </p>
            <p className="text-gray-700 text-medium pl-4 font-semibold">
              Institution: {tissue.institutions[0].institutionName}
            </p>
            <p className="text-gray-700 text-sm pl-4 capitalize">
              Type: {tissue.quantity}
            </p>
            <hr className="mt-2 mb-2 mr-4 ml-4" />
            <p className="text-gray-700 text-sm pl-4 line-clamp-3 overflow-auto">
              Notes: {tissue.notes}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
