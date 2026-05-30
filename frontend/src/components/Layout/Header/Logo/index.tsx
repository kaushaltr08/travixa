import Link from "next/link";

const Logo: React.FC = () => {
  return (
    <Link href="/" className="inline-flex flex-col leading-none text-midnight_text">
      <span className="text-3xl font-semibold tracking-normal">Travixa</span>
      <span className="mt-1 text-[11px] font-medium uppercase tracking-[0.16em] text-primary">
        Plan smarter. Travel better.
      </span>
    </Link>
  );
};

export default Logo;
