"use client";

import {
  CustomNotification,
  CustomSplitButtons,
  CustomWithActions,
  Form,
  OsxLike,
  SplitButtons,
  WithActions,
  // WithAvatar,
  // WithProgress,
} from "@/components/general/toastify";

import React from "react";
import { toast } from "react-toastify";
import { Button } from "../ui/button";

export const ToastifyExample = () => {
  const notify = () => {
    // toast(WithAvatar, {
    //   // closeButton: false,
    //   progress: 0.7,
    //   className:
    //     "shadow-lg overflow-visible scale-100 ring-1 ring-black/5 rounded-xl flex items-center gap-6 bg-slate-800 highlight-white/5",
    // });

    // toast(CustomSplitButtons, {
    //   data: {
    //     title: "MFA Required",
    //     content: "You haven't enabled MFA yet. Please do it from Settings.",
    //     link: {
    //       href: "/settings",
    //       label: "Settings",
    //     },
    //   },
    //   className:
    //     "bg-zinc-900/40 backdrop-blur-lg shadow-inner shadow-zinc-600 border border-zinc-900/20 rounded-2xl text-white overflow-visible group bg-green-600 p-2",
    //   closeButton: false,
    // });

    // toast(CustomNotification, {
    //   data: {
    //     title: "Oh Snap!",
    //     content: "Something went wrong",
    //   },
    //   progress: 0.2,
    //   ariaLabel: "Something went wrong",
    //   autoClose: false,
    // });

    // toast.error(CustomNotification, {
    //   data: {
    //     title: "Oh Snap!",
    //     content: "Something went wrong",
    //   },
    //   ariaLabel: "Something went wrong",
    //   autoClose: false,
    //   progress: 0.3,
    //   icon: false,
    //   theme: "colored",
    // });

    toast(CustomWithActions, {
      data: {
        title: "MFA",
        content: "You haven't enabled MFA yet. Please do it from Settings.",
      },
      ariaLabel: "Message archived",
      className: "w-[400px]",
      autoClose: false,
      closeButton: false,
    });
    toast(WithActions, {
      data: {
        title: "Message Archived",
        content: "Lorem ipsum dolor sit amet",
      },
      ariaLabel: "Message archived",
      className: "w-[400px]",
      autoClose: false,
      closeButton: false,
    });

    // toast(SplitButtons, {
    //   closeButton: false,
    //   className: "p-0 w-[400px] border border-purple-600/40",
    //   ariaLabel: "Email received",
    // });

    // toast(Form, {
    //   ariaLabel: "Give feedback",
    // });

    // toast(OsxLike, {
    //   className:
    //     "bg-zinc-900/40 backdrop-blur-lg shadow-inner shadow-zinc-600 border border-zinc-900/20 rounded-2xl text-white overflow-visible group",
    //   closeButton: false,
    // });

    // toast(WithProgress, {
    //   position: "top-left",
    //   autoClose: 8000,
    //   customProgressBar: true,
    //   closeButton: false,
    // });
  };

  return (
    <div>
      <p>testing toastify variants</p>
      <Button onClick={() => notify()} variant="default">
        Nofify !
      </Button>
    </div>
  );
};
