import { Users } from "lucide-react";

export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="bg-primary p-1.5 rounded-md">
        <Users className="w-5 h-5 text-white" />
      </div>
      <span className="text-xl font-bold text-primary">MentorHub</span>
    </div>
  );
}
