import PageShell from "@/components/layouts/PageShell";
import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";

export default function AuthPageShell({
    children,
    variant = "default",
    eyebrow,
    title,
    description,
    panelBadge,
    panelTitle,
    panelDescription,
    benefits = [],
    className = "",
    pageClassName = "py-10 sm:py-16",
    leftCardClassName = "",
    rightCardClassName = "",
}) {
    return (
        <PageShell
            variant={variant}
            eyebrow={eyebrow}
            title={title}
            description={description}
            className={pageClassName}
        >
            <div className={cn("grid gap-8 lg:grid-cols-[0.95fr_1.05fr]", className)}>
                <section className={cn("rounded-[2rem] border border-black/10 bg-white p-6 shadow-xl shadow-black/5 sm:p-8", leftCardClassName)}>
                    {panelBadge && (
                        <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-neutral-50 px-4 py-2 text-sm font-medium text-neutral-700">
                            <CheckCircle2 className="h-4 w-4 text-black" />
                            {panelBadge}
                        </div>
                    )}

                    {panelTitle && (
                        <h2 className="mt-6 text-2xl font-semibold text-neutral-950">
                            {panelTitle}
                        </h2>
                    )}

                    {panelDescription && (
                        <p className="mt-4 text-sm leading-7 text-neutral-600">
                            {panelDescription}
                        </p>
                    )}

                    {!!benefits.length && (
                        <div className="mt-8 space-y-4">
                            {benefits.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <div
                                        key={item.title}
                                        className="flex gap-4 rounded-2xl border border-black/10 bg-neutral-50 p-4"
                                    >
                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-black shadow-sm">
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-neutral-950">{item.title}</p>
                                            <p className="mt-1 text-sm leading-6 text-neutral-600">{item.text}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>

                <section className={cn("rounded-[2rem] border border-black/10 bg-white p-6 shadow-xl shadow-black/5 sm:p-8", rightCardClassName)}>
                    {children}
                </section>
            </div>
        </PageShell>
    );
}

