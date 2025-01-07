import React, { useState, Fragment } from "react";

import ArticleTable from "./tables/ArticlesTable";
import ResearchHighlights from "./ResearchHighlights";
import Card from "./cards/MedicationCard";
import TissueCard from "./cards/TissueCard";
// import medicationsTable from "./tables/medicationsTable";
import Modal from "./Modal";
import { PlusCircleIcon } from "@heroicons/react/24/solid";
import { useMutation } from "react-query";
import { useSession, getSession } from "next-auth/react";
import InternalResearchForm from "./LabsInputForm";
import { createArticlePOST, useTissue } from "@/hooks/api";
import { toast } from "react-hot-toast";
import { queryClient } from "@/queryClient";
import Sequencing from "./Sequencing";

export default function Research({
  version,
  articles,
  pubMedUrl,
  medications,
  trialData,
  tissue,
  isEditing,
}) {

  const { data: session } = useSession();

  //   onSuccess: (data) => {
  //     // Handle successful response
  //     // fetchAllOrganizations(session).then((data) => {
  //     //   setOrganizations(data);
  //     // });
  //   },
  //   onError: (error) => {
  //     // Handle error
  //     toast.error("Error adding article");
  //   },
  // });
  // const closeModal = () => {
  //   setIsModalOpen(false);
  // };
  // const closeAddResearch = () => {
  //   setIsAddResearchOpen(false);
  // };

  // const submitArticle = (data) => {
  //   const payload = {
  //     data,
  //     session,
  //   };
  //   mutate(payload, {
  //     onSuccess: (data) => {
  //       // setIsToggled(!isToggled);
  //       queryClient.invalidateQueries("articles");
  //     },
  //   });
  // };

  return (
    <div>
      {/* {isAddResearchOpen && (
        <Modal
          show={isAddResearchOpen}
          fragment={Fragment}
          closeModal={closeAddResearch}
        >
          <div>
            <InternalResearchForm
              closeModal={closeAddResearch}
              addArticle={submitArticle}
              type=""
            />
          </div>
        </Modal>
      )} */}

      <h1 className="text-left w-full p-4 text-2xl font-semibold mt-20">
        Tissue Locations and Quantities
      </h1>
      <div className="grid sm:grid-cols-1  grid-cols-1 md:grid-cols-2 lg:grid-cols-2 w-full gap-4">
        {tissue &&
          tissue?.map((tissue, index) => (
            <TissueCard key={index} tissue={tissue} />
          ))}
      </div>
      <Sequencing version={version} />
      {articles !== undefined && articles !== null ? (
        <div>
          <h1 className="text-left w-full p-4 text-2xl font-semibold mt-20">
            Most Recent PubMed Articles
          </h1>
          <div className="align-left w-full">
            <ArticleTable articles={articles} />
          </div>

          {pubMedUrl && (
            <div className="text-right p-2 mt-4 text-sm text-blue-700 font-semibold">
              <a
                href={pubMedUrl}
                target="_blank"
                className="mt-2 float-right text-blue-700"
              >
                View all results on PubMed
              </a>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
