export const daysLeft = (deadline: string | number | Date): string => {
  const deadlineInMs =
    typeof deadline === "number" && deadline.toString().length === 10
      ? deadline * 1000
      : new Date(deadline).getTime();

  const difference = deadlineInMs - Date.now();
  const remainingDays = difference / (1000 * 3600 * 24);
  return remainingDays > 0 ? remainingDays.toFixed(0) : "0";
};

export const calculateBarPercentage = (
  goal: number,
  raisedAmount: number
): number => {
  const percentage = Math.round((raisedAmount * 100) / goal);
  return percentage;
};

export const checkIfImage = (
  url: string,
  callback: (exists: boolean) => void
): void => {
  const img = new Image();
  img.src = url;
  if (img.complete) callback(true);
  img.onload = () => callback(true);
  img.onerror = () => callback(false);
};
