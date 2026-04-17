"use client"

export default function AuthFooter(){

    return(
       <div className="px-8 py-4 bg-gray-50 border-t border-gray-200">
        <div className="flex justify-between items-center">
            {/* logo */}
            <h1 className="text-gray-600 font-bold text-lg">
                Acadexis
            </h1>

            {/* Links */}
            <ul className="flex flex-col md:flex-row gap-4">
                <li className="text-sm text-gray-500 hover:text-green-500">Privacy Policy</li>
                <li className="text-sm text-gray-500 hover:text-green-500">Terms of Service</li>
                <li className="text-sm text-gray-500 hover:text-green-500">Support</li>
            </ul>

            {/* Copyright */}
           <p className="text-sm text-gray-500">© {new Date().getFullYear()} Acadexis. All rights reserved.</p>

        </div>
       </div>
    );
}