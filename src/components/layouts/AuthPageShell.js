import PageShell from "@/components/layouts/PageShell";
import { cn } from "@/lib/utils";

export default function AuthPageShell({
    children,
    variant = "default",
    title,
    className = "",
    pageClassName = "py-10 sm:py-16",
    rightCardClassName = "",
}) {
    return (
        <PageShell
            variant={variant}
            title={title}
            className={pageClassName}
        >
            <div className={cn("flex justify-center", className)}>
                <section className={cn("rounded-md border border-black/10 bg-white p-6 shadow-xl shadow-black/5 sm:p-8 max-w-lg w-full", rightCardClassName)}>
                    {children}
                </section>
            </div>
        </PageShell>
    );
}

