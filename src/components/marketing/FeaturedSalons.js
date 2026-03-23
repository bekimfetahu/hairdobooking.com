"use client";

import ImageSlider from "@/components/ui/ImageSlider";

export default function FeaturedSalons() {
    return (
        <section className="py-12">
            <div className="-mx-6 sm:-mx-8">
                <div className="mx-auto max-w-full px-0">
                    <div className="shadow-lg">
                        {/* Use fullBleed slider for featured salons */}
                        <ImageSlider fullBleed className="h-auto" />
                    </div>
                </div>
            </div>
        </section>
    );
}

