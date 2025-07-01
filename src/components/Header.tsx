'use client';
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function Header() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    // Handle scroll effect for header
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Prevent body scroll when menu is open
    useEffect(() => {
        if (menuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [menuOpen]);

    const closeMenu = () => setMenuOpen(false);

    return (
        <>
            <header className={`w-full sticky top-0 left-0 z-50 py-3 px-4 sm:px-8 font-heading text-xl flex items-center justify-between transition-all duration-300 ${isScrolled
                    ? 'bg-primary-blue/98 backdrop-blur-lg shadow-xl'
                    : 'bg-primary-blue/95 backdrop-blur-md shadow-lg'
                }`}>
                <Link href="/" className="flex items-center gap-2 z-60">
                    <span className="p-1 flex items-center justify-center">
                        <Image src="/logo_bg.svg" alt="Logo" width={40} height={40} className="sm:w-10 sm:h-10 w-8 h-8" />
                    </span>
                    <span className="hidden sm:inline font-bold text-primary-white text-lg sm:text-xl">
                        Habibians&apos; Academy
                    </span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-6">
                    <Link
                        href="#groups"
                        className="font-semibold text-primary-white hover:text-accent-lightblue transition-colors duration-200 relative group"
                    >
                        Courses
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent-lightblue transition-all duration-200 group-hover:w-full"></span>
                    </Link>
                    <Link
                        href="/student-portal/login"
                        className="font-semibold text-primary-white hover:text-accent-lightblue transition-colors duration-200 relative group"
                    >
                        Student Portal
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent-lightblue transition-all duration-200 group-hover:w-full"></span>
                    </Link>
                    <Link
                        href="/teacher-portal/login"
                        className="font-semibold text-primary-white hover:text-accent-lightblue transition-colors duration-200 relative group"
                    >
                        Teacher Portal
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent-lightblue transition-all duration-200 group-hover:w-full"></span>
                    </Link>
                    <Link
                        href="/enroll"
                        className="ml-2 px-5 py-2 rounded-full bg-gradient-to-r from-accent-lightblue via-primary-white to-accent-lightblue text-primary-blue font-bold shadow-lg border-2 border-accent-lightblue hover:scale-105 hover:shadow-xl transition-all duration-200"
                    >
                        Enroll Now
                    </Link>
                </nav>

                {/* Mobile Hamburger */}
                <button
                    className="md:hidden relative flex flex-col items-center justify-center w-12 h-12 rounded-full hover:bg-primary-blue/80 focus:outline-none focus:ring-2 focus:ring-accent-lightblue transition-all duration-200 z-60"
                    aria-label={menuOpen ? "Close menu" : "Open menu"}
                    onClick={() => setMenuOpen(!menuOpen)}
                >
                    <span
                        className={`block w-6 h-0.5 bg-white rounded transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : 'translate-y-0'
                            }`}
                    ></span>
                    <span
                        className={`block w-6 h-0.5 bg-white rounded transition-all duration-300 my-1 ${menuOpen ? 'opacity-0 scale-0' : 'opacity-100 scale-100'
                            }`}
                    ></span>
                    <span
                        className={`block w-6 h-0.5 bg-white rounded transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : 'translate-y-0'
                            }`}
                    ></span>
                </button>
            </header>

            {/* Mobile Menu Overlay */}
            <div
                className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-all duration-300 md:hidden ${menuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
                    }`}
                onClick={closeMenu}
            >
                {/* Mobile Menu Drawer */}
                <nav
                    className={`fixed top-0 right-0 w-80 max-w-[85vw] h-full bg-gradient-to-br from-primary-blue to-accent-navy shadow-2xl flex flex-col pt-24 px-6 transition-all duration-300 transform ${menuOpen ? 'translate-x-0' : 'translate-x-full'
                        }`}
                    onClick={e => e.stopPropagation()}
                >
                    {/* Decorative elements */}
                    <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-r from-accent-lightblue/20 to-transparent"></div>
                    <div className="absolute bottom-0 right-0 w-32 h-32 bg-accent-lightblue/10 rounded-full blur-xl"></div>

                    {/* Close button */}
                    <button
                        className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center text-white hover:bg-white/20 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent-lightblue"
                        aria-label="Close menu"
                        onClick={closeMenu}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    {/* Menu Items */}
                    <div className="flex flex-col space-y-6 relative z-10">
                        <div className="mb-4">
                            <h3 className="text-accent-lightblue font-bold text-sm uppercase tracking-wider mb-3">
                                Navigation
                            </h3>
                            <div className="w-12 h-0.5 bg-accent-lightblue/50"></div>
                        </div>

                        {/* Mobile Menu Items */}
                        <Link
                            href="#groups"
                            className="group flex items-center gap-3 font-semibold text-white hover:text-accent-lightblue transition-all duration-200 text-lg py-2 px-3 rounded-lg hover:bg-white/10"
                            onClick={closeMenu}
                        >
                            <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                            </svg>
                            Routes
                        </Link>
                        <Link
                            href="/student-portal/login"
                            className="group flex items-center gap-3 font-semibold text-white hover:text-accent-lightblue transition-all duration-200 text-lg py-2 px-3 rounded-lg hover:bg-white/10"
                            onClick={closeMenu}
                        >
                            <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Student Portal
                        </Link>
                        <Link
                            href="/teacher-portal/login"
                            className="group flex items-center gap-3 font-semibold text-white hover:text-accent-lightblue transition-all duration-200 text-lg py-2 px-3 rounded-lg hover:bg-white/10"
                            onClick={closeMenu}
                        >
                            <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c1.104 0 2-.896 2-2s-.896-2-2-2-2 .896-2 2 .896 2 2 2zm0 2c-2.21 0-4 1.79-4 4v1h8v-1c0-2.21-1.79-4-4-4z" />
                            </svg>
                            Teacher Portal
                        </Link>

                        <div className="pt-4">
                            <Link
                                href="/enroll"
                                className="flex items-center justify-center gap-2 w-full px-6 py-4 rounded-2xl bg-gradient-to-r from-accent-lightblue via-primary-white to-accent-lightblue text-primary-blue font-bold shadow-lg border-2 border-accent-lightblue hover:scale-105 hover:shadow-xl transition-all duration-200 text-lg"
                                onClick={closeMenu}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Enroll Now
                            </Link>
                        </div>

                        {/* Contact info */}
                        <div className="mt-8 pt-6 border-t border-white/20">
                            <p className="text-accent-lightblue text-sm font-medium mb-2">Need help?</p>
                            <p className="text-white/80 text-sm">Contact us on WhatsApp</p>
                        </div>
                    </div>
                </nav>
            </div>

            {/* Enhanced WhatsApp Button */}
            <a
                href="https://wa.me/923002662701?text=Hello%20Habibians%20Academy!%20I%20have%20a%20question."
                target="_blank"
                rel="noopener noreferrer"
                className="fixed bottom-6 right-6 z-[100] group flex items-center gap-2 px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-2xl text-base sm:text-lg font-bold transition-all duration-300 hover:scale-110"
                style={{
                    boxShadow: '0 8px 32px 0 rgba(34,197,94,0.3)',
                    animation: 'pulse 2s infinite'
                }}
                aria-label="Contact us on WhatsApp"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    className="sm:w-7 sm:h-7 group-hover:scale-110 transition-transform"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <path fill="#fff" d="M12.04 2.003a9.97 9.97 0 0 0-8.5 15.3l-1.1 4.02a1 1 0 0 0 1.22 1.22l4.02-1.1a9.97 9.97 0 1 0 4.36-19.44Zm0 2a7.97 7.97 0 1 1 0 15.94c-1.3 0-2.57-.32-3.7-.93a1 1 0 0 0-.77-.07l-2.7.74.74-2.7a1 1 0 0 0-.07-.77A7.97 7.97 0 0 1 12.04 4.003Zm-2.1 4.1c-.2-.45-.4-.46-.58-.47l-.5-.01c-.17 0-.44.06-.67.3-.23.24-.88.86-.88 2.1 0 1.23.9 2.42 1.03 2.59.13.17 1.74 2.77 4.3 3.77.6.26 1.07.41 1.44.52.6.19 1.15.16 1.58.1.48-.07 1.48-.6 1.7-1.18.21-.58.21-1.08.15-1.18-.06-.1-.23-.16-.5-.28-.27-.12-1.48-.73-1.7-.81-.23-.08-.4-.12-.57.12-.17.24-.66.81-.81.98-.15.17-.3.18-.56.06-.27-.12-1.13-.42-2.15-1.34-.8-.71-1.34-1.59-1.5-1.86-.16-.27-.02-.41.1-.53.1-.1.23-.27.34-.4.12-.13.15-.23.23-.38.08-.15.04-.29-.01-.41-.05-.12-.5-1.23-.7-1.68Z" />
                </svg>
            </a>

            <style jsx>{`
                @keyframes pulse {
                    0%, 100% {
                        transform: scale(1);
                    }
                    50% {
                        transform: scale(1.05);
                    }
                }
            `}</style>
        </>
    );
}