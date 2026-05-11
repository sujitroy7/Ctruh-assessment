"use client";

import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { Search } from "lucide-react";

interface SearchBarProps {
  defaultValue: string;
  onSearch: (q: string) => void;
}

export default function SearchBar({ defaultValue, onSearch }: SearchBarProps) {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const searchText = formData.get("search")?.toString() ?? "";
    onSearch(searchText);
  };

  return (
    <form className="flex gap-2" onSubmit={handleSubmit}>
      <Input
        name="search"
        type="text"
        placeholder="Search by name..."
        defaultValue={defaultValue}
        leftIcon={<Search className="w-4 h-4" />}
        size="lg"
      />
      <Button type="submit" size="lg" className="search-button-container shrink-0">
        Search
      </Button>
    </form>
  );
}
