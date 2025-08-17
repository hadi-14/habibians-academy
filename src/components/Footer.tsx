export default function Footer() {
    return (
        <footer className="w-full bg-primary-silver text-primary-blue font-body border-t-2 border-accent-navy">
            <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-4 gap-8 text-center md:text-left">
                {/* Academy Info */}
                <div>
                    <div className="font-heading font-bold text-xl mb-2">Habibians Academy</div>
                    <div className="text-sm mb-2">Empowering students to create, explore, and achieve their dreams.</div>
                    <div className="text-xs text-primary-blue/70">© 2025 Habibians Academy. All rights reserved.</div>
                </div>
                {/* Quick Links */}
                <div>
                    <div className="font-heading font-bold text-lg mb-2">Quick Links</div>
                    <ul className="space-y-1">
                        <li><a href="" className="hover:underline hover:text-accent-navy">Home</a></li>
                        <li><a href="#about" className="hover:underline hover:text-accent-navy">About</a></li>
                        <li><a href="#faculty" className="hover:underline hover:text-accent-navy">Faculty</a></li>
                        <li><a href="#reviews" className="hover:underline hover:text-accent-navy">Reviews</a></li>
                        <li><a href="#contact" className="hover:underline hover:text-accent-navy">Contact</a></li>
                        <li><a href="#faq" className="hover:underline hover:text-accent-navy">FAQ</a></li>
                    </ul>
                </div>
                {/* Contact Info */}
                <div>
                    <div className="font-heading font-bold text-lg mb-2">Contact</div>
                    <div className="text-sm">habibiansacademy@gmail.com</div>
                    <div className="text-sm">+92 345 2178 606</div>
                    <div className="text-sm">Suit 402, 4th Floor, Block 10 Gulshan-e-Iqbal, Nipa, Main, Main University Rd, Block 10 Gulshan-e-Iqbal, Karachi, 75300</div>
                </div>
                {/* Social Links */}
                <div>
                    <div className="font-heading font-bold text-lg mb-2">Follow Us</div>
                    <div className="flex flex-col items-center md:items-start gap-2 mt-2">
                        <a href="https://www.facebook.com/HabibiansAcademy/" aria-label="Facebook" className="flex items-center gap-2 hover:text-accent-navy px-2 py-1 rounded transition">
                            <svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M22 12c0-5.522-4.477-10-10-10S2 6.478 2 12c0 4.991 3.657 9.128 8.438 9.877v-6.987h-2.54v-2.89h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.242 0-1.632.771-1.632 1.562v1.875h2.773l-.443 2.89h-2.33v6.987C18.343 21.128 22 16.991 22 12z" />
                            </svg>
                            <span className="font-body text-primary-blue font-medium">Facebook</span>
                        </a>
                        <a href="#" aria-label="Instagram" className="flex items-center gap-2 hover:text-accent-navy px-2 py-1 rounded transition">
                            <svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.334 3.608 1.308.974.974 1.246 2.241 1.308 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.334 2.633-1.308 3.608-.974.974-2.241 1.246-3.608 1.308-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.334-3.608-1.308-.974-.974-1.246-2.241-1.308-3.608C2.175 15.647 2.163 15.267 2.163 12s.012-3.584.07-4.85c.062-1.366.334-2.633 1.308-3.608.974-.974 2.241-1.246 3.608-1.308C8.416 2.175 8.796 2.163 12 2.163zm0-2.163C8.741 0 8.332.013 7.052.072 5.771.131 4.659.425 3.678 1.406c-.981.981-1.275 2.093-1.334 3.374C2.013 8.332 2 8.741 2 12c0 3.259.013 3.668.072 4.948.059 1.281.353 2.393 1.334 3.374.981.981 2.093 1.275 3.374 1.334C8.332 23.987 8.741 24 12 24s3.668-.013 4.948-.072c1.281-.059 2.393-.353 3.374-1.334.981-.981 1.275-2.093 1.334-3.374.059-1.28.072-1.689.072-4.948 0-3.259-.013-3.668-.072-4.948-.059-1.281-.353-2.393-1.334-3.374-.981-.981-2.093-1.275-3.374-1.334C15.668.013 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 10.162a3.999 3.999 0 1 1 0-7.998 3.999 3.999 0 0 1 0 7.998zm6.406-11.845a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z" />
                            </svg>
                            <span className="font-body text-primary-blue font-medium">Instagram</span>
                        </a>
                        <a href="#" aria-label="YouTube" className="flex items-center gap-2 hover:text-accent-navy px-2 py-1 rounded transition">
                            <svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M23.498 6.186a2.994 2.994 0 0 0-2.112-2.112C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.386.574A2.994 2.994 0 0 0 .502 6.186C0 8.072 0 12 0 12s0 3.928.502 5.814a2.994 2.994 0 0 0 2.112 2.112C4.5 20.5 12 20.5 12 20.5s7.5 0 9.386-.574a2.994 2.994 0 0 0 2.112-2.112C24 15.928 24 12 24 12s0-3.928-.502-5.814zM9.75 15.5v-7l6.5 3.5-6.5 3.5z" />
                            </svg>
                            <span className="font-body text-primary-blue font-medium">YouTube</span>
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
