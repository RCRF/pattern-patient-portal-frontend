import axios from "axios";
import { parse } from "path";
import React from "react";

export function calculateAge(dateOfBirth) {
  const dob = new Date(dateOfBirth);
  const currentDate = new Date();

  let age = currentDate.getFullYear() - dob.getFullYear();

  const hasBirthdayOccurred =
    currentDate.getMonth() > dob.getMonth() ||
    (currentDate.getMonth() === dob.getMonth() &&
      currentDate.getDate() >= dob.getDate());

  if (!hasBirthdayOccurred) {
    age--;
  }

  return age;
}

export function formatConfidenceInterval(interval) {
  const [lower, upper] = interval.split(",");
  return `[${lower}; ${upper}]`;
}

export const getCoordinates = async (address) => {
  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        address
      )}&key=${process.env.NEXT_PUBLIC_GOOGLE_API_KEY}`
    );
    const results = response.data.results;
    if (results && results.length > 0) {
      const { lat, lng } = results[0].geometry.location;
      return { latitude: lat, longitude: lng };
    }
  } catch (error) { }

  return null;
};

export function addLineBreaks(text) {
  const lines = text.split("/n");
  return lines.map((line, index) => (
    <React.Fragment key={index}>
      {line}
      {index !== lines.length - 1 && <br />}
    </React.Fragment>
  ));
}

export function getFormattedStage(number) {
  switch (number) {
    case 1:
      return "I";
    case 2:
      return "II";
    case 3:
      return "III";
    case 4:
      return "IV";
    default:
      return "N/A";
  }
}

export function getReadableName(str) {
  return str
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function formatDate(dateString) {
  //if not a valid date string just return
  if (!dateString) return dateString;
  const [year, month, day] = dateString.split("-");
  return `${month}/${day}/${year}`;
}

export function formatShortDate(dateString) {
  //if not a valid date string just return
  if (!dateString) return dateString;
  const [year, month, day] = dateString.split("-");
  return `${parseInt(month)}/${parseInt(day)}/${parseInt(year.slice(2))}`;
}

export function listWithCommas(arrayOfItems) {
  return arrayOfItems.reduce((acc, item, index, array) => {
    acc += item;
    if (index !== array.length - 1) {
      acc += ", ";
    }
    return acc;
  }, "");
}

export const sortMostRecentToOldestDate = (array) =>
  array.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));

export const sortByListOrderAndStatus = (data) => {
  return data.sort((a, b) => {
    if (a.status === "active" && b.status !== "active") {
      return -1; // a is active, b is not, a comes first
    } else if (a.status !== "active" && b.status === "active") {
      return 1; // b is active, a is not, b comes first
    }

    if (a.listOrder !== null && b.listOrder !== null) {
      return a.listOrder - b.listOrder;
    } else if (a.listOrder === null && b.listOrder !== null) {
      return 1; // a should come after b
    } else if (a.listOrder !== null && b.listOrder === null) {
      return -1; // a should come before b
    }

    let dateA = new Date(a.startDate);
    let dateB = new Date(b.startDate);
    return dateA - dateB;
  });
};

export const sortByDateDesc = (data) => {
  return data.sort((a, b) => {
    let older = new Date(a.startDate);
    let newer = new Date(b.startDate);
    return newer - older;
  });
};

//sort by date then by panel alphebetically  within each date
export const sortByDateAndPanel = (data) => {
  return data.sort((a, b) => {
    let dateA = new Date(a.startDate);
    let dateB = new Date(b.startDate);

    if (dateA > dateB) return -1;
    if (dateA < dateB) return 1;

    return a.panel.localeCompare(b.panel);
  });
};

export const sortByListOrderAndDate = (data) => {
  return data.sort((a, b) => {
    if (a.listOrder !== null && b.listOrder !== null) {
      return a.listOrder - b.listOrder;
    } else if (a.listOrder === null && b.listOrder !== null) {
      return 1;
    } else if (a.listOrder !== null && b.listOrder === null) {
      return -1;
    }
    const dateA = new Date(a.startDate);
    const dateB = new Date(b.startDate);
    return dateB - dateA;
  });
};

export const sortDataByDate = (data) => {
  return data.sort((a, b) => {
    const dateA = new Date(a.dateAdded);
    const dateB = new Date(b.dateAdded);
    return dateB - dateA;
  });
};

export const researchCategories = [
  { id: 1, title: "environmental" },
  { id: 4, title: "association" },
  { id: 2, title: "genetic" },
  { id: 3, title: "lifestyle" },
  { id: 4, title: "treatment" },
  { id: 5, title: "other" },
];

export const statuses = [
  { id: 1, title: "not started" },
  { id: 2, title: "investigating" },
  { id: 3, title: "in progress" },
  { id: 4, title: "completed" },
  { id: 5, title: "published" },
  { id: 6, title: "disproven" },
];

export const linkColumns = [
  {
    header: "Title",
    key: "title",
  },

  {
    header: "Category",
    key: "category",
  },
  {
    header: "Description",
    key: "description",
  },
  {
    header: "Notes",
    key: "notes",
  },
  {
    header: "Link",
    key: "link",
  },
];

export function filterItemsToDuringPlusInterval(
  items,
  referenceItem,
  interval
) {
  //make sure there is a start date otherwise just return
  if (!referenceItem?.startDate) return items;
  return items.filter((item) => {
    const itemStartDate = new Date(item.startDate);
    const itemEndDate = item.endDate ? new Date(item.endDate) : itemStartDate;
    const referenceStartDate = new Date(referenceItem?.startDate);
    const referenceEndDate = referenceItem.endDate
      ? new Date(referenceItem.endDate)
      : referenceStartDate;

    const intervalAfterItemEnd = new Date(itemEndDate);
    intervalAfterItemEnd.setDate(itemEndDate.getDate() + interval);

    return (
      // Condition 1: Check if referenceItem is between item's start and end dates
      (referenceStartDate >= itemStartDate &&
        referenceStartDate <= itemEndDate) ||
      (referenceEndDate >= itemStartDate && referenceEndDate <= itemEndDate) ||
      // Condition 2: Check if referenceItem is within interval days after item's end date
      (referenceStartDate >= itemEndDate &&
        referenceStartDate <= intervalAfterItemEnd) ||
      (referenceEndDate >= itemEndDate &&
        referenceEndDate <= intervalAfterItemEnd)
    );
  });
}

export function filterItemsToDuringPlusIntervalBeforeAndAfter(
  items,
  referenceItem,
  beforeInterval,
  afterInterval
) {
  return items.filter((item) => {
    if (!item.startDate || !referenceItem) return false;
    const itemDate = new Date(item.startDate);
    const selectItemStartDate = new Date(referenceItem.startDate);
    const selectedItemEndDate = referenceItem.endDate
      ? new Date(referenceItem.endDate)
      : new Date(referenceItem.startDate);
    const IntervalAfterDate = new Date(selectedItemEndDate);
    IntervalAfterDate.setDate(selectedItemEndDate.getDate() + afterInterval);
    const intervalBefore = new Date(selectItemStartDate);
    intervalBefore.setDate(selectItemStartDate.getDate() - beforeInterval);

    return itemDate >= intervalBefore && itemDate <= IntervalAfterDate;
  });
}

export function convertToTimeZone(timestamp, timeZone) {
  const timeZones = {
    eastern: "America/New_York",
    central: "America/Chicago",
  };

  const date = new Date(timestamp);
  if (isNaN(date)) {
    return "Invalid date";
  }

  const options = {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: timeZones[timeZone.toLowerCase()],
  };

  return new Intl.DateTimeFormat("en-US", options).format(date);
}

export const colorLookup = {
  "red": "bg-red-400 opacity-60",
  "blue": "bg-blue-500 opacity-50",
  "indigo": "bg-indigo-500 text-slate-900 opacity-60",
  "green": "bg-green-500 opacity-60",
  "purple": "bg-purple-500 opacity-50",
  "pink": "bg-pink-500 opacity-50",
  "gray": "bg-gray-600 opacity-50",
};

export function calculateDaysBetweenDates(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const difference = end - start;
  const days = difference / (1000 * 60 * 60 * 24);
  return Math.abs(days);
}

export function capitalizeWords(str) {
  if (!str) return '';
  return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
}

export function capitalizeFirstLetterOfWords(str) {
  if (!str) return '';
  return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

export function transformForSelect(items) {
  return items.map(item => ({
    label: item.title,
    value: item,
  }));
}

export const organs = [
  { label: 'Brain', value: 'brain' },
  { label: 'Lung', value: 'lung' },
  { label: 'Heart', value: 'heart' },
  { label: 'Liver', value: 'liver' },
  { label: 'Kidney', value: 'kidney' },
  { label: 'Stomach', value: 'stomach' },
  { label: 'Intestines', value: 'intestines' },
  { label: 'Bladder', value: 'bladder' },
  { label: 'Reproductive Organs', value: 'reproductive organs' },
  { label: 'Bones', value: 'bones' },
  { label: 'Joints', value: 'joints' },
  { label: 'Muscles', value: 'muscles' },
  { label: 'Skin', value: 'skin' },
  { label: 'Blood Vessels', value: 'blood vessels' },
  { label: 'Lymph Nodes', value: 'lymph nodes' },
  { label: 'Breast', value: 'breast' },
  { label: 'Appendix', value: 'appendix' },
  { label: 'Thyroid', value: 'thyroid' },
  { label: 'Pancreas', value: 'pancreas' },
  { label: 'Adrenal Glands', value: 'adrenal glands' },
  { label: 'Pituitary Gland', value: 'pituitary gland' },
  { label: 'Parathyroid Glands', value: 'parathyroid glands' },
  { label: 'Thymus', value: 'thymus' },
  { label: 'Spine', value: 'spine' },
  { label: 'Shoulder', value: 'shoulder' },
  { label: 'Elbow', value: 'elbow' },
  { label: 'Wrist', value: 'wrist' },
  { label: 'Hand', value: 'hand' },
  { label: 'Hip', value: 'hip' },
  { label: 'Knee', value: 'knee' },
  { label: 'Ankle', value: 'ankle' },
  { label: 'Foot', value: 'foot' },
  { label: 'Neck', value: 'neck' },
  { label: 'Throat', value: 'throat' },
  { label: 'Spleen', value: 'spleen' },
  { label: 'Prostate', value: 'prostate' },
  { label: 'Testes', value: 'testes' },
  { label: 'Ovaries', value: 'pvaries' },
  { label: 'Uterus', value: 'uterus' },
  { label: 'Cervix', value: 'cervix' },
  { label: 'Eye', value: 'eye' },
  { label: 'Ear', value: 'ear' },
  { label: 'Nose', value: 'nose' },
  { label: 'Mouth', value: 'mouth' },
  { label: 'Throat', value: 'throat' },
  { label: 'Tongue', value: 'tongue' },
  { label: 'Teeth', value: 'teeth' },
  { label: 'Gums', value: 'gums' },
  { label: 'Salivary Glands', value: 'salivary glands' },
  { label: 'Larynx', value: 'larynx' },
  { label: 'Trachea', value: 'trachea' },
  { label: 'Bronchi', value: 'bronchi' },
  { label: 'Lungs', value: 'lungs' },
  { label: 'Diaphragm', value: 'diaphragm' },
  { label: 'Esophagus', value: 'esophagus' },
  { label: 'Stomach', value: 'stomach' },
  { label: 'Liver', value: 'liver' },
  { label: 'Gallbladder', value: 'gallbladder' },
  { label: 'Pancreas', value: 'pancreas' },
  { label: 'Small Intestine', value: 'small intestine' },
  { label: 'Large Intestine', value: 'large intestine' },
  { label: 'Rectum', value: 'rectum' },
  { label: 'Anus', value: 'anus' },
  { label: 'Ureters', value: 'ureters' },
  { label: 'Urethra', value: 'urethra' },
  { label: 'Other', value: 'other' },
]

