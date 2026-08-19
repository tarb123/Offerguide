import Link from "next/link";
import {
  ArrowRight,
  Check,
  Compass,
  Layers3,
  TrendingUp,
} from "lucide-react";
import ModernServices from "./ModernServices";

const journey = [
  {
    number: "01",
    title: "Understand yourself",
    description:
      "Start with your personality, strengths and readiness—not a generic list of careers.",
    icon: Compass,
  },
  {
    number: "02",
    title: "Build your advantage",
    description:
      "Shape a stronger profile through practical tools, mentoring and professional development.",
    icon: Layers3,
  },
  {
    number: "03",
    title: "Choose with confidence",
    description:
      "Compare opportunities clearly and make the next move with evidence, not guesswork.",
    icon: TrendingUp,
  },
];

export default function ModernHomepage() {
  return (
    <main className="overflow-hidden bg-[#fbf7f1] text-[#0b163f] dark:bg-[#070d2b] dark:text-white">
   
      <ModernServices />

      <section
        id="career-pathway"
        className="relative bg-[#fbf7f1] py-10 dark:bg-[#070d2b] sm:py-24 lg:py-32"
      >
        <div className="mx-auto max-w-[1200px] px-5 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-3xl text-center">
          </div>

          <div className="-mt-14 overflow-hidden rounded-[34px] bg-[#e83444] 
          text-white shadow-[0_25px_70px_rgba(232,52,68,0.22)] sm:p-10 lg:flex lg:items-center lg:justify-between lg:px-12">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-white">
                One connected journey
              </p>
              <h3 className="mt-3 text-2xl font-black tracking-[-0.03em] sm:text-3xl">
                From uncertainty to your next move.
              </h3>
            </div>
 
          </div>

          <div className="relative mt-14 grid gap-5 md:grid-cols-3 lg:mt-18">
            <div className="absolute left-[16%] right-[16%] top-10 hidden border-t border-dashed border-[#1746b5]/25 md:block" />
            {journey.map(({ number, title, description, icon: Icon }) => (
              <article
                key={number}
                className="relative  bg-[#4183d4] shadow-[0_18px_55px_rgba(11,22,63,0.07)] dark:border-white/10 dark:bg-white/[0.05] sm:p-8"
              >
                <div className="flex items-center justify-between">
                       <div className="pointer-events-none absolute inset-0 opacity-100">
         <div className="absolute -right-5 bottom-24 h-16 w-16 rounded-full bg-[#fbf7f1]" />
      </div>
      <span className="relative z-10 grid-flow-col h-14 w-14 place-items-center text-[#e1edef] ">
                   </span>
                  <span className="text-sm font-black tracking-[0.16em] text-white -mb-3">
                    {number}
                  </span>
                </div>
 
                <h3 className="mt-5 text-2xl font-black text-[#e1edef]  tracking-[-0.025em]">
                  {title}
                </h3>
                <p className="mt-2 text-sm text-[#e1edef]  dark:text-white/60">
                  {description}
                </p>
              </article>
            ))}
          </div>


        </div>
      </section>

      <section className="bg-[#0b163f] py-20 text-white sm:py-24 lg:py-28">
        <div className="mx-auto grid max-w-[1400px] items-center gap-12 px-5 sm:px-8 lg:grid-cols-[.9fr_1.1fr] lg:gap-20 lg:px-12">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#ff707a] sm:text-sm">
              Why Sanjeeda
            </p>
            <h2 className="mt-4 text-4xl font-black tracking-[-0.04em] sm:text-5xl">
              Career advice should lead to action.
            </h2>
            <p className="mt-5 text-base leading-8 text-white/65 sm:text-lg">
              We combine self-knowledge, practical tools and real human context.
              The result is guidance you can use—not another report that sits in
              your inbox.
            </p>
            <ul className="mt-8 space-y-4">
              {[
                "Personalized to your strengths and situation",
                "Practical tools for real career decisions",
                "Guidance that grows with your goals",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm font-bold text-white/85 sm:text-base">
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#e83444]">
                    <Check size={14} strokeWidth={3} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href="/about-us"
              className="mt-9 inline-flex items-center gap-2 text-sm font-black text-white transition hover:text-[#ff707a]"
            >
              Meet the thinking behind Sanjeeda
              <ArrowRight size={18} />
            </Link>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 rounded-[36px] bg-gradient-to-br from-[#1746b5]/50 to-[#e83444]/35 blur-2xl" />
            <div className="relative overflow-hidden rounded-[30px] border border-white/15 bg-black/20 p-2 shadow-2xl">
              <video
                src="/Video1.mp4"
                controls
                preload="metadata"
                playsInline
                className="aspect-video w-full rounded-[23px] bg-[#060b2d] object-cover"
              >
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
