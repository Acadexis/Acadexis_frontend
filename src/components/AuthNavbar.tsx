import { CircleQuestionMark } from "lucide-react";


export default function AuthNavbar() {
    return(
        <div className="px-8 py-4 bg-white border-b border-gray-50">
        <div className="flex justify-between items-center">
              {/* logo */}
            <h1 className="text-gray-600 font-bold text-lg">
                Acadexis
            </h1>

            <CircleQuestionMark size={25} className="text-gray-900 font-light hover:text-green-500" />
        </div>
        </div>
    );
}