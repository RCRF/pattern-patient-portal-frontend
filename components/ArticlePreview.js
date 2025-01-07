import { Fragment, React, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import TypeCard from "./TypeCard";
import Modal from "./Modal";

const style = {
  fresh_tissue: "p-3 ml-2 mr-2 bg-green-50",
  fixed_tissue: "p-3 ml-2 mr-2 bg-blue-50",
  trials: "p-3 ml-2 mr-2 bg-red-50",
};

export default function TagLegendCard({ article }) {
  return (
    <div>
      <h1 className="text-2xl w-full mb-2 pl-2 font-medium">{article.title}</h1>{" "}
      <div className="flex flex-col  overflow-y-auto max-h-96">
        <div className="p-2 text-sm mb-2 flex flex-col text-gray-600 ">
          <p className="line-clamp-6">
            <strong>Authors:</strong>
            {article.authors
              .map(
                (author) =>
                  " " +
                  author.firstName +
                  " " +
                  author.lastName +
                  (author.affiliation ? ` (${author.affiliation})` : "")
              )
              .join(", ")}
          </p>
          {/* //format the date to be more readable */}

          <p>
            <strong>Published: </strong>
            {new Date(article.date).toLocaleDateString("en-US")}
          </p>
        </div>

        <p className="text-gray-900 leading-none text-md font-medium mb-2">
          {article.headline}
        </p>
        <hr className="my-1 mb-3" />
        <div className="text-gray-500 leading-none text-sm mb-5">
          {Object.entries(article.abstract).map(([key, value]) => (
            <div key={key}>
              <p className="p-1">
                <strong>{key}</strong>
              </p>
              <p className="p-1">{value}</p>
            </div>
          ))}
        </div>
        <a
          target="_blank"
          href={`https://pubmed.ncbi.nlm.nih.gov/${article.PMID}/`}
          className="md:w-1/3 w-full text-center mx-auto mt-2 mb-2 items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
        >
          View on PubMed
        </a>
      </div>
    </div>
  );
}
