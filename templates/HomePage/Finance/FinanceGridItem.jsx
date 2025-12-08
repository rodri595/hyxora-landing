const FinanceGridItem = ({ title, description }) => {
  return (
    <div className="bg-white border-[0.7px] border-[rgba(25,54,63,0.02)] border-solid flex items-start justify-start flex-col gap-2 overflow-hidden p-5 rounded-2xl shadow-[0px_6px_14px_-4px_rgba(25,54,63,0.05),0px_12px_20px_-4px_rgba(25,54,63,0.05)]">
      <h4 className="font-medium text-xl text-[#19363f] tracking-[-0.8px] leading-[normal]">
        {title}
      </h4>
      <p className="font-normal text-[16px] text-[rgba(25,54,63,0.7)] tracking-[-0.32px] leading-6">
        {description}
      </p>
    </div>
  );
};

export default FinanceGridItem;
