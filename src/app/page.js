// src/app/page.js - Marketing home page

import PageShell from "@/components/layouts/PageShell";
import HeroMarketing from "@/components/marketing/HeroMarketing";
import Categories from "@/components/marketing/Categories";
import FeaturedSalons from "@/components/marketing/FeaturedSalons";
import HowItWorks from "@/components/marketing/HowItWorks";
import FinalCTA from "@/components/marketing/FinalCTA";

export default function Home() {
    return (
        <PageShell variant="marketing" className="py-6">
            <div className="mx-auto max-w-6xl">
                <HeroMarketing />

                <Categories />

                <FeaturedSalons />

                <HowItWorks />

                <FinalCTA />
            </div>
        </PageShell>
    );
}
