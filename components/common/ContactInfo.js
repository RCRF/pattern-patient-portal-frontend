import { React, useState } from "react";
import { EnvelopeIcon, PhoneIcon } from "@heroicons/react/20/solid";
import { UserGroupIcon } from "@heroicons/react/24/solid";

export default function ContactInfo({ provider }) {
  return (
    <div className="grid sm:grid-cols-3 grid-cols-1 w-full mx-auto">
      <div className="bg-slate-700 opacity-80 text-center text-slate-300 pb-1">
        <div className="text-sm mt-1 font-semibold">Medical Records Office</div>
        {/* Icons */}
        <div className="flex flex-row justify-center">
          <div className="text-lg font-semibold flex flex-row mt-1 mr-4">
            <EnvelopeIcon className="w-5 h-5 inline-block mr-2 text-white-900" />
            <div className="font-normal text-sm self-center text-white-900">{`${provider?.institutions?.length > 0 &&
                provider?.institutions[0].recordsOfficeEmail !== null
                ? provider?.institutions[0].recordsOfficeEmail
                : ""
              }`}</div>
          </div>
          <div className="text-lg font-semibold flex flex-row mt-1 mr-4">
            <PhoneIcon className="w-4 h-4 self-center inline-block mr-2 text-white-900" />
            <div className="font-normal text-sm self-center text-white-900">{`${provider?.institutions?.length > 0 &&
                provider?.institutions[0].recordsOfficePhone !== null
                ? provider?.institutions[0].recordsOfficePhone
                : ""
              }`}</div>
          </div>
        </div>
      </div>

      {/* Nurse/PA */}
      <div className="bg-slate-700 opacity-80 text-center text-slate-300 pb-1">
        <div className="text-sm mt-1 font-semibold">NP/PA/Nurses</div>
        <div className="flex flex-row justify-center">
          <UserGroupIcon className="w-5 h-5 inline-block mr-2" />
          <div className="font-normal text-sm self-center">
            {`${provider?.staff?.map(
              (staff) => `${staff.firstName} ${staff.lastName}`
            )}`}
          </div>
        </div>
      </div>

      {/* After Hours */}
      <div className="bg-slate-700 opacity-80 text-center text-slate-300 pb-1">
        <div className="text-sm mt-1 font-semibold">After Hours</div>
        <div className="flex flex-row justify-center">
          <PhoneIcon className="w-4 h-4 self-center inline-block mr-2 text-white-900" />
          <div className="font-normal text-sm self-center text-white-900">{`${provider?.afterHours ?? ""
            }`}</div>
        </div>
      </div>
    </div>
  );
}
