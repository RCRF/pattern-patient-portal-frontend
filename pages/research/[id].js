import {
  useResearchInterestById,
  useFetchArticles,
  updateResearchInterestsPATCH,
} from "@/hooks/api";
import React, { Fragment, use, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { formatShortDate, formatDate } from "@/utils/helpers";
import { useMutation } from "react-query";
import { toast } from "react-hot-toast";
import { useSession, useUser } from "@clerk/nextjs";
import ReactMarkdown from "react-markdown";
import { ArrowLeftOnRectangleIcon, ArrowUpRightIcon, PencilSquareIcon, PlusCircleIcon, ShareIcon } from "@heroicons/react/20/solid";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { ChevronUpIcon } from "@heroicons/react/20/solid";
import AttachmentsTable from "@/components/tables/AttachmentsTable";
import PubMedArticles from "@/components/PubMedArticles";
import Spinner from "@/components/common/Spinner";
import { useForm, Controller } from "react-hook-form";
import { useAuth } from "@clerk/nextjs";
import ReactDatePicker from "react-datepicker";
import Modal from "@/components/Modal";
import ResearchLinkInputForm from "@/components/forms/ResearchLinkInputForm";
import ResearchCommentInputForm from "@/components/forms/ResearchCommentInputForm";
import { useQueryClient } from "react-query";
import AttachmentPreview from "@/components/AttachmentPreview";
import { usePatientContext } from "@/components/context/PatientContext";


const ResearchInterest = () => {
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  const queryClient = useQueryClient();
  const { user } = useUser();
  const router = useRouter();
  const { getToken } = useAuth();
  const { id } = router.query;
  const researchInterestId = router.query.id;
  const [supportingLinks, setSupportingLinks] = useState([]);
  const [isSupportingLinksOpen, setIsSupportingLinksOpen] = useState(false);
  const [opposingLinks, setOpposingLinks] = useState([]);
  const [isOpposingLinksOpen, setIsOpposingLinksOpen] = useState(false);
  const [isResearchNotationsOpen, setIsResearchNotationsOpen] = useState(false);
  const [pubMedQueryOptions, setPubMedQueryOptions] = useState([]);
  const [isArticlesOpen, setIsArticlesOpen] = useState(false);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [articles, setArticles] = useState();
  const [pubMedUrl, setPubMedUrl] = useState();
  const [isEditing, setIsEditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState();
  const [selectedComment, setSelectedComment] = useState();
  const [isAdmin, setIsAdmin] = useState(false);
  const [highlightedAttachments, setHighlightedAttachments] = useState();
  const [imageLinks, setImageLinks] = useState([]);
  const [isImageLinksOpen, setIsImageLinksOpen] = useState(false);
  const [previewedLink, setPreviewedLink] = useState(null);
  const [sortedComments, setSortedComments] = useState([]);
  const { patientId } = usePatientContext();
  const [commentsVisible, setCommentsVisible] = useState(new Map());


  const isEmailMatch = () => {
    return user?.emailAddresses.some(
      (emailObj) => emailObj.emailAddress === adminEmail
    );
  };

  useEffect(() => {
    if (user?.emailAddresses) {
      setIsAdmin(isEmailMatch());
    }
  }, [user]);

  const { mutate: updateResearch } = useMutation(
    (researchData) => updateResearchInterestsPATCH({ researchData, patientId }),
    {
      onSuccess: () => {
        toast.success("Changes saved");
        queryClient.invalidateQueries(["researchInterest", id]);
        setIsEditing(false);
      },
      onError: (error) => {
        toast.error("User not authorized to edit");
      },
    }
  );

  const toggleComments = (notationId) => {
    setCommentsVisible(prev => new Map(prev).set(notationId, !prev.get(notationId)));
  };

  const onSubmit = async (data) => {
    const token = await getToken();

    const researchData = {
      id: researchInterestId,
      category: data.category,
      status: data.status,
      title: data.title,
      description: data.description,
      createdAt: data.createdAt.toISOString().split("T")[0],
      notes: data.notes,
      links: data.links,
      comments: data.comments,
      visibility: data.visibility,
      pubmedKeywords: data.pubmedKeywords,
    };

    updateResearch({ researchData, token });
  };

  const { data } = useFetchArticles(pubMedQueryOptions, {
    enabled: !!pubMedQueryOptions && pubMedQueryOptions.length > 0,
  });

  const {
    data: selectedItem,
    isLoading,
    isError,
  } = useResearchInterestById({
    patientId: patientId,
    researchInterestId: researchInterestId,
  });

  const closePrevivew = () => {
    setIsPreviewOpen(false);
  };


  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (selectedItem) {
      reset({
        title: selectedItem.title,
        description: selectedItem.description,
        notes: selectedItem.notes,
        category: selectedItem.category,
        status: selectedItem.status,
        startDate: selectedItem.startDate,
        endDate: selectedItem.endDate,
        diagnosis: selectedItem.diagnosis,
        visibility: selectedItem.accessLevelId,
        createdAt: new Date(selectedItem.createdAt),
        pubmedKeywords: selectedItem.pubmedKeywords,
      });
    }
  }, [selectedItem, reset]);

  useEffect(() => {
    if (data) {
      setArticles(data.articles);
      setPubMedUrl(data.queryUrl);
    }
  }, [data]);

  useEffect(() => {
    if (!selectedItem) return;
    if (selectedItem.researchLinks.length === 0) return;
    const supportingLinks = selectedItem.researchLinks.filter(
      (link) => link.category === "supporting" && link.linkType !== "image"
    );
    supportingLinks.researchInterestId = selectedItem.id;
    if (supportingLinks.length === 0) {
      setIsSupportingLinksOpen(false);
    }
    setSupportingLinks(supportingLinks);
    const opposingLinks = selectedItem.researchLinks.filter(
      (link) => link.category === "refuting" && link.linkType !== "image"
    );

    if (opposingLinks.length === 0) {
      setIsOpposingLinksOpen(false);
    }
    opposingLinks.researchInterestId = selectedItem.id;
    setOpposingLinks(opposingLinks);

    const imageLinks = selectedItem.researchLinks.filter(
      (link) => link.linkType === "image"
    );
    opposingLinks.researchInterestId = selectedItem.id;
    setImageLinks(imageLinks);

    if (imageLinks.length === 0) {
      setIsImageLinksOpen(false);
    }


    if (selectedItem.researchNotations?.length === 0) {
      setIsResearchNotationsOpen(false);
    }
  }, [selectedItem]);



  const openModal = (link) => {
    if (link.linkType === "image") {
      link.modalType = "image";
    } else {
      link.modalType = "link";
    }
    setPreviewedLink(link);
    setIsPreviewOpen(true);
  };


  useEffect(() => {
    if (!selectedItem) return;
    if (selectedItem.researchLinks.length === 0) return;
    const highlightedAttachments = selectedItem.researchLinks.filter(
      (attachment) => attachment.highlighted === true
    );
    setHighlightedAttachments(highlightedAttachments);
  }, [selectedItem]);


  useEffect(() => {
    if (!selectedItem) return;
    if (!selectedItem.pubmedKeywords) return;
    const keywordsString = selectedItem.pubmedKeywords;
    const keywordsArray = keywordsString.split(",");

    const queryOptions = keywordsArray.map((keyword) => ({
      field: "[Title/Abstract:~50]",
      value: keyword,
      tags: [],
    }));
    queryOptions.keywords = keywordsString;

    setPubMedQueryOptions(queryOptions);
  }, [selectedItem]);

  useEffect(() => {
    if (!articles) return;
    setFilteredArticles(articles);
  }, [articles]);

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleOpenModal = (type) => () => {
    if (type === "link" || type === "image") {
      setSelectedCategory("link");
    } else {
      setSelectedCategory("researchNotation");
    }

    setIsModalOpen(true);
  };

  const handleEditComment = (comment) => () => {
    setSelectedCategory("researchNotation");
    setSelectedComment(comment);
    setIsModalOpen(true);
  };

  useEffect(() => {
    if (!selectedItem) return;
    if (selectedItem.researchNotations?.length === 0) return;

    // sort by list order than by date if list order is null, that should put it to the end of the list to be sorted by date
    const sortedComments = selectedItem.researchNotations.sort((a, b) => {
      if (a.listOrder === null && b.listOrder === null) {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      if (a.listOrder === null) {
        return 1;
      }
      if (b.listOrder === null) {
        return -1;
      }
      return a.listOrder - b.listOrder;
    });
    setSortedComments(sortedComments);
  }, [selectedItem]);

  return (
    <div>
      <div className="pl-3 pr-3 w-[80%] bg-white mx-auto mt-14 pb-20">
        <div className="pl-3 pr-3">
          <div className="mb-5 float-right">
            {isModalOpen && (
              <Modal
                show={isModalOpen}
                fragment={Fragment}
                closeModal={closeModal}
              >
                {selectedItem.id && selectedCategory === "link" || selectedItem.id && selectedCategory === "image" ? (
                  <ResearchLinkInputForm
                    closeModal={closeModal}
                    researchInterestId={selectedItem.id}
                  />
                ) : (
                  <ResearchCommentInputForm
                    closeModal={closeModal}
                    researchInterestId={selectedItem.id}
                    researchComment={selectedComment ?? null}
                  />
                )}
              </Modal>
            )}


            {isPreviewOpen && (
              <Modal show={isModalOpen} fragment={Fragment} closeModal={closePrevivew}>
                <AttachmentPreview attachment={previewedLink} modalType={previewedLink.modalType} />

              </Modal>
            )}


            {isAdmin && (
              <button
                className="self-center mt-4 text-center text-base font-semibold text-blue-600 hover:text-blue-700"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? (
                  <div>Cancel</div>
                ) : (
                  <PencilSquareIcon className="h-6 w-6" />
                )}
              </button>
            )}
          </div>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="p-2 pl-4 pr-4 pt-10">
              <div className="flex flex-row justify-between">
                <div className="flex flex-row w-full">
                  {/* use an input form and fill in the details from the selectedItem if isEditing is on other wise display the title */}
                  {isEditing ? (
                    <div className="pt-2 flex w-full flex-col float-right mb-4">
                      <div
                        htmlFor="title"
                        className="text-base font-medium float-right"
                      >
                        Title
                      </div>
                      <div>
                        <Controller
                          control={control}
                          name="title"
                          render={({ field }) => (
                            <input
                              {...field}
                              required
                              type="text"
                              className="rounded-md relative w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                          )}
                        />
                      </div>
                    </div>
                  ) : (
                    <h2 className="font-bold text-3xl mb-2 mt-2">
                      {selectedItem?.title}
                    </h2>
                  )}
                </div>
                <div className="sm:flex flex-row ml-4 mt-2 hidden ">
                  <div
                    className={`capitalize p-2 rounded text-s w-36 text-center h-10 ${selectedItem?.status === "unknown"
                      ? "bg-blue-100"
                      : selectedItem?.status === "disproven"
                        ? "bg-red-100"
                        : selectedItem?.status === "investigating"
                          ? "bg-green-100"
                          : selectedItem?.status === "connected"
                            ? "bg-green-200"
                            : "bg-gray-100"
                      }`}
                  >
                    <p className="self-center h-full font-semibold">
                      {" "}
                      {selectedItem?.status}{" "}
                    </p>
                  </div>
                </div>
              </div>

              {isEditing ? (
                <>
                  {/* Date */}
                  <div className="pt-2 flex w-full flex-col float-right">
                    <div
                      htmlFor="createdAt"
                      className="text-base font-medium float-right"
                    >
                      Date
                    </div>
                    <div>
                      <Controller
                        control={control}
                        name="createdAt"
                        render={({ field }) => (
                          <ReactDatePicker
                            className="rounded-md relative w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            dateFormat="yyyy-MM-dd"
                            onChange={(date) => field.onChange(date)}
                            selected={field.value}
                            open={startDateOpen}
                            onClick={() => setStartDateOpen(!startDateOpen)}
                            onFocus={() => setStartDateOpen(true)}
                            onBlur={() => setStartDateOpen(false)}
                          />
                        )}
                      />
                    </div>
                  </div>
                  {/* PubMed Keywords */}
                  <div className="pt-4 flex w-full flex-col mb-4">
                    <div
                      htmlFor="keywords"
                      className="text-base font-medium float-right"
                    >
                      PubMed Keywords
                    </div>
                    <div>
                      <Controller
                        control={control}
                        name="pubmedKeywords"
                        render={({ field }) => (
                          <input
                            {...field}
                            required
                            type="text"
                            className="rounded-md relative w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          />
                        )}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <p className="mr-5">
                  <span className="font-medium">Added:</span>{" "}
                  {selectedItem?.createdAt
                    ? formatShortDate(selectedItem.createdAt)
                    : ""}
                </p>
              )}
              {isEditing ? (
                <div className="flex w-full flex-col float-right mb-4">
                  <div
                    htmlFor="title"
                    className="text-base font-medium float-right"
                  >
                    Description
                  </div>
                  <div>
                    <Controller
                      control={control}
                      name="description"
                      render={({ field }) => (
                        <textarea
                          rows="5"
                          {...field}
                          type="text"
                          className="rounded-md relative w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      )}
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <span className="font-medium">Description:</span>{" "}
                  <span className="text-sm">{selectedItem?.description}</span>
                </div>
              )}
              {isEditing ? (
                <>
                  <div className="pt-2 w-full">
                    <label htmlFor="name" className="text-base font-medium">
                      Notes
                    </label>
                    <div className="w-full mx-auto">
                      <Controller
                        name="notes"
                        control={control}
                        render={({ field }) => (
                          <textarea
                            rows="8"
                            {...field}
                            type="text"
                            autoComplete="off"
                            className="rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          />
                        )}
                      />
                    </div>
                    <div className="pt-2">
                      {errors.panels && (
                        <p className="text-red-500 text-xs italic">
                          {errors.panels.message}
                        </p>
                      )}
                    </div>
                  </div>
                  <div>
                    <button
                      type="submit"
                      className="mt-2 group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Submit
                    </button>
                  </div>
                </>
              ) : (
                <div>
                  <div className="overflow-x-auto pt-2">
                    <span className="font-medium">Notes:</span>{" "}
                    <ReactMarkdown className="text-sm line-clamp-6 overflow-auto">
                      {selectedItem?.notes}
                    </ReactMarkdown>
                  </div>
                </div>
              )}
              {highlightedAttachments && (
                <div className="grid grid-cols-5 gap-2 mt-4">
                  {highlightedAttachments.slice(0, 5).map((attachment) => (
                    <div className="">
                      {" "}
                      <div onClick={() => openModal(attachment)}>
                        <div className="text-white bg-slate-600 h-12 flex flex-row text-xs p-2 border rounded-sm self-center  border-slate-600 w-full text-center">
                          <div className="justify-center w-full line-clamp-2 overflow-auto self-center">
                            {attachment.title}
                            <div
                              className="absolute hidden mb-2 group-hover:block ml-2 text-left w-80 
                         text-slate-800 text-sm p-3 flex-wrap bg-white border border-slate-100 rounded-sm shadow-md
                        whitespace-normal z-50
                        overflow-hidden"
                            >
                              <div className="flex flex-row gap-1">
                                <div>Date: {formatDate(attachment.startDate)}</div>
                              </div>

                              {attachment.institutions && (
                                <div className="line-clamp-3 overflow-auto normal-case">
                                  <strong> Institution:</strong>{" "}
                                  {attachment.institutions
                                    .map((institution) => institution.institutionName)
                                    .join(", ")}
                                </div>
                              )}

                              {attachment.notes && (
                                <div className="line-clamp-3 overflow-auto normal-case">
                                  <strong> Notes:</strong> {attachment.notes}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="justify-end">
                            <ArrowUpRightIcon className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </form>
          {!isEditing ? (
            <>
              <div className="flex flex-row">
                {/* Imaging Links */}
                {imageLinks && (
                  <div className="mt-7 w-full pl-4 pr-4">
                    <div className="font-semibold text-xl mt-5 flex justify-between items-center cursor-pointer ">
                      <p className="text-lg">
                        Images{" "}
                        <span className="text-slate-500 text-base">
                          ({imageLinks?.length})
                        </span>
                      </p>
                      <span>
                        {imageLinks.length > 0 ? (
                          isImageLinksOpen ? (
                            <ChevronUpIcon
                              className="h-6 w-6 text-black"
                              onClick={() =>
                                setIsImageLinksOpen(!isImageLinksOpen)
                              }
                            />
                          ) : (
                            <ChevronDownIcon
                              className="h-6 w-6 text-black"
                              onClick={() =>
                                setIsImageLinksOpen(!isImageLinksOpen)
                              }
                            />
                          )
                        ) : (
                          isAdmin && (
                            <PlusCircleIcon
                              className="h-6 w-6 text-blue-600"
                              onClick={handleOpenModal("image")}
                            />
                          )
                        )}
                      </span>
                    </div>

                    {isImageLinksOpen && (
                      <div className=" w-full">
                        <div className=" w-full flex flex-col">
                          {isAdmin && (
                            <div className="w-full flex justify-end mb-2">
                              <button
                                className="mt-2 group relative py-2 px-4 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                onClick={handleOpenModal("image")}
                              >
                                Add Image
                              </button>
                            </div>
                          )}
                          <div className={`${!isAdmin ? "mt-2" : ""}`}>
                            <AttachmentsTable
                              referenceId={selectedItem.id}
                              attachments={imageLinks}
                              version="researchLink"
                              modal={false}
                              modalType="image"
                              isAdmin={isAdmin}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="flex flex-row">
                {/* Supporting Links */}
                {supportingLinks && (
                  <div className="mt-7 w-full pl-4 pr-4">
                    <div className="font-semibold text-xl flex justify-between items-center cursor-pointer ">
                      <p className="text-lg">
                        Supporting{" "}
                        <span className="text-slate-500 text-base">
                          ({supportingLinks?.length})
                        </span>
                      </p>
                      <span>
                        {supportingLinks.length > 0 ? (
                          isSupportingLinksOpen ? (
                            <ChevronUpIcon
                              className="h-6 w-6 text-black"
                              onClick={() =>
                                setIsSupportingLinksOpen(!isSupportingLinksOpen)
                              }
                            />
                          ) : (
                            <ChevronDownIcon
                              className="h-6 w-6 text-black"
                              onClick={() =>
                                setIsSupportingLinksOpen(!isSupportingLinksOpen)
                              }
                            />
                          )
                        ) : (
                          isAdmin && (
                            <PlusCircleIcon
                              className="h-6 w-6 text-blue-600"
                              onClick={handleOpenModal("link")}
                            />
                          )
                        )}
                      </span>
                    </div>

                    {isSupportingLinksOpen && (
                      <div className=" w-full">
                        <div className=" w-full flex flex-col">
                          {isAdmin && (
                            <div className="w-full flex justify-end mb-2">
                              <button
                                className="mt-2 group relative py-2 px-4 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                onClick={handleOpenModal("link")}
                              >
                                Add Link
                              </button>
                            </div>
                          )}
                          <div className={`${!isAdmin ? "mt-2" : ""}`}>
                            <AttachmentsTable
                              referenceId={selectedItem.id}
                              attachments={supportingLinks}
                              version="researchLink"
                              modal={false}
                              isAdmin={isAdmin}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex flex-row">
                {/* Opposing Links */}
                {opposingLinks && (
                  <div className="w-full pl-4 pr-4 mt-6">
                    <div
                      className={`font-semibold text-xl flex justify-between items-center cursor-pointer`}
                    >
                      <div className="text-lg flex flex-row self-center">
                        Refuting
                        <span className="text-slate-500 text-base pl-2 pr-2">
                          ({opposingLinks?.length})
                        </span>
                      </div>
                      <span>
                        {opposingLinks.length > 0 ? (
                          isOpposingLinksOpen ? (
                            <ChevronUpIcon
                              className="h-6 w-6 text-black"
                              onClick={() =>
                                setIsOpposingLinksOpen(!isOpposingLinksOpen)
                              }
                            />
                          ) : (
                            <ChevronDownIcon
                              className="h-6 w-6 text-black"
                              onClick={() =>
                                setIsOpposingLinksOpen(!isOpposingLinksOpen)
                              }
                            />
                          )
                        ) : (
                          isAdmin && (
                            <PlusCircleIcon
                              className="h-6 w-6 text-blue-600"
                              onClick={handleOpenModal("link")}
                            />
                          )
                        )}
                      </span>
                    </div>

                    {isOpposingLinksOpen && (
                      <div className="pb-5 w-full">
                        <div className=" w-full flex flex-col">
                          {isAdmin && (
                            <div className="w-full flex justify-end mb-2">
                              <button
                                className="mt-2 group relative py-2 px-4 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                onClick={handleOpenModal("link")}
                              >
                                Add Link
                              </button>
                            </div>
                          )}

                          <div className={`${!isAdmin ? "mt-2" : ""}`}>
                            <AttachmentsTable
                              referenceId={selectedItem.id}
                              attachments={opposingLinks}
                              version="researchLink"
                              modal={false}
                              isAdmin={isAdmin}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="flex flex-row">
                {/* Research Notations */}

                {selectedItem?.researchNotations && (
                  <div className="w-full pl-4 pr-4 mt-6">
                    <div
                      className="font-semibold text-xl flex justify-between items-center cursor-pointer "
                      onClick={() =>
                        setIsResearchNotationsOpen(!isResearchNotationsOpen)
                      }
                    >
                      <div className="font-semibold text-lg">
                        Comments / Notes{" "}
                        <span className="text-slate-500 text-base">
                          ({selectedItem?.researchNotations?.length})
                        </span>
                      </div>
                      <span>
                        {selectedItem.researchNotations.length > 0 ? (
                          isResearchNotationsOpen ? (
                            <ChevronUpIcon
                              className="h-6 w-6 text-black"
                              onClick={() =>
                                setIsResearchNotationsOpen(
                                  !isResearchNotationsOpen
                                )
                              }
                            />
                          ) : (
                            <ChevronDownIcon
                              className="h-6 w-6 text-black"
                              onClick={() =>
                                setIsResearchNotationsOpen(
                                  !isResearchNotationsOpen
                                )
                              }
                            />
                          )
                        ) : (
                          isAdmin && (
                            <PlusCircleIcon
                              className="h-6 w-6 text-blue-600"
                              onClick={handleOpenModal("researchNotation")}
                            />
                          )
                        )}
                      </span>
                    </div>
                    {isResearchNotationsOpen && (
                      <div className="grid grid-cols-1 mt-4 w-full max-h-[800px] overflow-auto">
                        {isAdmin && (
                          <div className="w-full flex justify-end mb-2">
                            <button
                              className="mb-1 group relative py-2 px-4 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                              onClick={handleOpenModal("researchNotation")}
                            >
                              Add Comment
                            </button>
                          </div>
                        )}

                        {sortedComments?.map(
                          (notation, index) => (
                            <div
                              className={`mx-auto bg-slate-50 border border-gray-200 rounded p-4 w-full pr-6  mb-6 ${notation.status === "resolved" ? "opacity-30" : ""}`}
                              key={index}
                            >
                              <div className="flex flex-row justify-between w-full">
                                <div className="flex flex-row justify-between ">
                                  <div className="mr-5">
                                    <span className="font-medium">Added:</span>{" "}
                                    {formatShortDate(notation.createdAt)}
                                  </div>
                                </div>
                                <div className=" float-right">
                                  <div className="p-2 rounded font-medium text-sm capitalize bg-blue-100">
                                    {" "}
                                    <div className="text-center">
                                      {notation.category}
                                    </div>
                                  </div>
                                  <div className="uppercase text-xxs text-center font-bold">
                                    {notation.status}
                                  </div>
                                </div>
                              </div>

                              <div className="mb-4">
                                <div className="font-bold text-xl flex flex-row">
                                  {notation.title}{" "}
                                  {isAdmin && (
                                    <div className=" text-blue-600 ml-2 self-center">
                                      <PencilSquareIcon
                                        className="h-4 w-4"
                                        onClick={handleEditComment(notation)}
                                      />
                                    </div>
                                  )}
                                </div>
                                <div className="text-xs text-gray-600">
                                  {notation.description}
                                </div>
                              </div>
                              <div className="mt-2">
                                <span className="font-medium">Notes:</span>{" "}
                                <ReactMarkdown className="text-sm  overflow-auto">
                                  {notation.notes}
                                </ReactMarkdown>
                              </div>

                              <div className="text-xs w-full text-right mt-2 text-blue-900 cursor-pointer" onClick={() => toggleComments(notation.id)}>
                                Comments ({notation.threads.length})
                              </div>
                              {commentsVisible.get(notation.id) && notation.threads.length > 0 && (
                                <div className="mt-2 bg-blue-50 p-2 rounded">
                                  {notation.threads.map((thread, threadIndex) => (
                                    <div key={threadIndex} className="mb-2 text-sm">
                                      <div className="w-full justify-between flex flex-row">
                                        <div className="text-xxs">User: {thread.userFirstName + " " + thread.userLastName}</div>
                                        <div className="text-xxs">{formatShortDate(thread.createdAt)}</div>
                                      </div>
                                      <ReactMarkdown>
                                        {thread.comment}
                                      </ReactMarkdown>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex flex-row">
                {filteredArticles &&
                  selectedItem?.pubmedKeywords?.length > 0 && (
                    <div className="w-full">
                      <div
                        className="font-semibold text-xl mt-2 flex justify-between items-center cursor-pointer p-4"
                        onClick={() => setIsArticlesOpen(!isArticlesOpen)}
                      >
                        <div className="font-semibold text-lg flex flex-row">
                          PubMed Articles{" "}
                          {!filteredArticles || filteredArticles?.length < 1 ? (
                            <div className="self-center">
                              <Spinner />
                            </div>
                          ) : (
                            <span className="text-slate-500 text-base self-center ml-1">
                              ({filteredArticles?.length})
                            </span>
                          )}
                        </div>
                        <span>
                          {isArticlesOpen ? (
                            <ChevronUpIcon className="h-6 w-6 text-black" />
                          ) : (
                            <ChevronDownIcon className="h-6 w-6 text-black" />
                          )}
                        </span>{" "}
                      </div>
                      {isArticlesOpen && (
                        <div className="w-full">
                          <div>
                            {" "}
                            <PubMedArticles articles={filteredArticles} />
                          </div>

                          <a
                            href={pubMedUrl}
                            target="_blank"
                            className="float-right text-right w-ful p-2 mt-2 text-sm text-blue-700 font-semibold"
                          >
                            View all results on PubMed
                          </a>
                        </div>
                      )}
                    </div>
                  )}
              </div>
            </>
          ) : null}
        </div>
      </div >
    </div >
  );
};

export default ResearchInterest;
