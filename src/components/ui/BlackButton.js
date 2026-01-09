export default function BlackButton({ children, onClick, type = "button", disabled = false, sizeClass = "text-xs" }) {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`ms-4 cursor-pointer inline-flex items-center px-4 py-2 bg-gray-800 border border-transparent rounded-md font-semibold ${sizeClass} text-white uppercase tracking-widest hover:bg-gray-700 focus:bg-gray-700 active:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150`}
        >
            {children}
        </button>
    );
}
