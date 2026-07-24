"use client";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth-client";
import Image from "next/image";
import { useState, useEffect } from "react";

const SignInPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleSignIn, setIsGoogleSignIn] = useState(false);
  const [isGithubSignIn, setIsGithubSignIn] = useState(false);

  useEffect(() => {
    return () => {
      setIsLoading(false);
      setIsGoogleSignIn(false);
      setIsGithubSignIn(false);
    };
  }, []);

  return (
    <>
      <section className="flex flex-col items-center justify-center min-h-screen bg-background px-4 py-16 md:py-32">
        <div className="flex flex-row justify-center items-center gap-x-2">
          <h1 className="text-3xl font-extrabold text-foreground ">
            Welcome to
          </h1>
          <Image src="/logo.svg" alt="logo" width={142} height={142} />
        </div>

        <p className="mt-2 text-lg text-muted-foreground font-semibold">
          Sign in to get started
        </p>

        <Button
          variant={"default"}
          className={
            "max-w-sm mt-5 w-full px-7 py-7 flex flex-row justify-center items-center cursor-pointer"
          }
          disabled={isLoading}
          onClick={() => {
            setIsGoogleSignIn(true);
            setIsLoading(true);
            authClient.signIn.social({
              provider: "google",
              callbackURL: "/",
            });
          }}
        >
          <Image src={"/google.svg"} alt={"google"} width={24} height={24} />
          {isGoogleSignIn ? (
            <span className="font-bold ml-2 flex flex-row gap-2">
              <Spinner /> Signing in...
            </span>
          ) : (
            <span className="font-bold ml-2">Sign in with Google</span>
          )}
        </Button>

        <Button
          variant={"default"}
          className={
            "max-w-sm mt-5 w-full px-7 py-7 flex flex-row justify-center items-center cursor-pointer"
          }
          disabled={isLoading}
          onClick={() => {
            setIsGithubSignIn(true);
            setIsLoading(true);
            authClient.signIn.social({
              provider: "github",
              callbackURL: "/",
            });
          }}
        >
          <Image src={"/github.svg"} alt={"github"} width={24} height={24} />
          {isGithubSignIn ? (
            <span className="font-bold ml-2 flex flex-row gap-2">
              <Spinner /> Signing in...
            </span>
          ) : (
            <span className="font-bold ml-2">Sign in with Github</span>
          )}
        </Button>
      </section>
    </>
  );
};

export default SignInPage;
