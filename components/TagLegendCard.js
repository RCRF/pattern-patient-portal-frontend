import { React } from "react";

const style = {
  fresh_tissue: "p-3 ml-2 mr-2 bg-green-50",
  fixed_tissue: "p-3 ml-2 mr-2 bg-blue-50",
  trials: "p-3 ml-2 mr-2 bg-red-50",
  immunotherapy: "p-3 ml-2 mr-2 bg-blue-50",
  tki: "p-3 ml-2 mr-2 bg-red-50",
  mtor: "p-3 ml-2 mr-2 bg-green-50",
  chemotherapy: "p-3 ml-2 mr-2 bg-indigo-50",
  oncology: "p-3 ml-2 mr-2 bg-blue-50",
  surgery: "p-3 ml-2 mr-2 bg-indigo-50",
  physician_scientist: "p-3 ml-2 mr-2 bg-red-50",
  research: "p-3 ml-2 mr-2 bg-green-50",
};

export default function TagLegendCard({ tags, tagType }) {
  return (
    <div>
      <h1 className="text-2xl w-full mb-4 pl-2 font-medium">{tagType}</h1>
      <div className="grid sm:grid-cols-1 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 w-full gap-4 grid-row-[fr1]">
        {tags?.map((tag, index) => (
          <div className={style[tag.value]}>
            {" "}
            <div className="text-sm tracking-widest mb-1 text-left font-bold">
              {tag.title}
            </div>
            <div>
              <p className="text-xs w-full">{tag.firstLine}</p>
              <p className="text-xs mt-2">{tag.secondLine}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
