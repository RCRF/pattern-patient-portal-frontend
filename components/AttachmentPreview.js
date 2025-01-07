import { Fragment, React, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import TypeCard from "./TypeCard";
import Modal from "./Modal";
import { formatDate } from "@/utils/helpers";
import ReactMarkdown from "react-markdown";

const style = {
  fresh_tissue: "p-3 ml-2 mr-2 bg-green-50",
  fixed_tissue: "p-3 ml-2 mr-2 bg-blue-50",
  trials: "p-3 ml-2 mr-2 bg-red-50",
};

export default function AttachmentPreview({
  attachment,
  version = "researchLink",
  modalType
}) {
  return (
    <div className="p-4">
      <h1 className="text-3xl w-full mb-2 pl-2 font-medium">
        {attachment.title}
      </h1>{" "}
      <div className="flex flex-col  overflow-y-auto max-h-96 ">
        <div className="p-2 text-sm mb-2 flex flex-col text-gray-600 ">
          <p>
            <strong>Date: </strong>
            {attachment?.startDate && version === "researchLink"
              ? formatDate(attachment.startDate)
              : attachment?.createdAt
                ? formatDate(attachment.createdAt)
                : "N/A"}
          </p>
        </div>

        <div className="pl-2 pr-2 text-md font-semibold">Description</div>
        <ReactMarkdown className="pl-2 pr-2 text-gray-700 leading-snug text-base mb-2">
          {attachment?.description}
        </ReactMarkdown>

        <hr className="my-1 mb-3" />

        <div className="pl-2 pr-2 text-md font-semibold">Notes</div>

        <ReactMarkdown className="pl-2 pr-2 text-slate-700 text-sm mb-10 leading-5">
          {attachment?.notes}
        </ReactMarkdown>

        {modalType && modalType === "image" ? (
          <div className="flex flex-col items-center">
            <img
              src={attachment?.link}
              className="w-full"
              alt="attachment"
            />
          </div>

        ) : (
          <a
            target="_blank"
            href={attachment?.link}
            className="md:w-1/3 w-full text-center mx-auto mt-2 mb-2 items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
          >
            Go to Link
          </a>
        )}

      </div>
    </div>
  );
}
