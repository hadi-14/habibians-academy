import Link from 'next/link';
import Image from 'next/image';

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 via-white to-accent-lightblue/30 px-4">
            <div className="flex flex-col items-center gap-6 bg-white/90 rounded-2xl shadow-2xl p-10 border-2 border-accent-lightblue max-w-lg mt-12">
                <Image src="/logo.svg" alt="404 Not Found" width={120} height={120} className="mb-2" />
                <h1 className="text-5xl font-heading font-bold text-accent-navy drop-shadow mb-2">404</h1>
                <h2 className="text-2xl font-heading font-bold text-primary-blue mb-2">Page Not Found</h2>
                <p className="text-primary-blue/80 font-body text-lg text-center mb-4">
                    Sorry, the page you are looking for does not exist or has been moved.
                </p>
                <Link href="/" className="mt-2 px-8 py-3 rounded-full bg-accent-lightblue text-primary-blue font-heading font-bold text-lg shadow-lg hover:bg-accent-navy hover:text-primary-white transition-colors">
                    Go Home
                </Link>
            </div>
        </div>
    );
}
