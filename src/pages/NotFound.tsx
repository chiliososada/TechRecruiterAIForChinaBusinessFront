
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4 text-custom-blue-700">404</h1>
        <p className="text-2xl text-gray-600 mb-8 japanese-text">ページが見つかりませんでした</p>
        <Button asChild>
          <a href="/" className="inline-flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            <span className="japanese-text">ダッシュボードに戻る</span>
          </a>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
