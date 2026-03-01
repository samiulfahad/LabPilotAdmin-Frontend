import useStore from "./store";
const Status = () => {
  const { schema, setSchema } = useStore();
  const handleIsActiveChange = (e) => {
    setSchema("isActive", e.target.checked);
  };
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Status</h3>
          <p className="text-sm text-gray-600 mt-1">
            {schema.isActive ? "Schema is active and can be used" : "Schema is in draft mode"}
          </p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" checked={schema.isActive} onChange={handleIsActiveChange} className="sr-only peer" />
          <div className="w-12 h-6 bg-gray-300 rounded-full peer peer-checked:bg-green-600 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-6"></div>
          <span className="ml-3 text-sm font-medium text-gray-700">{schema.isActive ? "Active" : "Draft"}</span>
        </label>
      </div>
    </div>
  );
};
export default Status;
