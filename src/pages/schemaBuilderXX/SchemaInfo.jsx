import useStore from "./store";
import InputField from "../../components/html/InputField";
const Schema = () => {
  const { schema, setSchema } = useStore();
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField label="Name" value={schema.name} onChange={(e) => setSchema("name", e.target.value)} />
        <InputField
          label="Description"
          value={schema.description}
          onChange={(e) => setSchema("description", e.target.value)}
        />
      </div>
    </div>
  );
};
export default Schema;
