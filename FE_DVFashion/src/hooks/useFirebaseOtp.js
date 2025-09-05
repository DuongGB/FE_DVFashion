import { useEffect, useState } from "react";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth } from "../config/firebaseConfig";
import formatPhoneNumber from "../utils/formatPhoneNumber";

export const useFirebaseOtp = () => {
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [recaptchaVerifier, setRecaptchaVerifier] = useState(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  // Cleanup recaptcha
  const cleanup = () => {
    try {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
      if (recaptchaVerifier) {
        recaptchaVerifier.clear();
        setRecaptchaVerifier(null);
      }
    } catch (error) {
      console.warn("Error during cleanup:", error);
    }
  };

  // // Setup recaptcha
  // const setupRecaptcha = () => {
  //   try {
  //     // Clean up existing recaptcha first
  //     cleanup();

  //     // Wait a bit for DOM to be ready
  //     const container = document.getElementById("recaptcha-container");
  //     if (!container) {
  //       throw new Error("Recaptcha container not found");
  //     }

  //     // Clear container content
  //     container.innerHTML = "";

  //     const verifier = new RecaptchaVerifier(auth, "recaptcha-container", {
  //       size: "invisible",
  //       callback: () => {
  //         console.log("Recaptcha resolved");
  //       },
  //       "expired-callback": () => {
  //         console.log("Recaptcha expired");
  //       },
  //     });

  //     // Store globally for cleanup
  //     window.recaptchaVerifier = verifier;
  //     setRecaptchaVerifier(verifier);

  //     return verifier;
  //   } catch (error) {
  //     console.error("Error setting up recaptcha:", error);
  //     throw error;
  //   }
  // };

  // Send OTP
  const sendOtp = async (phoneNumber) => {
    try {
      // Format phone number to international format
      const formattedPhone = formatPhoneNumber(phoneNumber);

      cleanup();

      // Create new RecaptchaVerifier for each request
      const recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        {
          size: "invisible",
          callback: () => {
            console.log("Recaptcha resolved");
          },
          "expired-callback": () => {
            console.log("Recaptcha expired");
          },
        }
      );

      // Send OTP
      const confirmationResult = await signInWithPhoneNumber(
        auth,
        formattedPhone,
        recaptchaVerifier
      );

      setConfirmationResult(confirmationResult);

      return {
        success: true,
        verificationId: confirmationResult.verificationId,
      };
    } catch (error) {
      console.error("Error sending OTP:", error);
      cleanup();
      throw error;
    }
  };

  // Verify OTP
  const verifyOtp = async (otpCode) => {
    try {
      if (!confirmationResult) {
        throw new Error("No confirmation result found");
      }

      const result = await confirmationResult.confirm(otpCode);
      const idToken = await result.user.getIdToken();

      cleanup();

      return {
        success: true,
        idToken,
        user: result.user,
      };
    } catch (error) {
      console.error("Error verifying OTP:", error);
      throw error;
    }
  };

  return {
    sendOtp,
    verifyOtp,
    cleanup,
  };
};
