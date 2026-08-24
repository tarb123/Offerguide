import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";

const serviceLinks = [
  { label: "Personality Assessment", href: "/khudiassessment" },
  { label: "3D CVs", href: "/cv" },
  { label: "Offer Calculator", href: "/FinancialOffer" },
  { label: "Professional Growth Program", href: "/pgp-access" },
];

// const companyLinks = [

//   { label: "OfferGuide", href: "/offerguide" },
 
// ];

export default function ModernFooter() {
  return (
    <footer className="bg-[#060c29] text-white">
      <div className="mx-auto max-w-[1400px] px-5 pb-9 pt-16 sm:px-8 lg:px-12 lg:pt-20">
        {/* <div className="mb-4 overflow-hidden rounded-[30px] bg-gradient-to-r from-[#1746b5] to-[#e83444]  p-7 sm:p-10 lg:flex lg:items-center lg:justify-between lg:px-12">
          <div className="max-w-2xl">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-white/65">
              Your next move starts here
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.03em] sm:text-4xl">
              Need a clearer career direction?
            </h2>
          </div>
          <a
            href="mailto:info@conductivity.com.pk?subject=Sanjeeda%20Career%20Guidance"
            className="mt-6 inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-white px-7 text-sm font-black text-[#0b163f] transition hover:-translate-y-1 hover:bg-[#fff7ee] lg:mt-0"
          >
            Talk to our team
            <ArrowUpRight size={18} />
          </a>
        </div> */}

        <div className="-mb-4 grid gap-4 border-b border-white/10 pb-5 md:grid-cols-1 lg:grid-cols-[1.3fr_.7fr_.7fr_1fr]">
          <div>
            <Link href="/" className="inline-block" aria-label="Sanjeeda home">
              <Image
                src="/sanjeeda logo2.png"
                alt="Sanjeeda"
                width={560}
                height={200}
                className="h-auto w-48"
              />
            </Link>
            <p className="-mt-20 max-w-sm text-sm leading-6 text-white/55 px-4">
              Smart career tools and human guidance for people serious about
              understanding themselves, building their edge and choosing better.
            </p>
            <a
              href="https://conductivity.com.pk"
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex items-center gap-3 rounded-full border border-white/10 px-4 py-2"
            >
              <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-white/40">
                Powered by
              </span>
              <Image
                src="/conductivitylogo.png"
                alt="Conductivity"
                width={1000}
                height={220}
                className="h-auto w-24 brightness-0 invert"
              />
            </a>
          </div>

          <div>
            <h3 className="text-sm font-black uppercase tracking-[0.16em] text-white/40">
              Services
            </h3>
            <ul className="mt-1 space-y-3.5">
              {serviceLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm font-bold text-white/70 transition hover:text-[#ff707a]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* <div>
            <h3 className="text-sm font-black uppercase tracking-[0.16em] text-white/40">
              Explore
            </h3>
            <ul className="mt-5 space-y-3.5">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm font-bold text-white/70 transition hover:text-[#ff707a]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div> */}

          <div>
            <h3 className="text-sm font-black uppercase tracking-[0.16em] text-white/40">
              Get in touch
            </h3>
            <ul className="mt-2 space-y-4 text-sm leading-6 text-white/65">
              <li className="flex gap-3">
                <MapPin size={18} className="mt-0.5 shrink-0 text-[#ff5c68]" />
                <span>B-65, Block 2, Gulshan-e-Iqbal, Karachi, Pakistan</span>
              </li>
              <li>
                <a href="tel:+922134832777" className="flex gap-3 transition hover:text-white">
                  <Phone size={17} className="mt-0.5 shrink-0 text-[#ff5c68]" />
                  <span>+92 21 34832777</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:info@conductivity.com.pk"
                  className="flex gap-3 transition hover:text-white"
                >
                  <Mail size={17} className="mt-0.5 shrink-0 text-[#ff5c68]" />
                  <span>info@conductivity.com.pk</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-3 -pt-5 text-xs font-medium text-white/35   sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Sanjeeda.io. All rights reserved.</p>
          <p>Career development for people serious about progress.</p>
        </div>
      </div>
    </footer>
  );
}
