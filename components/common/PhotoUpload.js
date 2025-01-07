import React, { useState } from "react";
import axios from "axios";
import { uploadPhotoPOST } from "@/hooks/api";

function ProfileImageUpload({ currentImage, session, name, setValue, type }) {
  const [image, setImage] = useState(
    currentImage || type === "provider"
      ? "/img/emptyProfilePhoto.png"
      : "/img/emptyInstitution.png"
  );

  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("image", file);
      uploadPhotoPOST(formData, session).then((data) => {
        setImage(data.url);
        setValue(name, data.url);
      });
    }
  };

  return (
    <div className="profile-image-container mx-auto mb-10">
      <img
        src={image}
        alt="Profile"
        className="profile-image w-34 h-32 rounded-sm"
      />
      <button className="overlay w-full">
        <label className="mt-4 center flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          Change Photo
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{ display: "none" }}
          />
        </label>
      </button>
    </div>
  );
}

export default ProfileImageUpload;
