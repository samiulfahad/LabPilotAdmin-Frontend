import { useEffect } from "react";
import SearchAndSelect from "../../components/html/searchAndSelect";
import useStore from "./store";

const SelectTest = () => {
  const { loadTestList, testList, schema, setSchema } = useStore();

  useEffect(() => {
    loadTestList();
  }, []);

  const allTests = testList.map((test) => ({
    value: test._id,
    label: `${test.name}${test.schemaId ? " (Attached)" : ""}`,
  }));
  // console.log(allTests);
  const handleChange = (e) => {
    setSchema("testId", e.target.value);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Test Selection</h3>
      <div className="grid grid-cols-1 gap-4">
        <SearchAndSelect
          label="Specific Test"
          name="testId"
          value={schema.testId}
          onChange={handleChange}
          options={allTests}
          placeholder="Select a test"
        />
      </div>
    </div>
  );
};

export default SelectTest;
