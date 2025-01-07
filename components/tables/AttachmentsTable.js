import { isEmpty, set } from "lodash";
import { type } from "os";
import React, { Fragment, useState } from "react";
import Modal from "../Modal";
import { Switch } from "@headlessui/react";
import { formatShortDate } from "@/utils/helpers";
import ArticlePreview from "../ArticlePreview";
import AttachmentPreview from "../AttachmentPreview";
import ResearchLinkInputForm from "../forms/ResearchLinkInputForm";
import ReactMarkdown from "react-markdown";

export default function AttachmentsTable({
  attachments,
  version = "attachments",
  referenceId,
  modalType,
  isAdmin = false,
}) {
  const [previewedLink, setPreviewedLink] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const openModal = (link) => {
    setPreviewedLink(link);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
  };

  const handleEdit = (link) => {
    setPreviewedLink(link);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  return (
    <div className="w-full">
      {isModalOpen && (
        <Modal show={isModalOpen} fragment={Fragment} closeModal={closeModal}>
          {isEditing ? (
            <ResearchLinkInputForm
              closeModal={closeModal}
              researchLink={previewedLink}
              researchInterestId={referenceId}
            />
          ) : (
            <AttachmentPreview attachment={previewedLink} modalType={modalType} />
          )}
        </Modal>
      )}
      <div className="w-full flex">
        <table className="border w-full overflow-auto">
          <thead className="w-full bg-slate-100 overflow-auto">
            <tr className="overflow-auto">
              {version === "researchLink" && (
                <th
                  scope="col"
                  className="py-3.5 px-3.5 w-1/12 pl-4 pr-3 text-left text-md font-semibold text-gray-900"
                >
                  Date
                </th>
              )}

              <th
                scope="col"
                className="px-3 py-3.5 text-left text-md font-semibold text-gray-900 hidden sm:table-cell"
              >
                {version !== "researchLink" ? "Category" : "Type"}
              </th>

              <th
                scope="col"
                className="py-3.5 px-3.5 w-1/4 pl-4 pr-3 text-left text-md font-semibold text-gray-900"
              >
                Title
              </th>


              {version !== "researchLink" ? (
                <div>

                  <th
                    scope="col"
                    className="py-3.5 px-3.5 w-1/5 pl-4 pr-3 text-left text-md font-semibold text-gray-900"
                  >
                    Institution
                  </th>
                </div>
              ) : (
                <th
                  scope="col"
                  className="py-3.5 px-3.5 w-1/5 pl-4 pr-3 text-left text-md font-semibold text-gray-900 hidden lg:table-cell"
                >
                  Description
                </th>
              )}

              <th
                scope="col"
                className="py-3.5 px-3.5 w-1/3 pl-4 pr-3 text-left text-md font-semibold text-gray-900 hidden lg:table-cell"
              >
                Notes
              </th>

              <th
                scope="col"
                className="w-1/12 pr-6 line-clamp-1overflow-hidden whitespace-nowrap truncate text-center text-md font-semibold text-gray-900 hidden sm:table-cell"
              >
                <div className="text-center w-full">{version === "researchLink" ? "Link" : ""}</div>
              </th>
              {version === "researchLink" && isAdmin && (
                <th
                  scope="col"
                  className="w-1/5 pr-6 line-clamp-1 overflow-hidden whitespace-nowrap truncate text-center text-md font-semibold text-gray-900 hidden sm:table-cell"
                >
                  Edit
                </th>
              )}

              <th scope="col" className="pr-6 hidden lg:table-cell"></th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200 bg-white">
            {Array.isArray(attachments) &&
              attachments.map((attachment, index) => (
                <tr key={index}>
                  {version === "researchLink" && (
                    <td className="lg:pl-4 py-4 pl-1 text-sm font-medium  text-gray-900 w-1/12 sm:pl-0">
                      <>
                        {attachment?.startDate
                          ? formatShortDate(attachment?.startDate)
                          : ""}
                      </>
                    </td>
                  )}

                  <td className="py-4 pl-3 pr-4 text-left text-xs font-medium sm:pr-0 text-gray-600 hidden sm:table-cell capitalize">
                    {version !== "researchLink" ? attachment.category : attachment.linkType}
                  </td>{" "}

                  <td className="lg:pl-4 py-4 pl-1 text-sm font-medium text-blue-600 text-left  sm:pl-0">
                    <div
                      onClick={() => openModal(attachment)}
                      className="text-left w-full"
                    >
                      {attachment.title}
                    </div>
                  </td>


                  {version !== "researchLink" ? (
                    <td className="py-4 pl-3 pr-4 text-left w-1/6 text-xs font-medium sm:pr-0 text-gray-600 hidden sm:table-cell capitalize">
                      <>

                        {attachment.institutions
                          ?.map(
                            (institution, index) => institution.institutionName
                          )
                          .join(", ")}
                      </>
                    </td>
                  ) : (
                    <td className="py-4 pl-3 pr-4 w-1/4 text-left text-xs text-md line-clamp-3 font-medium sm:pr-0 text-gray-600 hidden sm:table-cell">
                      <div className="line-clamp-4 overflow-auto">
                        <ReactMarkdown>{attachment.description}</ReactMarkdown>
                      </div>
                    </td>
                  )}

                  <td className="py-4 pl-3 pr-4 text-left text-xs text-md line-clamp-3 font-medium sm:pr-0 text-gray-600 hidden sm:table-cell">
                    <div className="line-clamp-4 overflow-auto break-all">
                      <ReactMarkdown>{attachment.notes}</ReactMarkdown>
                    </div>
                  </td>

                  <td className="text-blue-500 w-1/12 text-center break-all text-md text-left text-xs font-medium sm:pr-0 hidden sm:table-cell">
                    {attachment?.link ? (

                      <a href={attachment?.link} target="_blank">
                        View
                      </a>
                    ) : (
                      ""
                    )}
                  </td>
                  {version === "researchLink" && isAdmin && (
                    <td className="text-blue-500 break-all text-md text-center text-xs font-medium sm:pr-0 underline hidden sm:table-cell">
                      <button onClick={() => handleEdit(attachment)}>Edit</button>
                    </td>
                  )}

                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
