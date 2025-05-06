import React, { useState, ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import money from "../assets/money.svg";
import { useStateContext } from "../context";
import CustomButton from "../components/CustomButton";
import Loader from "../components/Loader";
import FormField from "../components/FormField";
import { checkIfImage } from "../utils";

interface FormState {
  name: string;
  title: string;
  description: string;
  target: string;
  deadline: string;
  image: string;
}

const CreateCampaign: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { createCampaign } = useStateContext();
  const [form, setForm] = useState<FormState>({
    name: "",
    title: "",
    description: "",
    target: "",
    deadline: "",
    image: "",
  });

  const handleFormFieldChange = (
    fieldName: keyof FormState,
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [fieldName]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const amount = parseFloat(form.target);
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a target greater than 0 ETH.");
      return;
    }
    const targetWei = ethers.utils.parseEther(form.target);

    const deadlineMs = new Date(form.deadline).getTime();
    if (isNaN(deadlineMs)) {
      alert("Please pick a valid date.");
      return;
    }
    const deadlineSec = Math.floor(deadlineMs / 1000);

    checkIfImage(form.image, async (exists) => {
      if (!exists) {
        alert("Please enter a valid image URL.");
        setForm((prev) => ({ ...prev, image: "" }));
        return;
      }

      setIsLoading(true);
      try {
        await createCampaign({
          title: form.title,
          description: form.description,
          target: targetWei,
          deadline: deadlineSec,
          image: form.image,
        });
        navigate("/");
      } catch (error) {
        console.error("Campaign creation failed:", error);
        alert("Failed to create campaign. See console for details.");
      } finally {
        setIsLoading(false);
      }
    });
  };

  return (
    <div className="bg-[#1c1c24] flex justify-center items-center flex-col rounded-[10px] sm:p-10 p-4">
      {isLoading && <Loader />}
      <div className="flex justify-center items-center p-[16px] sm:min-w-[380px] bg-[#3a3a43] rounded-[10px]">
        <h1 className="font-epilogue font-bold sm:text-[25px] text-[18px] text-white">
          Start a Campaign
        </h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="w-full mt-[65px] flex flex-col gap-[30px]"
      >
        <div className="flex flex-wrap gap-[40px]">
          <FormField
            labelName="Your Name *"
            placeholder="Enter your Name"
            inputType="text"
            value={form.name}
            handleChange={(e) => handleFormFieldChange("name", e)}
          />
          <FormField
            labelName="Campaign Title *"
            placeholder="Write a Title"
            inputType="text"
            value={form.title}
            handleChange={(e) => handleFormFieldChange("title", e)}
          />
        </div>

        <FormField
          labelName="Story *"
          placeholder="Write your Story"
          isTextArea
          value={form.description}
          handleChange={(e) => handleFormFieldChange("description", e)}
        />

        <div className="w-full flex items-center p-4 bg-[#8c6dfd] h-[120px] rounded-[10px]">
          <img src={money} alt="money" className="w-[40px] h-[40px]" />
          <h4 className="font-epilogue font-bold text-white ml-[20px]">
            You will get 100% of the raised amount
          </h4>
        </div>

        <div className="flex flex-wrap gap-[40px]">
          <FormField
            labelName="Goal (ETH) *"
            placeholder="0.50"
            inputType="number"
            value={form.target}
            handleChange={(e) => handleFormFieldChange("target", e)}
          />
          <FormField
            labelName="End Date *"
            placeholder=""
            inputType="date"
            value={form.deadline}
            handleChange={(e) => handleFormFieldChange("deadline", e)}
          />
        </div>

        <FormField
          labelName="Campaign Image URL *"
          placeholder="https://..."
          inputType="url"
          value={form.image}
          handleChange={(e) => handleFormFieldChange("image", e)}
        />

        <div className="flex justify-center mt-[40px]">
          <CustomButton
            btnType="submit"
            title="Submit New Campaign"
            styles="bg-[#1dc071]"
          />
        </div>
      </form>
    </div>
  );
};

export default CreateCampaign;
