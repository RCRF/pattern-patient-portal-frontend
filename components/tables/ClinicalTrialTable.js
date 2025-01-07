import React, { Fragment, useState } from "react";
import Modal from "../Modal";

export default function BasicTable({ trials }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewedArticle, setPreviewedArticle] = useState(null);

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const openModal = (article) => {
    setPreviewedArticle(article);
    setIsModalOpen(true);
  };

  return (
    <div className=" w-full">
      <div className="w-full">
        <table className="border w-full">
          <thead>
            <tr>
              <th
                scope="col"
                className="py-3.5 px3.5 pl-4 pr-3 text-left text-md font-semibold text-gray-900 sm:table-cell"
              >
                Title
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-left text-md font-semibold text-gray-900 sm:table-cell hidden"
              >
                Phase
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-left w-1/4 text-md font-semibold text-gray-900 sm:table-cell hidden"
              >
                Lead Sponsor
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-left text-md font-semibold text-gray-900 mr-4 sm:table-cell"
              >
                Details
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {Array.isArray(trials) &&
              trials.map((trial, index) => (
                <tr key={index}>
                  <td className="w-3/4 lg:pl-4 max-w-0 py-4 pl-2 text-sm font-medium text-gray-900 sm:pl-1 md:pl-1">
                    <div>
                      <a
                        target="_blank"
                        href={trial.link}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        {trial.title}
                      </a>
                    </div>
                  </td>

                  <td className=" lg:pl-4 max-w-0 py-4 pl-1 text-left text-sm font-medium text-gray-900 sm:w-auto sm:max-w-none sm:pl-0 hidden sm:table-cell">
                    {trial.phase}
                  </td>

                  <td className="w-1/4 lg:pl-4 max-w-0 py-4 pl-1 text-left text-sm font-medium text-gray-900 sm:w-auto sm:max-w-none sm:pl-0 hidden sm:table-cell">
                    {trial.leadSponsor}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
