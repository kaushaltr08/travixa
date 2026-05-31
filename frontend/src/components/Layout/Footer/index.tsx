import Link from "next/link";
import Image from "next/image";
import Logo from "../Header/Logo";
import { Icon } from "@iconify/react/dist/iconify.js";
import { headerData } from "../Header/Navigation/menuData";

const socialLinks = [
  { label: "Facebook", href: "#", icon: "tabler:brand-facebook" },
  { label: "Instagram", href: "#", icon: "tabler:brand-instagram" },
  { label: "LinkedIn", href: "#", icon: "tabler:brand-linkedin" },
  { label: "X", href: "#", icon: "tabler:brand-x" },
];

const footer = () => {
  return (
    <footer id="contact" className="bg-deepSlate py-12">
      <div className="container mx-auto lg:max-w-screen-xl md:max-w-screen-md px-4">
        <div className="grid grid-cols-1 gap-y-10 gap-x-16 sm:grid-cols-2 lg:grid-cols-12 xl:gap-x-8">
          <div className='col-span-4 md:col-span-12 lg:col-span-4'>
            <Logo />
            <p className="mt-4 max-w-sm text-base leading-7 text-black/55">
              Travel intelligence for discovering, planning, and booking India trips around your vibe.
            </p>
            <div className='mt-6 flex flex-wrap items-center gap-3'>
              {socialLinks.map((social) => (
                <Link
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className='grid h-11 w-11 place-items-center rounded-full border border-black/10 bg-white/70 text-xl text-midnight_text shadow-sm transition hover:-translate-y-0.5 hover:border-primary hover:bg-primary hover:text-white'
                >
                  <Icon icon={social.icon} />
                </Link>
              ))}
            </div>
          </div>
          <div className="col-span-2">
            <h3 className="mb-4 text-2xl font-medium">Links</h3>
            <ul>
              {headerData.map((item, index) => (
                <li key={index} className="mb-2 text-black/50 hover:text-primary w-fit">
                  <Link href={item.href}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="col-span-2">
            <h3 className="mb-4 text-2xl font-medium">Other</h3>
            <ul>
              <li className="mb-2 text-black/50 hover:text-primary w-fit">
                <Link href="#">
                  About Travixa
                </Link>
              </li>
              <li className="mb-2 text-black/50 hover:text-primary w-fit">
                <Link href="#">
                  Travel Support
                </Link>
              </li>
              <li className="mb-2 text-black/50 hover:text-primary w-fit">
                <Link href="#">
                  Travel Services
                </Link>
              </li>
              <li className="mb-2 text-black/50 hover:text-primary w-fit">
                <Link href="#">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div className='col-span-4 md:col-span-4 lg:col-span-4'>
            <div className="flex items-start gap-3 rounded-2xl bg-white/45 p-4">
              <Icon
                icon="tabler:brand-google-maps"
                className="mt-0.5 shrink-0 text-primary text-2xl"
              />
              <h5 className="text-lg leading-7 text-black/65">Travixa, Gandhinagar Gujarat</h5>
            </div>
            <div className="mt-4 flex items-start gap-3 rounded-2xl bg-white/45 p-4">
              <Icon
                icon="tabler:phone"
                className="mt-0.5 shrink-0 text-primary text-2xl"
              />
              <h5 className="text-lg leading-7 text-black/65">+91 98765 43210</h5>
            </div>
            <div className="mt-4 flex items-start gap-3 rounded-2xl bg-white/45 p-4">
              <Icon
                icon="tabler:mail"
                className="mt-0.5 shrink-0 text-primary text-2xl"
              />
              <Link href="mailto:info.travixa@gmail.com" className="break-all text-lg leading-7 text-black/65 hover:text-primary">
                info.travixa@gmail.com
              </Link>
            </div>
          </div>
        </div>

        <div className='mt-10 lg:flex items-center justify-between'>
          <h4 className='text-black/50 text-sm text-center lg:text-start font-normal'>@2026 Travixa. All Rights Reserved.</h4>
          <div className="flex gap-5 mt-5 lg:mt-0 justify-center lg:justify-start">
            <Link href="/" className='text-black/50 text-sm font-normal hover:text-primary'>Privacy policy</Link>
            <Link href="/" className='text-black/50 text-sm font-normal hover:text-primary'>Terms & conditions</Link>
          </div>
          <h4 className='text-black/50 text-sm text-center lg:text-start font-normal'>Made for modern travelers.</h4>
        </div>
      </div>
    </footer>
  )
}

export default footer;
