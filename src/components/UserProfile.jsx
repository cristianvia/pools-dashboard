import React from "react";
import { MdOutlineCancel } from "react-icons/md";

import { Button } from ".";
import { userProfileData } from "../data/dummy";
import { useStateContext } from "../contexts/ContextProvider";
import avatar from "../data/avatar.jpg";

const UserProfile = () => {
  const { currentColor } = useStateContext();
  let metamaskAddress = sessionStorage.getItem("metamaskAddress");

  const logout = () => {
    sessionStorage.removeItem("metamaskAddress");
    window.location.reload();
  };

  return (
    <div className="nav-item absolute right-1 top-16 bg-white dark:bg-[#42464D] p-8 rounded-lg w-96">
      <div className="flex justify-between items-center">
        <p className="font-semibold text-lg dark:text-gray-200">
          Perfil de usuario
        </p>
        <Button
          icon={<MdOutlineCancel />}
          color="rgb(153, 171, 180)"
          bgHoverColor="light-gray"
          size="2xl"
          borderRadius="50%"
        />
      </div>
      <div className="flex gap-5 items-center mt-6 border-color border-b-1 pb-6">
        <div>
          <p className="font-semibold text-xs dark:text-gray-200">
            {metamaskAddress ? metamaskAddress : ""}
          </p>
        </div>
      </div>
      <div className="mt-5">
        {metamaskAddress ? (
          <button
            onClick={logout}
            style={{
              color: "white",
              bgColor: { currentColor },
              borderRadius: "10px",
              width: "full",
            }}
          >
            Desconectar
          </button>
        ) : (
          ""
        )}
      </div>
    </div>
  );
};

export default UserProfile;
