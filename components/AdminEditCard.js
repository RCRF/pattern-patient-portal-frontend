import { React, useState, Fragment } from "react";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/solid";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import Modal from "./Modal";
import InternalResearchForm from "./LabsInputForm";
import { useMutation, useQueryClient } from "react-query";
import { createArticlePOST } from "@/hooks/api";
import { set } from "lodash";

export default function AdminEditCard({
  article,
  articles,
  saveOrder,
  closeModal,
}) {
  const [currentArticle, setCurrentArticle] = useState(article);

  const onSave = () => {
    saveOrder({ pastArticle: article, currentArticle: currentArticle });
    closeModal();
  };

  return (
    <div>
      <div className="p-10">
        <div className="text-2xl font-semibold">Currently Highlighting</div>
        <div
          className="justify-between border col-span-1 p-4 mt-5 rounded shadow-xl border-blue-200 border-x-4 border-y-slate-200 shadow-blue-100 "
          onClick={() => setCurrentArticle(article)}
        >
          <p className="text-md font-medium ">{currentArticle.title}</p>
          <p className="line-clamp-1 text-xs">
            Authors:{" "}
            {currentArticle.articleAuthors
              ? currentArticle.articleAuthors
                  .map(
                    (author) =>
                      author.firstName +
                      " " +
                      author.lastName +
                      " " +
                      (author.designation !== null ? author.designation : "")
                  )
                  .join(", ")
              : null}
          </p>
        </div>
      </div>
      <div className="p-10">
        <div className="text-2xl font-semibold mb-5">Replace with</div>
        <div className="grid xl:grid-cols-3 gap-2 xl:gap-10 grid-cols-1">
          {articles
            .sort((a, b) => {
              // if either value is null, sort it last
              if (a.managementOrder === null) return 1;
              if (b.managementOrder === null) return -1;

              return b.managmentOrder - a.managmentOrder;
            })
            .map((article) => (
              <div
                className={`justify-between border col-span-1 p-4 rounded shadow-xl shadow-slate-100  hover:border-x-blue-100 ${
                  article.id === currentArticle.id
                    ? "border-blue-300 border-x-4 border-y-blue-300 shadow-blue-100"
                    : "border-gray-200 border-x-4 border-y-slate-200 shadow-gray-100 "
                }}`}
                onClick={() => setCurrentArticle(article)}
              >
                <p className="text-md font-medium">{article.title}</p>
                <p className="line-clamp-1 text-xs">
                  Authors:
                  {article.articleAuthors
                    ? article.articleAuthors
                        .map(
                          (author) =>
                            (author.firstName
                              ? author.firstName + " "
                              : " N/A") +
                            (author.lastName ? author.lastName + " " : "") +
                            (author.designation !== null
                              ? author.designation
                              : "")
                        )
                        .join(", ")
                    : null}
                </p>
              </div>
            ))}
        </div>
      </div>
      <button
        onClick={onSave}
        className="mt-4 group relative w-1/5 float-right flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Save
      </button>
    </div>
  );
}
