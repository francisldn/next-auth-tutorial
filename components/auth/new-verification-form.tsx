"use client";
import { BeatLoader } from "react-spinners";
import { CardWrapper } from "./card-wrapper";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { newVerification } from "@/actions/new-verification";
import { FormError } from "../form-error";
import { FormSuccess } from "../form-success";

export const NewVerificationForm = () => {
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const onSubmit = useCallback(() => {
    if (success || error) return;
    if (!token) {
      setError("Token not found");
      return;
    }
    newVerification(token)
      .then((data) => {
        if (data.success) {
          setSuccess(data.success);
        } else {
          setError(data?.error || "");
        }
      })
      .catch((error) => {
        setError(error.error);
        setSuccess("");
      });
  }, [token, success, error]);

  useEffect(() => {
    onSubmit();
  }, [onSubmit]);

  return (
    <CardWrapper
      headerLabel='Confirming your verification'
      backButtonLabel='Back to login'
      backButtonHref='/auth/login'
      showSocial={false}
    >
      <div className='flex flex-col items-center w-full justify-center'>
        {!success && !error && <BeatLoader />}
        <FormSuccess message={success} />
        {!success && <FormError message={error} />}
      </div>
    </CardWrapper>
  );
};
