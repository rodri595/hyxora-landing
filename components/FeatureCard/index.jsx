import Video from "@/components/Video";

const FeatureCard = ({
  videoSrc,
  title,
  description,
  className = "",
  ...props
}) => {
  return (
    <div
      className={`backdrop-blur-sm bg-[rgba(25,54,63,0.02)] border-[0.7px] border-[rgba(25,54,63,0.02)] border-solid flex flex-col gap-[16px] items-center overflow-hidden rounded-[16px] max-lg:max-w-full max-lg:pb-[20px] ${className}`}
      style={{ boxShadow: "0px 0px 4px 0px inset rgba(25,54,63,0.04)" }}
      {...props}
    >
      <div className="h-[212px] max-lg:h-[144px] relative w-full">
        <Video
          src={videoSrc}
          className="h-[212px] max-lg:h-[144px] w-full"
          autobuffer="true"
          playsInline
          autoPlay
          muted
          loop
        />
      </div>
      <div className="flex flex-col gap-[16px] items-start px-[30px] max-lg:px-[16px] w-full">
        <h3 className="font-medium text-[24px] max-lg:text-[16px] text-[#19363f] tracking-[-0.96px] max-lg:tracking-[-0.64px] leading-[normal] max-lg:leading-[22px] w-full">
          {title}
        </h3>
        <p className="font-normal text-[16px] max-lg:text-[12px] leading-[24px] max-lg:leading-[20px] text-[rgba(25,54,63,0.7)] tracking-[-0.32px] max-lg:tracking-[-0.24px] w-full">
          {description}
        </p>
      </div>
    </div>
  );
};

export default FeatureCard;
