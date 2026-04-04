import ImageSlider from "@/components/ui/ImageSlider";

const showcaseSlides = [
    { src: "/images/appointments.png", label: "Desktop" },
    { src: "/images/model.png", label: "Tablet" },
    { src: "/images/model-2.png", label: "Mobile" },
];

export default function FeaturedSalons() {
    return (
        <section className="py-12">
            <div className="container mx-auto px-6">
                <div className="text-center">
                    <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">
                        Product showcase
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold text-neutral-950">
                        Appointment scheduler previews
                    </h2>
                    <p className="mt-2 text-sm text-neutral-600">
                        See how your appointments look across desktop, tablet and
                        mobile.
                    </p>
                </div>

                <div className="mt-8 -mx-6 sm:-mx-8">
                    <div className="mx-auto max-w-full px-0">
                        <div className="shadow-lg rounded-2xl overflow-hidden bg-white">
                            {/* Server-visible preview: beneficial for SEO and crawlers */}
                            <div className="hidden sm:block w-full bg-neutral-50 p-6">
                                <div className="mx-auto max-w-6xl flex items-center justify-center">
                                    <img
                                        src="/images/appointments.png"
                                        alt="Appointments view preview"
                                        className="h-60 md:h-80 lg:h-[420px] w-auto object-contain"
                                    />
                                </div>
                            </div>

                            {/* Interactive slider (client component) — will hydrate on client */}
                            <div className="block sm:hidden">
                                {/* On small screens, mount the interactive slider directly */}
                                <ImageSlider slides={showcaseSlides} sliderHeight={220} sliderHeightMobile={160} fullBleed className="h-auto" />
                            </div>

                            {/* On larger screens, also mount the interactive slider (hydration will replace/augment preview) */}
                            <div className="hidden sm:block">
                                <ImageSlider slides={showcaseSlides} sliderHeight={280} fullBleed className="h-auto" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
