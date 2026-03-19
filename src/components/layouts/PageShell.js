import { cn } from "@/lib/utils";

const variantStyles = {
    default: "bg-background",
    marketing: "bg-[linear-gradient(180deg,#fffdfc_0%,#ffffff_45%,#fff7f5_100%)]",
    business: "bg-[linear-gradient(180deg,#fffdfc_0%,#ffffff_45%,#fff7f5_100%)]",
    dashboard: "bg-[linear-gradient(180deg,#ffffff_0%,#fafafa_100%)]",
};

export default function PageShell({
    children,
    eyebrow,
    title,
    description,
    actions,
    variant = "default",
    className = "",
    containerClassName = "mx-auto max-w-6xl px-6 py-5 sm:py-3",
    contentClassName = "",
    headerClassName = "",
    titleClassName = "",
    descriptionClassName = "",
    eyebrowClassName = "",
}) {
    return (
        <main className={cn("min-h-screen", variantStyles[variant] || variantStyles.default, className)}>
            <div className={containerClassName}>
                {(eyebrow || title || description || actions) && (
                    <header className={cn("mb-8 flex flex-col gap-4", headerClassName)}>
                        {eyebrow && (
                            <p className={cn("text-sm font-semibold uppercase tracking-[0.25em] text-primary", eyebrowClassName)}>
                                {eyebrow}
                            </p>
                        )}
                        {title && (
                            <h1 className={cn("max-w-3xl text-4xl font-semibold tracking-tight text-neutral-950 md:text-5xl", titleClassName)}>
                                {title}
                            </h1>
                        )}
                        {description && (
                            <p className={cn("max-w-2xl text-base leading-8 text-neutral-600 md:text-lg", descriptionClassName)}>
                                {description}
                            </p>
                        )}
                        {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
                    </header>
                )}

                <div className={contentClassName}>{children}</div>
            </div>
        </main>
    );
}

