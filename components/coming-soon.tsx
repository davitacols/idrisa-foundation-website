// components/coming-soon.tsx
import { Construction } from "lucide-react";

export default function ComingSoon() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-gray-800">
      <Construction className="w-16 h-16 mb-4 text-yellow-500" />
      <h1 className="text-4xl font-bold mb-2">Coming Soon!</h1>
      <p className="text-lg text-center max-w-md">
        We're working hard to bring you this page. Stay tuned for something amazing!
      </p>
    </div>
  );
}
