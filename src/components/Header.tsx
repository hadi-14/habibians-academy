import Image from "next/image";
import Link from "next/link";

export default function Header() {
    return (
        <>
            <header className="w-full sticky top-0 left-0 z-50 py-4 px-8 bg-primary-blue/95 backdrop-blur-md text-primary-white font-heading text-xl flex items-center justify-between shadow-lg transition-all">
                <Link href="/" className="flex items-center gap-2">
                    <span className="p-1 flex items-center justify-center">
                        <Image src="/logo_bg.svg" alt="Logo" width={40} height={40} />
                    </span>
                    <span className="hidden sm:inline font-bold">Habibians&apos; Academy</span>
                </Link>
                <nav className="flex items-center gap-6">
                    <Link href="#groups" className="font-semibold hover:text-accent-lightblue transition-colors">Routes</Link>
                    <Link href="/student-portal/login" className="font-semibold hover:text-accent-lightblue transition-colors">Student Portal</Link>
                    <Link
                        href="/enroll"
                        className="ml-2 px-5 py-2 rounded-full bg-gradient-to-r from-accent-lightblue via-primary-white to-accent-lightblue text-primary-blue font-bold shadow-lg border-2 border-accent-lightblue animate-pulse hover:bg-accent-navy hover:text-primary-white hover:from-accent-navy hover:to-accent-navy transition-all duration-200"
                    >
                        Enroll Now
                    </Link>
                </nav>
            </header>
            {/* Sticky WhatsApp Button */}
            <a
                href="https://wa.me/923001234567?text=Hello%20Habibians%20Academy!%20I%20have%20a%20question."
                target="_blank"
                rel="noopener noreferrer"
                className="fixed bottom-6 right-6 z-[100] flex items-center gap-2 px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-2xl text-lg font-bold transition-all duration-300 animate-bounce-slow"
                style={{ boxShadow: '0 4px 24px 0 rgba(34,197,94,0.25)' }}
                aria-label="Contact us on WhatsApp"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24"><path fill="#fff" d="M12.04 2.003a9.97 9.97 0 0 0-8.5 15.3l-1.1 4.02a1 1 0 0 0 1.22 1.22l4.02-1.1a9.97 9.97 0 1 0 4.36-19.44Zm0 2a7.97 7.97 0 1 1 0 15.94c-1.3 0-2.57-.32-3.7-.93a1 1 0 0 0-.77-.07l-2.7.74.74-2.7a1 1 0 0 0-.07-.77A7.97 7.97 0 0 1 12.04 4.003Zm-2.1 4.1c-.2-.45-.4-.46-.58-.47l-.5-.01c-.17 0-.44.06-.67.3-.23.24-.88.86-.88 2.1 0 1.23.9 2.42 1.03 2.59.13.17 1.74 2.77 4.3 3.77.6.26 1.07.41 1.44.52.6.19 1.15.16 1.58.1.48-.07 1.48-.6 1.7-1.18.21-.58.21-1.08.15-1.18-.06-.1-.23-.16-.5-.28-.27-.12-1.48-.73-1.7-.81-.23-.08-.4-.12-.57.12-.17.24-.66.81-.81.98-.15.17-.3.18-.56.06-.27-.12-1.13-.42-2.15-1.34-.8-.71-1.34-1.59-1.5-1.86-.16-.27-.02-.41.1-.53.1-.1.23-.27.34-.4.12-.13.15-.23.23-.38.08-.15.04-.29-.01-.41-.05-.12-.5-1.23-.7-1.68Z" /></svg>
            </a>
        </>
    );
}