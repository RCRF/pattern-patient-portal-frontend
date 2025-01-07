import { isEmpty, set } from "lodash";
import { type } from "os";
import React, { Fragment, useEffect, useState } from "react";
import Modal from "../Modal";
import ArticlePreview from "../ArticlePreview";
import { sortByDateDesc, formatDate, formatShortDate } from "@/utils/helpers";
import ResearchLinkInputForm from "../forms/ResearchLinkInputForm";
import { preview } from "@cloudinary/url-gen/actions/videoEdit";

export default function ResearchTable({ research, displayType }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewedArticle, setPreviewedArticle] = useState(null);
  const [filteredResearch, setFilteredResearch] = useState(research);
  const [isEditing, setIsEditing] = useState(false);

  const closeModal = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    if (!research) return;
    //sort by createdDate desc
    const sorted = research.sort((a, b) => {
      if (a.createdAt && b.createdAt) {
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else {
        return 0;
      }
    });

    setFilteredResearch(sorted);
  }, [research]);

  return (
    <div className="">
      {isModalOpen && (
        <Modal show={isModalOpen} fragment={Fragment} closeModal={closeModal}>
          {isEditing ? (
            <ResearchLinkInputForm
              closeModal={closeModal}
              researchInterestId={previewedArticle.researchInterestId}
            />
          ) : (
            <ArticlePreview research={previewedArticle} />
          )}
        </Modal>
      )}
      <div className="max-h-[600px] overflow-auto bg-slate-50">
        <table className="border w-full">
          <thead>
            <tr className="bg-slate-50 w-full">
              <th
                scope="col"
                className="px-3 py-3.5 text-left text-md font-semibold text-gray-900 hidden sm:table-cell"
              >
                Date
              </th>
              <th
                scope="col"
                className="py-3.5 px3.5 pl-4 pr-3 text-left text-md font-semibold text-gray-90"
              >
                Title
              </th>

              <th
                scope="col"
                className="px-3 py-3.5 text-left text-md font-semibold text-gray-900 hidden sm:table-cell"
              >
                Description
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-left text-md font-semibold text-gray-900 hidden sm:table-cell"
              >
                Notes
              </th>
              <th
                scope="col"
                className="hidden px-3 py-3.5 text-center text-md font-semibold text-gray-900 lg:table-cell"
              >
                Links / Comments
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {Array.isArray(filteredResearch) &&
              filteredResearch.map((research, index) => (
                <tr key={index}>
                  <td className="py-4 pl-3 pr-4 text-left text-sm font-medium sm:pr-0 hidden sm:table-cell">
                    {formatShortDate(research.createdAt)}
                  </td>
                  <td className="w-full lg:pl-4 lg:w-1/3 max-w-0 py-4 pl-1 text-blue-600 hover:text-blue-900 text-sm font-medium sm:w-auto sm:max-w-none sm:pl-0">
                    <a href={`/research/${research.id}`}> {research.title}</a>
                  </td>

                  <td className="hidden px-3 py-4 lg:w-1/4  text-sm text-left lg:table-cell">
                    <div className=" line-clamp-3 overflow-auto">
                      {research?.description}
                    </div>
                  </td>

                  <td className="hidden px-3 py-4 lg:w-1/4 text-sm text-left lg:table-cell">
                    <div className=" line-clamp-3 overflow-auto">
                      {research?.notes}
                    </div>
                  </td>

                  <td className="py-4 pl-3 pr-4 text-center text-xs lg:w-1/10 font-medium sm:pr-0 text-gray-600 hidden sm:table-cell">
                    <div className="flex flex-col">
                      <div>
                        {research?.researchLinks?.length > 0
                          ? "Links: " + research?.researchLinks?.length
                          : ""}
                      </div>
                      <div>
                        {research?.researchNotations?.length > 0
                          ? "Comments: " + research?.researchNotations?.length
                          : ""}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
