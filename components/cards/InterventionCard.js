import { React, useState, Fragment, useEffect } from "react";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/solid";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import Modal from "../Modal";
import InternalResearchForm from "../LabsInputForm";
import { useMutation, useQueryClient } from "react-query";
import { updateArticlePATCH } from "@/hooks/api";
import AdminEditCard from "../AdminEditCard";
import { toast } from "react-hot-toast";
import { formatDate } from "@/utils/helpers";

export default function Card({
  intervention,
  isActive,
  interventions,
  session,
  index,
  isEditing,
  type,
}) {
  const [isAddResearchOpen, setIsAddResearchOpen] = useState(false);

  const queryClient = useQueryClient();

  const imageLookup = {
    scan: "/img/scan.png",
    surgery: "/img/surgery.png",
    interventional: "/img/interventional.png",
    radiation: "/img/surgery.png",
  };

  const { mutate } = useMutation(updateArticlePATCH, {
    onSuccess: (data) => {
      // Handle successful response
      // fetchAllOrganizations(session).then((data) => {
      //   setOrganizations(data);
      // });
    },
    onError: (error) => {
      // Handle error
      toast.error("Error updating order");
    },
  });

  const closeAddResearch = () => {
    setIsAddResearchOpen(false);
  };

  const cardStyle = isActive
    ? "border-4 border-blue-700 shadow-lg border-opacity-20"
    : "shadow-md border-2 border-gray-200 ";

  // const redirectToArticle = () => {
  //   if (session?.isAdmin) {
  //     if (session?.isAdmin && isEditing) {
  //       setIsAddResearchOpen(true);
  //     } else {
  //       window.open(article.link, "_blank");
  //     }
  //   } else {
  //     window.open(article.link, "_blank");
  //   }
  // };

  const submitArticle = (data) => {
    const payload = {
      data,
      session,
    };
    mutate(payload, {
      onSuccess: (data) => {
        // setIsToggled(!isToggled);
        queryClient.invalidateQueries(["internalArticles"]);
      },
    });
  };

  const saveOrder = (data) => {
    if (type) {
      data.updateOrder = true;
      data.order = index + 1;
      data.type = type;
      const payload = {
        data,
        session,
      };

      mutate(payload, {
        onSuccess: (data) => {
          // setIsToggled(!isToggled);
          toast.success("Order saved");
          queryClient.invalidateQueries(["internalArticles"]);
        },
      });
    }
  };

  return (
    <a
      href={`/interventions/${intervention?.id}`}
      className={`m-2 max-w-sm w-full h-full mx-auto lg:max-w-full lg:flex bg-white shadow-lg  ${cardStyle}  flex flex-col`}
    >
      <div className="p-4 flex flex-col leading-normal w-full">
        <div className="flex flex-col justify-between w-full">
          <div
            className={`border-1 rounded-sm w-full h-8 col-span-3 text-left p-2 mb-2 ${intervention.category === "surgical"
              ? "bg-red-200"
              : intervention.category === "interventional"
                ? "bg-blue-100"
                : "bg-gray-100"
              } border-slate-400 text-gray-600 text-xs text-right uppercase flex justify-between`}
          >
            <div className="text-gray-600 text-xs text-left w-full uppercase font-bold self-center">
              {intervention.category}
            </div>
            <div className="w-full text-right self-center">
              {/* {intervention?.organs &&
                intervention?.organs?.split(",").map((organ, index, array) => {
                  return index !== array.length - 1 ? organ + ", " : organ;
                })} */}
            </div>
          </div>
          <div className="flex flex-col mb-4 w-full text-left">
            <div className="col-span-5 font-bold self-center w-full">
              {intervention.title}
            </div>

            <div className="text-sm line-clamp-5 mt-3">
              <p className="font-bold">
                Date:{" "}
                <span className="font-medium">
                  {formatDate(intervention.startDate)}
                </span>
              </p>
            </div>
            <div>
              <div className="font-bold flex flex-row text-sm">
                Organs:{" "}
                <div className="font-medium ml-1 capitalize">
                  {intervention?.metadata?.organs?.map((organ, index) => {
                    return index !== intervention?.metadata?.organs.length - 1 ? (
                      <span>{organ + ", "}</span>
                    ) : (
                      <span>{organ}</span>
                    );
                  })}
                </div>
              </div>
            </div>
            <p className="font-bold">
              Physicans:{" "}
              <span className="font-medium">
                {intervention?.providers?.map((provider, index) => {
                  return index !== intervention?.providers.length - 1 ? (
                    <a
                      href={`/providers/${provider.id}`}
                      target="_blank"
                      className="text-sm"
                    >
                      {provider.firstName +
                        " " +
                        provider.lastName +
                        ", " + " " +
                        provider.designation}{" "}
                    </a>
                  ) : (
                    <a
                      href={`/providers/${provider.id}`}
                      target="_blank"
                      className=" text-sm"
                    >
                      {provider.firstName +
                        " " +
                        provider.lastName + " " +
                        provider.designation}
                    </a>
                  );
                })}
              </span>
            </p>

            <p className="line-clamp-3 h-24 overflow-auto">
              Notes: <span className="font-medium">{intervention.notes}</span>
            </p>
          </div>
        </div>
      </div>
    </a>
  );
}
