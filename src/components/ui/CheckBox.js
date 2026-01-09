export default function CheckBox({ checked, onChange, label }) {
    return (
        <label className="flex items-center">
            <input
                type="checkbox"
                checked={checked}
                onChange={onChange}
                className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
            />
            <span className="ms-2 text-sm text-gray-600">{label}</span>
        </label>
    );
}
