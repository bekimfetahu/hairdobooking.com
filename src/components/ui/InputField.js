export default function InputField({ id, label, type, value, onChange, required = false, autoComplete }) {
    return (
        <div className="mt-4">
            <label htmlFor={id} className="block font-medium text-sm text-gray-700">
                {label}
            </label>
            <input
                id={id}
                name={id}
                type={type}
                autoComplete={autoComplete}
                value={value}
                onChange={onChange}
                className="p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-gray-500 mt-1 block w-full"
                required={required}
            />
        </div>
    );
}
