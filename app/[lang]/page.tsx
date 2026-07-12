import { notFound } from "next/navigation";
import { Navbar } from "@/app/components/layout/Navbar";
import { Footer } from "@/app/components/layout/Footer";
import { Hero } from "@/app/components/sections/Hero";
import { Benefits } from "@/app/components/sections/Benefits";
import { HowItWorks } from "@/app/components/sections/HowItWorks";
import { Services } from "@/app/components/sections/Services";
import { DashboardPreview } from "@/app/components/sections/DashboardPreview";
import { Testimonials } from "@/app/components/sections/Testimonials";
import { CtaFinal } from "@/app/components/sections/CtaFinal";
import { getDictionary, hasLocale } from "./dictionaries";

export default async function LangHome(props: PageProps<"/[lang]">) {
  const { lang } = await props.params;
  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang);

  return (
    <>
      <Navbar
        lang={lang}
        nav={dict.nav}
        switcher={dict.languageSwitcher}
      />
      <main>
        <Hero lang={lang} hero={dict.hero} />
        <Benefits benefits={dict.benefits} />
        <HowItWorks howItWorks={dict.howItWorks} />
        <Services services={dict.services} />
        <DashboardPreview lang={lang} dashboard={dict.dashboard} />
        <Testimonials testimonials={dict.testimonials} />
        <CtaFinal lang={lang} ctaFinal={dict.ctaFinal} />
      </main>
      <Footer lang={lang} footer={dict.footer} />
    </>
  );
}