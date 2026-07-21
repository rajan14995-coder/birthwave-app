import Link from "next/link";
import MarketingNav from "@/components/marketing/MarketingNav";
import MarketingFooter from "@/components/marketing/MarketingFooter";

const SPECIALITIES = [
  { title: "Trying to Conceive", blurb: "Functional-medicine-led support to help couples conceive naturally, alongside advanced fertility treatment where needed." },
  { title: "Pregnancy", blurb: "Holistic maternity care tailored to each pregnancy, from routine checkups to complex concerns." },
  { title: "Childbirth", blurb: "Guidance through every stage of labour, with preparation specific to each stage's demands." },
  { title: "Lactation", blurb: "Dedicated breastfeeding support for the emotional and physical journey that continues after birth." },
  { title: "Postpartum", blurb: "A recovery plan spanning nutrition, physiotherapy, and weight management, personalised to each mother." },
  { title: "Gynaecology", blurb: "Comprehensive care across the uterus, fallopian tubes, ovaries, cervix, vagina, and perineum." },
  { title: "Laparoscopy", blurb: "Minimally invasive surgical options for fibroid removal and pelvic procedures, with faster recovery." },
  { title: "Infertility", blurb: "Support for the roughly 1 in 6 couples who need medical assistance to conceive." },
  { title: "PCOS", blurb: "Management for a condition affecting an estimated 1 in 4 women, many of whom remain undiagnosed." },
  { title: "Preventive Gynaecology", blurb: "Regular screening aimed at catching reproductive health concerns early." },
  { title: "Cosmetic Gynaecology", blurb: "A judgment-free conversation about options — with no assumption that any procedure is required." },
];

const EDUCATION_SECTIONS = [
  { title: "Childbirth Education", blurb: "Workshops that walk expectant couples through the practical and emotional sides of birth." },
  { title: "Retreats", blurb: "Tailored wellness retreats spanning prenatal preparation through postnatal recovery." },
  { title: "Yoga", blurb: "Curated yoga programs ranging from adolescence through the post-menopausal years." },
];

const WHY_CHOOSE_US = [
  { title: "Trying to Conceive", blurb: "A functional-medicine-first approach to natural conception, alongside modern fertility care." },
  { title: "Pregnancy", blurb: "Care built around making the experience memorable, not just a milestone to get through." },
  { title: "Childbirth", blurb: "Dedicated education workshops so parents understand each stage before it arrives." },
  { title: "Postpartum", blurb: "An individualised recovery plan spanning nutrition, physiotherapy, and weight management." },
  { title: "Lactation", blurb: "Ongoing hands-on support to help mothers build breastfeeding confidence." },
  { title: "Infant Massage", blurb: "Guided sessions that build bonding and support the baby's nervous system." },
  { title: "Mental Well-being", blurb: "Consultations that address emotional and psychological health alongside the physical." },
  { title: "Support Network", blurb: "A community space for a positive, informed childbirth and postpartum experience." },
];

export default function HomePage() {
  return (
    <>
      <MarketingNav />

      {/* Hero */}
      <section className="bg-blush px-4 py-16 text-center">
        <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-rose-gold">Welcome to The BirthWave</p>
        <h1 className="mx-auto mb-4 max-w-3xl text-3xl font-semibold text-plum sm:text-4xl">
          Best Obstetrician &amp; Gynaecologist in Nungambakkam, Chennai
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-plum/70">
          Comprehensive women's healthcare, pregnancy care, fertility support, and childbirth services — with
          state-of-the-art facilities and a supportive environment for mothers and newborns alike.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <a href="tel:+919363031925" className="rounded-xl bg-plum px-6 py-3 font-medium text-white">
            Call Now: 93630 31925
          </a>
          <Link href="/login/patient" className="rounded-xl bg-rose-gold px-6 py-3 font-medium text-white">
            Book Appointment
          </Link>
        </div>
      </section>

      {/* Specialities */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="mb-8 text-center text-2xl font-semibold text-plum">Our Specialities</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SPECIALITIES.map((s) => (
            <div key={s.title} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-rose/20">
              <h3 className="mb-2 font-semibold text-plum">{s.title}</h3>
              <p className="text-sm text-plum/60">{s.blurb}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Childbirth education / retreats / yoga */}
      <section className="bg-sage/40 px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-8 text-center text-2xl font-semibold text-plum">
            Childbirth Education, Retreats &amp; Yoga
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {EDUCATION_SECTIONS.map((s) => (
              <div key={s.title} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-rose/20">
                <h3 className="mb-2 font-semibold text-plum">{s.title}</h3>
                <p className="text-sm text-plum/60">{s.blurb}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Dr Santoshi */}
      <section className="mx-auto max-w-4xl px-4 py-16 text-center">
        <p className="mb-1 text-sm font-semibold uppercase tracking-wide text-rose-gold">Hey there!</p>
        <h2 className="mb-4 text-2xl font-semibold text-plum">Dr. Santoshi Nandigam</h2>
        <p className="mb-2 text-sm text-plum/60">
          Consultant Obstetrician and Gynaecologist — The BirthWave, Cloud9 Hospitals, Apollo Hospitals, and
          Motherhood Hospitals, Chennai.
        </p>
        <p className="mx-auto max-w-2xl text-plum/70">
          The clinic covers everything from pregnancy through cosmetic gynaecology, with content and care
          personally shaped around real questions women bring in.
        </p>
      </section>

      {/* Why choose us */}
      <section className="bg-blush px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <p className="mb-1 text-center text-sm font-semibold uppercase tracking-wide text-rose-gold">
            Our Specialties
          </p>
          <h2 className="mb-8 text-center text-2xl font-semibold text-plum">Why Choose Us</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {WHY_CHOOSE_US.map((s) => (
              <div key={s.title} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-rose/20">
                <h3 className="mb-2 font-semibold text-plum">{s.title}</h3>
                <p className="text-sm text-plum/60">{s.blurb}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Clinic info */}
      <section className="mx-auto max-w-4xl px-4 py-16 text-center">
        <h2 className="mb-4 text-2xl font-semibold text-plum">The BirthWave Obstetrics &amp; Gynecology Clinic</h2>
        <p className="text-plum/70">8/15, Mahalingapuram Main Rd, Mahalingapuram, Nungambakkam, Chennai, Tamil Nadu 600034</p>
        <p className="text-plum/70">Call: <a href="tel:+919363031925" className="underline">93630 31925</a> · Email: <a href="mailto:drsantoshi@thebirthwave.com" className="underline">drsantoshi@thebirthwave.com</a></p>
        <p className="mt-2 text-sm text-plum/50">Open: Monday–Sunday, 7:30 AM – 9 PM</p>

        <div className="mt-8 flex justify-center gap-3">
          <Link href="/login/patient" className="rounded-xl bg-rose-gold px-6 py-3 font-medium text-white">
            Patient Login
          </Link>
          <Link href="/login/staff" className="rounded-xl bg-plum px-6 py-3 font-medium text-white">
            Clinic Staff Login
          </Link>
        </div>
      </section>

      <MarketingFooter />
    </>
  );
}
