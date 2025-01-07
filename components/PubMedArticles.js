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
import { createArticlePOST } from "@/hooks/api";
import { toast } from "react-hot-toast";
import { queryClient } from "@/queryClient";

export default function PubMedArticles({ articles, displayType }) {
  return (
    <div className="">
      {articles !== undefined && articles !== null ? (
        <div>
          <div className="align-left w-full">
            <ArticleTable articles={articles} displayType={displayType} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
