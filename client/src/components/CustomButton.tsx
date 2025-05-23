import React, { useState } from "react";

interface CustomButtonProps {
  btnType: "button" | "submit" | "reset";
  title: string;
  handleClick?: () => void;
  styles?: string;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  btnType,
  title,
  handleClick,
  styles = "",
}) => (
  <button
    type={btnType}
    className={`font-epilogue font-semibold text-[16px] leading-[26px]
                text-white min-h-[52px] px-4 rounded-[100px] ${styles}`}
    onClick={handleClick}
  >
    {title}
  </button>
);

export default CustomButton;
