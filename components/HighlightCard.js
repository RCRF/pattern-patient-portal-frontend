import { Fragment, React, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import TypeCard from "./TypeCard";
import Modal from "./Modal";

export default function HighlightCard({ firstLine, secondLine, thirdLine }) {
  return (
    <div className="flex flex-col justify-center items-center  p-4 h-40 min-w-min bg-blue-100 border borderrounded-sm ">
      <div className="text-sm uppercase tracking-widest mb-1 text-center">
        {firstLine}
      </div>
      <div className="text-4xl font-bold text-center">{secondLine}</div>
      <div className="text-sm uppercase tracking-widest mt-1 text-center">
        {thirdLine}
      </div>
    </div>
  );
}
