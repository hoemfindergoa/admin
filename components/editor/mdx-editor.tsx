import { useState, ChangeEvent } from "react";

type MdxEditorProps = {
  defaultValue?: string;
  onChange: (value: string) => void;
};

export default function MdxEditor({ defaultValue = "", onChange }: MdxEditorProps) {
  const [markdown, setMarkdown] = useState<string>(defaultValue);

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMarkdown(value);
    onChange(value);
  };

  return (
    <textarea
      className="w-full h-[900px] bg-zinc-900 text-white p-4 rounded-md font-mono"
      value={markdown}
      onChange={handleChange}
      placeholder="Write your blog in markdown..."
    />
  );
}
