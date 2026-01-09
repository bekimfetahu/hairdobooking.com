// components/Footer.js
export default function Footer() {
    return (
        <footer className="bg-gray-100 text-gray-700 border-t border-gray-300">
            <div className="container mx-auto px-4 py-8">
                {/* Top Section */}
                <div className="flex flex-col md:flex-row justify-between items-center">
                    {/* Logo and Description */}
                    <div className="mb-6 md:mb-0 text-center md:text-left">
                        <h2 className="text-2xl font-bold text-gray-800">YourLogo</h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Crafting modern web solutions for your everyday needs.
                        </p>
                    </div>

                    {/* Social Media Links */}
                    <div className="flex space-x-4">
                        <a
                            href="https://facebook.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-500 hover:text-gray-800 transition duration-300"
                        >
                            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.988h-2.54V12h2.54V9.797c0-2.507 1.492-3.891 3.777-3.891 1.093 0 2.238.195 2.238.195v2.463h-1.26c-1.242 0-1.63.772-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                            </svg>
                        </a>
                        <a
                            href="https://twitter.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-500 hover:text-gray-800 transition duration-300"
                        >
                            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M19.633 7.997c.014.199.014.397.014.596 0 6.084-4.63 13.088-13.088 13.088A12.993 12.993 0 010 18.256c.478.056.957.084 1.435.084 1.081 0 2.124-.14 3.116-.394a9.24 9.24 0 01-7.797-8.8c.53.296 1.14.478 1.792.502a9.231 9.231 0 01-4.115-7.697c0-.038 0-.076.002-.114a9.228 9.228 0 004.173 1.166A9.226 9.226 0 01.926 1.763a26.196 26.196 0 0019.05 9.662A9.216 9.216 0 0116.01 8.1a18.42 18.42 0 005.717-1.966 9.256 9.256 0 01-2.93 3.791c2.03-.24 3.957-.779 5.679-1.56a19.763 19.763 0 01-4.843 5.032z" />
                            </svg>
                        </a>
                        <a
                            href="https://linkedin.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-500 hover:text-gray-800 transition duration-300"
                        >
                            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.761 0 5-2.239 5-5v-14c0-2.761-2.239-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.269c-.966 0-1.5-.7-1.5-1.5s.534-1.5 1.5-1.5c.965 0 1.5.7 1.5 1.5s-.535 1.5-1.5 1.5zm13.5 11.269h-3v-5.412c0-1.29-.026-2.949-1.798-2.949-1.799 0-2.075 1.407-2.075 2.864v5.497h-3v-10h2.839v1.364h.04c.396-.749 1.365-1.539 2.812-1.539 3.006 0 3.562 1.977 3.562 4.548v5.627z" />
                            </svg>
                        </a>
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="mt-8 text-sm text-center border-t border-gray-300 pt-4">
                    © {new Date().getFullYear()} YourCompany. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
