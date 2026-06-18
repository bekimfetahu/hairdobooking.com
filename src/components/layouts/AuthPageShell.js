import PageShell from "@/components/layouts/PageShell";
import { cn } from "@/lib/utils";

export default function AuthPageShell({
    children,
    variant = "default",
    title,
    className = "",
    pageClassName = "py-7 sm:py-12"
}) {
    return (
        <PageShell
            variant={variant}
            title={title}
            className={pageClassName}
        >

            <div className={cn("flex justify-center sm:mx-0", className)}>
                <section className={cn("w-full p-2 sm:px-3 sm:py-4")}>
                    {children}
                </section>
            </div>

        </PageShell>
    );
}

