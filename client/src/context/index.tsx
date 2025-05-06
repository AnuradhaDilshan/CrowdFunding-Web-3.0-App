import React, { useContext, createContext, ReactNode } from "react";
import {
  useAddress,
  useContract,
  useContractWrite,
  metamaskWallet,
  useConnect,
} from "@thirdweb-dev/react";
import { ethers } from "ethers";

interface CampaignFormData {
  title: string;
  description: string;
  target: string | ethers.BigNumber;
  deadline: string | number;
  image: string;
}

interface StateContextType {
  address?: string;
  contract?: any;
  connect: () => Promise<void>;
  createCampaign: (form: CampaignFormData) => Promise<void>;
  getCampaigns: () => Promise<any[]>;
  getUserCampaigns: () => Promise<any[]>;
  donate: (pId: number, amount: string) => Promise<any>;
  getDonations: (
    pId: number
  ) => Promise<{ donator: string; donation: string }[]>;
}

const StateContext = createContext<StateContextType>({
  connect: async () => {},
  createCampaign: async () => {},
  getCampaigns: async () => [],
  getUserCampaigns: async () => [],
  donate: async () => ({}),
  getDonations: async () => [],
});

export const StateContextProvider = ({ children }: { children: ReactNode }) => {
  const address = useAddress();
  const connectWallet = useConnect();
  const metamask = metamaskWallet();

  const { contract } = useContract(
    "0x3fB4819cDD5F3285690DD33B57F0fdB6BBba0edE"
  );

  // Write hook for creating campaigns
  const { mutateAsync: writeCreateCampaign } = useContractWrite(
    contract,
    "createCampaign"
  );

  // Write hook for donations
  const { mutateAsync: writeDonate } = useContractWrite(
    contract,
    "donateToCampaign"
  );

  const connect = async () => {
    try {
      await connectWallet(metamask);
    } catch (error) {
      console.error("Wallet connection failed:", error);
    }
  };

  const createCampaign = async (form: CampaignFormData) => {
    try {
      const data = await writeCreateCampaign({
        args: [
          address, // owner
          form.title,
          form.description,
          form.target,
          form.deadline,
          form.image,
        ],
      });
      console.log("Campaign created successfully:", data);
    } catch (error) {
      console.error("Error creating campaign:", error);
    }
  };

  const getCampaigns = async () => {
    try {
      if (!contract) throw new Error("Contract not initialized");
      const campaigns = await contract.call("getCampaigns");
      const parsedCampaigns = campaigns.map((campaign: any, i: any) => ({
        owner: campaign.owner,
        title: campaign.title,
        description: campaign.description,
        target: ethers.utils.formatEther(campaign.target.toString()),
        deadline: campaign.deadline.toNumber(),
        amountCollected: ethers.utils.formatEther(
          campaign.amountCollected.toString()
        ),
        image: campaign.image,
        pId: i,
      }));
      return parsedCampaigns;
    } catch (error) {
      console.error("Error fetching campaigns:", error);
    }
  };

  const getUserCampaigns = async () => {
    try {
      const allCampaigns = await getCampaigns();
      const filteredCampaigns = allCampaigns.filter(
        (campaign: any) => campaign.owner === address
      );
      return filteredCampaigns;
    } catch (error) {
      console.error("Error fetching user campaigns:", error);
    }
  };

  const donate = async (pId: number, amount: string) => {
    try {
      if (!contract) throw new Error("Contract not initialized");
      const value = ethers.utils.parseEther(amount);
      const tx = await writeDonate({
        args: [pId],
        overrides: { value },
      });
      return { receipt: tx };
    } catch (error) {
      console.error("Error donating to campaign:", error);
    }
  };

  const getDonations = async (pId: number) => {
    try {
      if (!contract) throw new Error("Contract not initialized");
      const [donors, amounts] = await contract.call("getDonators", [pId]);

      const parsedDonations = donors.map((donator: string, i: number) => ({
        donator,
        donation: ethers.utils.formatEther(amounts[i].toString()),
      }));

      return parsedDonations;
    } catch (error) {
      console.error("Error fetching donations:", error);
    }
  };

  return (
    <StateContext.Provider
      value={{
        address,
        contract,
        connect,
        createCampaign,
        getCampaigns,
        getUserCampaigns,
        donate,
        getDonations,
      }}
    >
      {children}
    </StateContext.Provider>
  );
};

export const useStateContext = () => useContext(StateContext);
