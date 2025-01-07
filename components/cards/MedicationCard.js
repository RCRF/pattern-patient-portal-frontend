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

export default function MedicationCard({
  medication,
  isActive,
  medications,
  session,
  index,
  isEditing,
  type,
}) {
  const [isAddResearchOpen, setIsAddResearchOpen] = useState(false);

  const queryClient = useQueryClient();

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

  const redirectToArticle = () => {
    if (session?.isAdmin) {
      if (session?.isAdmin && isEditing) {
        setIsAddResearchOpen(true);
      } else {
        window.open(article.link, "_blank");
      }
    } else {
      window.open(article.link, "_blank");
    }
  };

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
      className={`m-2 max-w-sm w-full h-full mx-auto lg:max-w-full lg:flex bg-white shadow-lg border-4 flex flex-col border-opacity-20 ${medication.status === "active"
        ? "border-green-400"
        : medication.status === "discontinued"
          ? "border-gray-100"
          : ""
        }`}
      href={`/medications/${medication.id}`}
      target="_blank"
    >
      {isAddResearchOpen && (
        <Modal
          show={isAddResearchOpen}
          fragment={Fragment}
          closeModal={closeAddResearch}
        >
          <AdminEditCard
            medication={medication}
            medications={medications}
            saveOrder={saveOrder}
            closeModal={closeAddResearch}
          />
        </Modal>
      )}

      <div className="p-2 flex flex-col leading-normal w-full">
        <div className="flex flex-col justify-between w-full p-2">
          {medication.status === "discontinued" ? (
            <div className="text-slate-300 text-sm w-full text-right italic">
              discontinued
            </div>
          ) : null}
          <div className="flex flex-row">
            <img
              className={`w-20 h-20 object-contain ${medication.status === "active"
                ? "opacity-90"
                : medication.status === "discontinued"
                  ? "opacity-10"
                  : ""
                }`}
              src="/img/pills.png"
              alt="pills"
            />
            <div className="flex flex-col w-full">
              <div
                className={` text-2xl l:h-28 text-right font-semibold flex lg:line-clamp-3 md-line-clamp-2 capitalize ${medication.status === "active"
                  ? "text-gray-700"
                  : medication.status === "discontinued"
                    ? "text-gray-300"
                    : ""
                  }`}
              >
                {medication.title}
              </div>
              <div className="text-gray-400 text-xs text-right capitalize">
                {medication?.diagnosis?.length > 0
                  ? medication.diagnosis[0]?.title
                  : ""}
              </div>
              <div className="text-gray-400 text-xs text-right uppercase">
                {medication.category}
              </div>
            </div>
          </div>
          <div>
            <div className="text-xs mb-2 grid grid-cols-3 gap-2 text-gray-600">
              {medication?.sideEffects
                ?.sort((a, b) => {
                  // if either value is null, sort it last
                  if (a.listOrder === null) return 1;
                  if (b.listOrder === null) return -1;

                  return a.listOrder - b.listOrder;
                })
                .slice(0, 6)
                .map((sideEffect, index) => (
                  <p
                    className={`rounded-sm text-center p-1 capitalize ${medication.status === "active"
                      ? "bg-blue-400 text-slate-800"
                      : medication.status === "discontinued"
                        ? "bg-gray-100 text-gray-400"
                        : ""
                      }`}
                    key={index}
                  >
                    {sideEffect.title}
                  </p>
                ))}
            </div>
          </div>
          <div
            className={`text-sm line-clamp-5 ${medication.status === "active"
              ? "text-slate-700"
              : medication.status === "discontinued"
                ? "text-gray-300"
                : ""
              }`}
          >
            {/* //format the date to be more readable */}
            <p>
              Prescribed by:{" "}
              {medication?.prescribingProvider?.length > 0 &&
                medication?.prescribingProvider[0]?.lastName
                ? `${medication.prescribingProvider[0].firstName} ${medication.prescribingProvider[0].lastName}`
                : "N/A"}
            </p>
            <p>
              <strong>Started: </strong>
              {formatDate(medication.startDate)}
            </p>

            <p>
              {" "}
              <strong>Stopped:</strong> {formatDate(medication.endDate)}
            </p>
            <p>
              {" "}
              Frequency: {medication?.frequency + "x " + medication?.interval ?? "Unknown"}
            </p>

            <p className="overflow-auto line-clamp-2">
              Notes: {medication.notes}
            </p>
          </div>
        </div>
      </div>
    </a>
  );
}
