"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { headerData } from "../Header/Navigation/menuData";
import Logo from "./Logo";
import HeaderLink from "../Header/Navigation/HeaderLink";
import MobileHeaderLink from "../Header/Navigation/MobileHeaderLink";
import Signin from "@/components/Auth/SignIn";
import SignUp from "@/components/Auth/SignUp";
import { Icon } from "@iconify/react/dist/iconify.js";

const Header: React.FC = () => {
  const pathUrl = usePathname();

  const [navbarOpen, setNavbarOpen] = useState(false);
  const [sticky, setSticky] = useState(false);
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  const isHeroNavbar = pathUrl === "/" && !sticky;

  const signInRef = useRef<HTMLDivElement>(null);
  const signUpRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    setSticky(window.scrollY >= 80);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      signInRef.current &&
      !signInRef.current.contains(event.target as Node)
    ) {
      setIsSignInOpen(false);
    }
    if (
      signUpRef.current &&
      !signUpRef.current.contains(event.target as Node)
    ) {
      setIsSignUpOpen(false);
    }
    if (
      mobileMenuRef.current &&
      !mobileMenuRef.current.contains(event.target as Node) &&
      navbarOpen
    ) {
      setNavbarOpen(false);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [navbarOpen, isSignInOpen, isSignUpOpen]);

  useEffect(() => {
    if (isSignInOpen || isSignUpOpen || navbarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [isSignInOpen, isSignUpOpen, navbarOpen]);

  return (
    <header
      className={`fixed top-0 z-40 w-full transition-all duration-300 ${isHeroNavbar ? "bg-transparent py-6" : "bg-white py-4 shadow-lg"
        }`}
    >
      <div className="lg:py-0 py-2">
        <div className="container mx-auto flex max-w-[1440px] items-center justify-between px-4">
          <Logo />
          <nav className="hidden lg:flex flex-grow items-center gap-5 justify-center">
            {headerData.map((item, index) => (
              <HeaderLink key={index} item={item} />
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="#"
              className="hidden lg:block rounded-full bg-primary px-7 py-3 text-base font-medium text-white hover:bg-primary/15 hover:text-primary"
              onClick={() => {
                setIsSignInOpen(true);
              }}
            >
              Login
            </Link>
            {isSignInOpen && (
              <div className="fixed left-0 top-0 z-50 flex h-full w-full items-center justify-center overflow-y-auto bg-black/50 px-4 py-6">
                <div
                  ref={signInRef}
                  className="relative mx-auto w-full max-w-5xl overflow-hidden rounded-[1.5rem] bg-white shadow-2xl"
                >
                  <button
                    onClick={() => setIsSignInOpen(false)}
                    className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full bg-white/90 text-xl text-zinc-950 shadow-lg transition hover:bg-white"
                    aria-label="Close Sign In Modal"
                  >
                    <Icon icon="tabler:x" />
                  </button>
                  <Signin isModal />
                </div>
              </div>
            )}
            <Link
              href="#"
              className="hidden lg:block rounded-full bg-primary/15 px-7 py-3 text-base font-medium text-primary hover:bg-primary hover:text-white"
              onClick={() => {
                setIsSignUpOpen(true);
              }}
            >
              Signup
            </Link>
            {isSignUpOpen && (
              <div className="fixed left-0 top-0 z-50 flex h-full w-full items-center justify-center overflow-y-auto bg-black/50 px-4 py-6">
                <div
                  ref={signUpRef}
                  className="relative mx-auto w-full max-w-5xl overflow-hidden rounded-[1.5rem] bg-white shadow-2xl"
                >
                  <button
                    onClick={() => setIsSignUpOpen(false)}
                    className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full bg-white/90 text-xl text-zinc-950 shadow-lg transition hover:bg-white"
                    aria-label="Close Sign Up Modal"
                  >
                    <Icon icon="tabler:x" />
                  </button>
                  <SignUp isModal />
                </div>
              </div>
            )}
            <button
              onClick={() => setNavbarOpen(!navbarOpen)}
              className="block lg:hidden p-2 rounded-lg"
              aria-label="Toggle mobile menu"
            >
              <span className="block w-6 h-0.5 bg-midnight_text"></span>
              <span className="block w-6 h-0.5 bg-midnight_text mt-1.5"></span>
              <span className="block w-6 h-0.5 bg-midnight_text mt-1.5"></span>
            </button>
          </div>
        </div>
        {navbarOpen && (
          <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-40" />
        )}
        <div
          ref={mobileMenuRef}
          className={`lg:hidden fixed top-0 right-0 h-full w-full bg-darkmode shadow-lg transform transition-transform duration-300 max-w-xs ${navbarOpen ? "translate-x-0" : "translate-x-full"
            } z-50`}
        >
          <div className="flex items-center justify-between p-4">
            <h2 className="text-lg font-bold text-midnight_text dark:text-midnight_text">
              <Logo />
            </h2>

            {/*  */}
            <button
              onClick={() => setNavbarOpen(false)}
              className="bg-[url('/images/closed.svg')] bg-no-repeat bg-contain w-5 h-5 absolute top-0 right-0 mr-8 mt-8 dark:invert"
              aria-label="Close menu Modal"
            ></button>
          </div>
          <nav className="flex flex-col items-start p-4">
            {headerData.map((item, index) => (
              <MobileHeaderLink key={index} item={item} />
            ))}
            <div className="mt-4 flex flex-col space-y-4 w-full">
              <Link
                href="#"
                className="bg-transparent border border-primary text-primary px-4 py-2 rounded-lg hover:bg-blue-600 hover:text-white"
                onClick={() => {
                  setIsSignInOpen(true);
                  setNavbarOpen(false);
                }}
              >
                Login
              </Link>
              <Link
                href="#"
                className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                onClick={() => {
                  setIsSignUpOpen(true);
                  setNavbarOpen(false);
                }}
              >
                Signup
              </Link>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
