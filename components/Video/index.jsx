import "./style.css";
const VideoComponent = ({ src, type, className, ...props }) => {
  return (
    <video
      //   autobuffer="true"
      //   playsInline
      //   autoPlay
      //   muted
      //   loop

      className={`video--container ${className ? className : ""}`}
      {...props}
    >
      <source
        src={src}
        type={type || "video/mp4"}
        // type="video/mp4"
      />
    </video>
  );
};

export default VideoComponent;
