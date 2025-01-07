import { React, useState } from "react";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/solid";
import {
  ClipboardDocumentListIcon,
  ClipboardIcon,
  DocumentIcon,
} from "@heroicons/react/20/solid";

export default function DocumentsCard({ document }) {
  return (
    <a href={document.link} target="_blank">
      <div
        className={`m-2 lg:max-w-full lg:flex border bg-white shadow-lg flex flex-col p-4`}
      >
        <div className="w-full row-span-4 overflow-hidden grid grid-cols-4 gap-2">
          <DocumentIcon className="w-14 h-14 inline-block  pl-1 mb-1 text-blue-300 " />

          <div className="col-span-3 self-center">
            <div className="flex flex-col">
              <p className="text-gray-700 text-lg md:text-2xl pl-4 font-semibold">
                {document.title}
              </p>
            </div>
          </div>
        </div>
      </div>
    </a>
  );
}
