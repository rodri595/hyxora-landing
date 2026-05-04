import toast from "react-hot-toast";

export const getRandomNumber = (min, max) => {
  return Math.random() * (max - min) + min;
};

export const getRandomNumberInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

export const getRandomBool = () => {
  return Math.random() >= 0.5;
};

export const shortenAddress = (address) => {
  if (!!!address) return "";
  return `${address.slice(0, 5)}...${address.slice(address.length - 4)}`;
};

export const extraShortenAddress = (address) => {
  if (!!!address) return "";
  return `${address.slice(0, 2)}..${address.slice(address.length - 2)}`;
};

export const shortenAddressLong = (address) => {
  if (!!!address) return "";
  return `${address.slice(0, 10)}...${address.slice(address.length - 9)}`;
};

// /////////////////////////////////////////////////////////////
export const copyToClipboard = (text) => {
  if (!!!text) return;
  if (navigator?.clipboard) {
    navigator.clipboard.writeText(text);
  } else {
    const el = document.createElement("textarea");
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
  }

  toast.success("Copiado", {
    // icon: "✅",
    duration: 2000,
    position: "top-right",
  });
};

export const getCurrencySymbol = (locale = "en-US", currencyCode = "USD") => {
  try {
    const formatter = new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: 0, // Set to 0 to avoid displaying decimal places in the symbol extraction
      maximumFractionDigits: 0,
    });
    const parts = formatter.formatToParts(0); // Format a zero value to get the parts
    const currencyPart = parts.find((part) => part.type === "currency");
    return currencyPart ? currencyPart.value : "$"; // Default to $ if symbol not found
  } catch (error) {
    console.error("Error getting currency symbol:", error);
    return "$"; // Default fallback
  }
};

/**
 * Share content using the native Web Share API with fallback to clipboard
 * @param {Object} options - Share options
 * @param {string} options.title - Title of the shared content
 * @param {string} options.text - Description text for the shared content
 * @param {string} [options.url] - URL to share (defaults to current page URL)
 * @param {boolean} [options.showSuccessToast=true] - Show success toast on clipboard fallback
 * @param {string} [options.successMessage='Link copied to clipboard!'] - Custom success message
 * @returns {Promise<boolean>} - Returns true if share was successful, false otherwise
 */
export const shareContent = async ({
  title,
  text,
  url = window.location.href,
  showSuccessToast = true,
  successMessage = "Link copied to clipboard!",
}) => {
  const shareData = {
    title,
    text,
    url,
  };

  try {
    // Check if the Web Share API is supported
    if (navigator.share) {
      await navigator.share(shareData);
      return true;
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(url);
      if (showSuccessToast) {
        toast.success(successMessage, {
          icon: "🔗",
          duration: 2000,
          position: "top-right",
        });
      }
      return true;
    }
  } catch (error) {
    // User cancelled or error occurred
    if (error.name !== "AbortError") {
      console.error("Error sharing:", error);
      // Fallback: try to copy to clipboard
      try {
        await navigator.clipboard.writeText(url);
        if (showSuccessToast) {
          toast.success(successMessage, {
            icon: "🔗",
            duration: 2000,
            position: "top-right",
          });
        }
        return true;
      } catch (clipboardError) {
        console.error("Error copying to clipboard:", clipboardError);
        toast.error("Failed to share or copy link", {
          icon: "❌",
          duration: 2000,
          position: "top-right",
        });
        return false;
      }
    }
    return false;
  }
};
