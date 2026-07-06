"use client";

import Button from "@/components/Button";
import Icon from "@/components/Icon";
import Modal from "@/components/Modal";
import VideoPreview from "@/components/VideoPreview";

/**
 * Lightbox player for a public tutorial. Reuses the shared Modal (Headless UI
 * Dialog → handles Escape, scroll-lock, backdrop and focus) and the shared
 * VideoPreview, so we don't need a dedicated route per video.
 *
 * @param {boolean} open
 * @param {object} [video]
 * @param {() => void} onClose
 */
const VideoModal = ({ open, video, onClose }) => (
  <Modal
    open={open}
    onClose={onClose}
    hideCloseButton
    classWrapper="max-w-[920px] bg-transparent shadow-none!"
  >
    {video && (
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <p className="font-inter text-[12px] font-medium tracking-[-0.24px] text-white/55">
              {video.category}
            </p>
            <h2 className="font-inter text-[20px] font-medium leading-normal tracking-[-0.8px] text-white max-md:text-[16px]">
              {video.title}
            </h2>
          </div>
          <Button
            isSecondary
            isCircle
            aria-label="Cerrar"
            onClick={onClose}
            className="shrink-0"
          >
            <Icon name="close-small" className="size-5 fill-inherit" />
          </Button>
        </div>

        <VideoPreview url={video.url} />
      </div>
    )}
  </Modal>
);

export default VideoModal;
