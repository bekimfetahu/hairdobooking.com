import { cn } from "@/lib/utils";

export default function BlackButton({
    children,
    onClick,
    type = "button",
    disabled = false,
    sizeClass = "text-xs",
    className = "",
}) {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={cn(
                "cursor-pointer inline-flex items-center justify-center px-4 py-2 rounded-full font-semibold text-white uppercase tracking-wide bg-black border border-black hover:bg-neutral-800 active:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transition ease-in-out duration-150",
                sizeClass,
                className,
            )}
        >
            {children}
        </button>
    );
}
