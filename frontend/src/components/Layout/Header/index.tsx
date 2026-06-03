"use client";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { headerData } from "../Header/Navigation/menuData";
import Logo from "./Logo";
import HeaderLink from "../Header/Navigation/HeaderLink";
import MobileHeaderLink from "../Header/Navigation/MobileHeaderLink";
import Signin from "@/components/Auth/SignIn";
import SignUp from "@/components/Auth/SignUp";
import PasswordResetModal from "@/components/Auth/PasswordResetModal";
import { Icon } from "@iconify/react/dist/iconify.js";
import toast from "react-hot-toast";
import {
  clearTravixaAuth,
  getStoredTravixaUser,
  travixaAuthChangedEvent,
  type TravixaUser,
} from "@/utils/travixaAuth";

type AuthModal = "signin" | "signup" | "forgot" | null;

const Header: React.FC = () => {
  const pathUrl = usePathname();

  const [navbarOpen, setNavbarOpen] = useState(false);
  const [sticky, setSticky] = useState(false);
  const [authModal, setAuthModal] = useState<AuthModal>(null);
  const [user, setUser] = useState<TravixaUser | null>(null);
  const isHeroNavbar = pathUrl === "/" && !sticky;

  const authModalRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    setSticky(window.scrollY >= 80);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      authModalRef.current &&
      !authModalRef.current.contains(event.target as Node)
    ) {
      setAuthModal(null);
    }
    if (
      mobileMenuRef.current &&
      !mobileMenuRef.current.contains(event.target as Node) &&
      navbarOpen
    ) {
      setNavbarOpen(false);
    }
  };

  const handleLogout = () => {
    clearTravixaAuth();
    setUser(null);
    setNavbarOpen(false);
    setAuthModal(null);
    toast.success("Logged out successfully");
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [navbarOpen, authModal]);

  useEffect(() => {
    const syncUser = () => {
      setUser(getStoredTravixaUser());
      setAuthModal(null);
    };

    syncUser();
    window.addEventListener(travixaAuthChangedEvent, syncUser);
    window.addEventListener("storage", syncUser);

    return () => {
      window.removeEventListener(travixaAuthChangedEvent, syncUser);
      window.removeEventListener("storage", syncUser);
    };
  }, []);

  useEffect(() => {
    if (authModal || navbarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [authModal, navbarOpen]);

  const closeAuthModal = () => setAuthModal(null);

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
            {user ? (
              <div className="hidden items-center gap-3 lg:flex">
                <span className="max-w-[160px] truncate rounded-full bg-primary/10 px-5 py-3 text-base font-semibold text-primary">
                  {user.name || user.email || "Travixa user"}
                </span>
                <button
                  type="button"
                  className="rounded-full bg-primary px-7 py-3 text-base font-medium text-white hover:bg-primary/15 hover:text-primary"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  className="hidden rounded-full bg-primary px-7 py-3 text-base font-medium text-white hover:bg-primary/15 hover:text-primary lg:block"
                  onClick={() => {
                    setAuthModal("signin");
                  }}
                >
                  Login
                </button>
                <button
                  type="button"
                  className="hidden rounded-full bg-primary/15 px-7 py-3 text-base font-medium text-primary hover:bg-primary hover:text-white lg:block"
                  onClick={() => {
                    setAuthModal("signup");
                  }}
                >
                  Signup
                </button>
              </>
            )}
            {authModal && (
              <div className="fixed left-0 top-0 z-50 flex h-full w-full items-center justify-center overflow-y-auto bg-black/50 px-4 py-6">
                <div
                  ref={authModalRef}
                  className={`relative mx-auto w-full overflow-hidden rounded-[1.5rem] bg-white shadow-2xl ${
                    authModal === "forgot" ? "max-w-3xl" : "max-w-5xl"
                  }`}
                >
                  <button
                    onClick={closeAuthModal}
                    className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full bg-white/90 text-xl text-zinc-950 shadow-lg transition hover:bg-white"
                    aria-label="Close auth modal"
                  >
                    <Icon icon="tabler:x" />
                  </button>
                  {authModal === "signin" && (
                    <Signin
                      isModal
                      onCreateAccount={() => setAuthModal("signup")}
                      onForgotPassword={() => setAuthModal("forgot")}
                    />
                  )}
                  {authModal === "signup" && (
                    <SignUp isModal onSignIn={() => setAuthModal("signin")} />
                  )}
                  {authModal === "forgot" && (
                    <PasswordResetModal onBackToSignIn={() => setAuthModal("signin")} />
                  )}
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
              {user ? (
                <>
                  <span className="truncate rounded-lg border border-primary/25 px-4 py-2 font-semibold text-primary">
                    {user.name || user.email || "Travixa user"}
                  </span>
                  <button
                    type="button"
                    className="rounded-lg bg-primary px-4 py-2 text-left text-white hover:bg-blue-700"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    className="rounded-lg border border-primary bg-transparent px-4 py-2 text-left text-primary hover:bg-blue-600 hover:text-white"
                    onClick={() => {
                      setAuthModal("signin");
                      setNavbarOpen(false);
                    }}
                  >
                    Login
                  </button>
                  <button
                    type="button"
                    className="rounded-lg bg-primary px-4 py-2 text-left text-white hover:bg-blue-700"
                    onClick={() => {
                      setAuthModal("signup");
                      setNavbarOpen(false);
                    }}
                  >
                    Signup
                  </button>
                </>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
