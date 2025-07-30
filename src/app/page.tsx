'use client';
import CreativeDoodleBackground from '@/components/DoodleGenerator';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';

function AnimatedCounter({ target, duration = 1200, className = '', suffix = '' }: { target: number, duration?: number, className?: string, suffix?: string }) {
  const [count, setCount] = useState(0);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    let start: number | null = null;
    const animate = (timestamp: number) => {
      if (!start) start = timestamp;
      // Use requestAnimationFrame for smoothness, but update more frequently for priority
      const progress = Math.min((timestamp - start) / duration, 1);
      // Use ease-out for a snappier start
      const eased = 1 - Math.pow(1 - progress, 2);
      const value = Math.floor(eased * target);
      setCount(value);
      if (progress < 1) {
        // Use high-priority frame scheduling
        raf.current = window.requestAnimationFrame(animate);
      } else {
        setCount(target);
      }
    };
    raf.current = window.requestAnimationFrame(animate);
    return () => {
      if (raf.current) window.cancelAnimationFrame(raf.current);
    };
  }, [target, duration]);

  return <span className={className}>{count}{suffix}</span>;
}

export default function Home() {
  return (
    <div className="grid grid-rows-[auto_1fr_auto] items-center justify-items-center min-h-screen font-body overflow-x-hidden">
      <main className="flex flex-col items-center sm:items-start w-full">
        <div className="p-8 w-full relative" id="hero">

          <BackDesign>

            <CreativeDoodleBackground doodleCount={0} className="bg-primary-silver h-full w-full rounded-xl border-b-4 border-accent-navy">
              <section className="flex flex-col lg:flex-row items-center justify-between w-full gap-8 animate-fade-in shadow-lg p-8 md:p-12">
                <div className="flex-1 items-center justify-center">

                  <Image src="/logo.svg" alt="Logo" width={250} height={250} priority />
                </div>
                <div className="flex-1 flex flex-col items-start gap-6 w-full lg:w-auto">
                  <h1 className="text-4xl md:text-5xl font-heading font-bold text-primary-blue mb-2 animate-slide-in-left">
                    Habibians&apos; Academy
                  </h1>
                  <blockquote className="text-lg md:text-xl italic text-accent-navy border-l-4 border-accent-lightblue pl-4 animate-fade-in delay-200">
                    &quot;Inclusive, Inspired, Inimitable.&quot;
                  </blockquote>
                  <a href="/enroll" className="mt-4 inline-block px-8 py-3 rounded-full bg-accent-lightblue text-primary-blue font-heading font-bold text-lg shadow-lg hover:bg-accent-navy hover:text-primary-white transition-colors animate-fade-in delay-300">
                    Enroll Now
                  </a>
                  <a href="/courses" className="mt-2 ml-2 inline-block px-6 py-2 rounded-full bg-primary-blue text-primary-white font-heading font-bold text-base shadow hover:bg-accent-navy transition-colors animate-fade-in delay-400">
                    View Courses
                  </a>
                </div>
                <div className="flex-1 flex items-center justify-center w-full lg:w-auto">
                  <div className="relative w-full max-w-md aspect-video rounded-xl overflow-hidden shadow-lg ring-4 ring-accent-lightblue ring-offset-4 ring-offset-primary-silver transition-all duration-500 hover:scale-105 hover:ring-accent-navy group">
                    <iframe
                      className="w-full h-full group-hover:shadow-2xl group-hover:brightness-110 transition-all duration-500"
                      src="https://www.youtube.com/embed/AX5YVfVUHOs"
                      title="Intro Video"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                    <span className="absolute inset-0 rounded-xl ring-4 ring-accent-lightblue opacity-40 animate-pulse pointer-events-none"></span>
                  </div>
                </div>
              </section>
            </CreativeDoodleBackground>

          </BackDesign>
        </div>

        {/* Stats Ribbon Section */}
        <section className="w-full max-w-6xl mx-auto -mt-12 md:-mt-8 flex flex-col items-center px-8 md:px-12" id="stats">
          <div className="w-full bg-accent-navy text-primary-white rounded-b-2xl shadow-lg flex flex-wrap justify-around items-center py-6 px-2 sm:px-4 gap-4 sm:gap-6 animate-fade-in">
            <div className="flex flex-col items-center flex-1 min-w-[120px] animate-bounce-slow">
              <AnimatedCounter target={1000} duration={1200} className="text-xl sm:text-2xl md:text-3xl font-heading font-bold" suffix="+" />
              <span className="text-xs sm:text-sm md:text-base opacity-80">Students</span>
            </div>
            <span className="hidden sm:inline-block w-px h-8 bg-primary-white opacity-30"></span>
            <div className="flex flex-col items-center flex-1 min-w-[120px] animate-bounce-slow delay-100">
              <AnimatedCounter target={100} duration={1000} className="text-xl sm:text-2xl md:text-3xl font-heading font-bold" suffix="+" />
              <span className="text-xs sm:text-sm md:text-base opacity-80">Teachers</span>
            </div>
            <span className="hidden sm:inline-block w-px h-8 bg-primary-white opacity-30 delay-200"></span>
            <div className="flex flex-col items-center flex-1 min-w-[120px] animate-bounce-slow delay-200">
              <AnimatedCounter target={10} duration={800} className="text-xl sm:text-2xl md:text-3xl font-heading font-bold" suffix="+" />
              <span className="text-xs sm:text-sm md:text-base opacity-80">Courses</span>
            </div>
            <span className="hidden sm:inline-block w-px h-8 bg-primary-white opacity-30 delay-300"></span>
            <div className="flex flex-col items-center flex-1 min-w-[120px] animate-bounce-slow delay-300">
              <AnimatedCounter target={11} duration={900} className="text-xl sm:text-2xl md:text-3xl font-heading font-bold" suffix=" Years+" />
              <span className="text-xs sm:text-sm md:text-base opacity-80">Experience</span>
            </div>
          </div>
        </section>

        {/* Who We Are + Mission/Vision/History Section */}
        <section
          className="w-full px-10 items-center justify-center my-12"
          id="about"
        >
          <div className="bg-gradient-to-br from-primary-silver via-primary-white to-accent-lightblue rounded-2xl shadow-xl p-8 md:p-12 animate-fade-in min-h-[400px] border-t-4 border-accent-lightblue w-full">

            <div className="flex flex-col md:flex-row gap-8 pb-8 px-8">
              <div className="flex-none flex items-center justify-center min-w-[120px] md:mr-10">
                <Image src="/logo.svg" alt="Logo" width={150} height={150} priority />
              </div>
              <div className="flex-1 flex flex-col items-start gap-6 md:ml-12">
                <div>
                  <h2 className="text-2xl md:text-3xl font-heading font-bold text-primary-blue mb-2 drop-shadow">Who we are?</h2>
                  <p className="text-base md:text-xl font-body text-primary-blue/80 leading-snug">
                    A group educationists with an ardent desire to evolve the educational system to its complete potential and go further beyond in the pursuit of educational excellence. Accessibility, empowerment and inclusivity is what we yearn to offer to any and every learner we come across.
                  </p>
                </div>
              </div>
            </div>
            <div className="w-full flex flex-col md:flex-row items-stretch justify-center gap-6 bg-primary-white/80 rounded-xl shadow-lg p-4 md:p-8 border-l-4 border-accent-navy">
              <div className="flex-1 flex flex-col items-start gap-3 border-r border-primary-silver pr-8 last:border-none">
                <h3 className="text-xl md:text-2xl font-heading font-bold text-primary-blue underline underline-offset-4 decoration-accent-lightblue mb-2">Our Mission</h3>
                <p className="text-base md:text-lg font-body text-primary-blue/80 leading-snug">
                  To go beyond the current practices and provide a platform integrated towards a 21st century learner while catering to all educational needs.
                </p>
              </div>
              <div className="flex-1 flex flex-col items-start gap-3 border-r border-primary-silver pr-8 last:border-none">
                <h3 className="text-xl md:text-2xl font-heading font-bold text-primary-blue underline underline-offset-4 decoration-accent-lightblue mb-2">Our Vision</h3>
                <p className="text-base md:text-lg font-body text-primary-blue/80 leading-snug">
                  To leave no enthusiastic learner without the accessibility of modern education..
                </p>
              </div>
              <div className="flex-1 flex flex-col items-start gap-3">
                <h3 className="text-xl md:text-2xl font-heading font-bold text-primary-blue underline underline-offset-4 decoration-accent-lightblue mb-2">Our History</h3>
                <p className="text-base md:text-lg font-body text-primary-blue/80 leading-snug">
                  Teaching from <span className="font-bold underline decoration-accent-lightblue">2014</span>, we have grown from a small group of passionate educators to a thriving community making a difference every day.
                </p>
              </div>
            </div>
            {/* Founder Message Section */}
            <section
              className="w-full flex flex-col md:flex-row items-center gap-8 mt-10 bg-gradient-to-r from-blue-50 via-white to-accent-lightblue/20 rounded-2xl shadow-lg p-6 md:p-10 border-t-4 border-accent-navy"
              id="founder"
            >
              <div className="flex-1 flex flex-col items-start">
                <h3 className="text-2xl md:text-3xl font-heading font-bold text-primary-blue mb-2">Message from the Founder</h3>
                <p className="text-base md:text-lg font-body text-primary-blue/80 mb-4">
                  &quot;The tides of the modern era have been at our shore for long enough, and its time we adapted our education with them like we have with everything else. Only then can we excel beyond what we currently are.&quot;
                </p>
                <div className="mt-2 font-heading font-bold text-accent-navy">- Sir Abdul Samad, Founder & Educationist</div>
              </div>
              <div className="flex-1 flex items-center justify-center w-full max-w-lg">
                <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-lg ring-4 ring-accent-lightblue ring-offset-4 ring-offset-blue-50 transition-all duration-500 hover:scale-105 hover:ring-accent-navy group bg-white flex items-center justify-center">
                  <Image
                    src="/Faculty/founder.jpg"
                    alt="Founder Image"
                    width={400}
                    height={225}
                    className="object-cover w-full h-full group-hover:shadow-2xl group-hover:brightness-110 transition-all duration-500"
                    priority
                  />
                  <span className="absolute inset-0 rounded-xl ring-4 ring-accent-lightblue opacity-40 animate-pulse pointer-events-none"></span>
                </div>
              </div>
            </section>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section
          className="relative w-full max-w-none py-0 my-0"
          id="why"
        >
          <div className="absolute inset-0 w-full h-full z-0">
            <Image src="/bg-teaching.jpg" alt="Background Globe" fill className="object-cover w-full h-full opacity-60" style={{ zIndex: 0 }} priority />
            <div className="absolute inset-0 bg-accent-navy/60 mix-blend-multiply" style={{ zIndex: 1 }}></div>
          </div>
          <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8 bg-gradient-to-tr from-accent-lightblue/80 via-primary-white/90 to-primary-silver/80 rounded-2xl shadow-2xl p-4 sm:p-6 md:p-12 mt-8 md:mt-12 border-b-4 border-accent-navy">
            <div className="absolute -top-8 md:-top-10 left-1/2 -translate-x-1/2 w-fit px-4 md:px-8 py-2 rounded-full bg-primary-white/90 shadow-lg border-2 border-accent-lightblue z-20">
              <h2 className="text-lg sm:text-xl md:text-2xl font-heading font-bold text-primary-blue tracking-wide text-center">Why Choose Us?</h2>
            </div>
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8 mt-8 md:mt-0 w-full">
              <div className="flex flex-col items-start">
                <span className="text-base sm:text-lg md:text-2xl font-heading font-bold text-primary-blue mb-1">1. Free trial</span>
                <span className="text-xs sm:text-sm md:text-base font-body text-primary-blue/80">Experience our platform with no commitment.</span>
              </div>
              <div className="flex flex-col items-start">
                <span className="text-base sm:text-lg md:text-2xl font-heading font-bold text-primary-blue mb-1">2. Remote learning</span>
                <span className="text-xs sm:text-sm md:text-base font-body text-primary-blue/80">Accessibility and student comfort.</span>
              </div>
              <div className="flex flex-col items-start">
                <span className="text-base sm:text-lg md:text-2xl font-heading font-bold text-primary-blue mb-1">3. Interactive Classes</span>
                <span className="text-xs sm:text-sm md:text-base font-body text-primary-blue/80">Engage with teachers and peers in real time.</span>
              </div>
              <div className="flex flex-col items-start">
                <span className="text-base sm:text-lg md:text-2xl font-heading font-bold text-primary-blue mb-1">4. Certified Teachers</span>
                <span className="text-xs sm:text-sm md:text-base font-body text-primary-blue/80">Learn from experienced, qualified educators.</span>
              </div>
            </div>
            <div className="flex-none flex items-center justify-center min-w-[100px] sm:min-w-[140px] md:min-w-[180px] md:ml-8 mt-8 md:mt-0">
              <Image src="/student-placeholder.avif" alt="Students" width={120} height={150} className="object-cover rounded-2xl shadow-lg border-4 border-accent-lightblue bg-primary-silver w-[100px] h-[120px] sm:w-[140px] sm:h-[180px] md:w-[180px] md:h-[220px]" priority />
            </div>
          </div>

          {/* Major Groups Section */}
          <section
            className="w-full max-w-7xl mx-auto mt-10 md:mt-16 mb-8 px-2 sm:px-4 py-8 sm:py-12 rounded-2xl shadow-xl bg-gradient-to-br from-primary-silver via-primary-white to-accent-lightblue border-t-4 border-accent-navy animate-fade-in z-10 relative"
            id="groups"
          >
            <h2 className="text-xl sm:text-2xl md:text-3xl font-heading font-bold text-primary-blue text-center mb-6 sm:mb-10 drop-shadow">Available Boards</h2>
            <div className="flex flex-col md:flex-row gap-6 md:gap-10 justify-center items-stretch">
              {/* Cambridge Board */}
              <div className="flex-1 flex flex-col items-center bg-primary-white/80 rounded-xl shadow-lg p-4 sm:p-6 border-2 border-accent-lightblue mb-4 md:mb-0">
                <div className="w-20 h-20 sm:w-28 sm:h-28 mb-4 rounded-full overflow-hidden border-4 border-accent-navy bg-primary-silver flex items-center justify-center">
                  <Image src="/affiliates/CAIE.jpg" alt="Cambridge Board" width={80} height={80} className="object-cover w-full h-full sm:w-[100px] sm:h-[100px]" />
                </div>
                <h3 className="text-base sm:text-lg md:text-xl font-heading font-bold text-primary-blue mb-2">Cambridge Board</h3>
                <p className="text-primary-blue/80 font-body text-xs sm:text-sm md:text-base mb-2 text-center">
                  Cambridge Assessment International Education. Globally recognized, wide range of subjects for O/A Levels.
                </p>
                <a href="/courses" className="mt-2 px-6 py-2 rounded-full bg-accent-lightblue text-primary-blue font-heading font-bold text-sm shadow hover:bg-accent-navy hover:text-primary-white transition-colors">
                  View Courses
                </a>
              </div>
              {/* Aga Khan Board */}
              <div className="flex-1 flex flex-col items-center bg-primary-white/80 rounded-xl shadow-lg p-4 sm:p-6 border-2 border-accent-lightblue mb-4 md:mb-0">
                <div className="w-20 h-20 sm:w-28 sm:h-28 mb-4 rounded-full overflow-hidden border-4 border-accent-navy bg-primary-silver flex items-center justify-center">
                  <Image src="/affiliates/AKU.jpg" alt="Aga Khan Board" width={80} height={80} className="object-cover w-full h-full sm:w-[100px] sm:h-[100px]" />
                </div>
                <h3 className="text-base sm:text-lg md:text-xl font-heading font-bold text-primary-blue mb-2">Aga Khan Board</h3>
                <p className="text-primary-blue/80 font-body text-xs sm:text-sm md:text-base mb-2 text-center">
                  Aga Khan University Examination Board. Modern, skill-based curriculum for Pakistani students.
                </p>
                <a href="/courses" className="mt-2 px-6 py-2 rounded-full bg-accent-lightblue text-primary-blue font-heading font-bold text-sm shadow hover:bg-accent-navy hover:text-primary-white transition-colors">
                  View Courses
                </a>
              </div>
              {/* IDBP Board */}
              <div className="flex-1 flex flex-col items-center bg-primary-white/80 rounded-xl shadow-lg p-4 sm:p-6 border-2 border-accent-lightblue mb-4 md:mb-0">
                <div className="w-20 h-20 sm:w-28 sm:h-28 mb-4 rounded-full overflow-hidden border-4 border-accent-navy bg-primary-silver flex items-center justify-center">
                  <Image src="/affiliates/ibdp.jpg" alt="IDBP Board" width={80} height={80} className="object-cover w-full h-full sm:w-[100px] sm:h-[100px]" />
                </div>
                <h3 className="text-base sm:text-lg md:text-xl font-heading font-bold text-primary-blue mb-2">IBDP Board</h3>
                <p className="text-primary-blue/80 font-body text-xs sm:text-sm md:text-base mb-2 text-center">
                  The International Baccalaureate Diploma Programme (IBDP) - IBDP. National board offers four high quality international education programmes.
                </p>
                <a href="/courses" className="mt-2 px-6 py-2 rounded-full bg-accent-lightblue text-primary-blue font-heading font-bold text-sm shadow hover:bg-accent-navy hover:text-primary-white transition-colors">
                  View Courses
                </a>
              </div>
            </div>
          </section>
        </section>

        {/* Meet Our Faculty Section (Carousel) */}
        <section id="faculty" className='w-full'>
          <FacultyCarousel />
        </section>
        <section id="testimonials" className='w-full'>
          <TestimonialsSection />
        </section>
        <section id="contact" className='w-full'>
          <ContactAndFAQSection />
        </section>
      </main>
    </div>
  );
}

function FacultyCarousel() {
  const faculty = [
    { name: 'Revealing Soon!', subject: 'English', role: 'Senior Lecturer', img: '/Faculty/Man.png' },
    { name: 'Revealing Soon!', subject: 'Urdu', role: 'Lecturer', img: '/Faculty/Woman.png' },
    { name: 'Revealing Soon!', subject: 'Islamiat', role: 'Lecturer', img: '/Faculty/Man.png' },
    { name: 'Revealing Soon!', subject: 'Pakistan Studies', role: 'Lecturer', img: '/Faculty/Woman.png' },
    { name: 'Revealing Soon!', subject: 'Physics', role: 'Head of Science', img: '/Faculty/Man.png' },
    { name: 'Revealing Soon!', subject: 'Biology', role: 'Lecturer', img: '/Faculty/Woman.png' },
    { name: 'Revealing Soon!', subject: 'Chemistry', role: 'Lecturer', img: '/Faculty/Man.png' },
    { name: 'Revealing Soon!', subject: 'Computer Science', role: 'Lecturer', img: '/Faculty/Woman.png' },
    { name: 'Revealing Soon!', subject: 'Maths', role: 'Lecturer', img: '/Faculty/Man.png' },
    { name: 'Revealing Soon!', subject: 'Business Maths', role: 'Lecturer', img: '/Faculty/Woman.png' },
    { name: 'Revealing Soon!', subject: 'Accounts', role: 'Lecturer', img: '/Faculty/Man.png' },
    { name: 'Revealing Soon!', subject: 'Economics', role: 'Lecturer', img: '/Faculty/Woman.png' },
  ];

  const CARD_COUNT = 5;
  const [currentIndex, setCurrentIndex] = useState(0);

  // Utility to wrap around index
  const mod = (n: number, m: number) => ((n % m) + m) % m;

  const handlePrev = () => {
    setCurrentIndex(prev => mod(prev - 1, faculty.length));
  };

  const handleNext = () => {
    setCurrentIndex(prev => mod(prev + 1, faculty.length));
  };

  const getVisibleCards = () => {
    return Array.from({ length: CARD_COUNT }, (_, i) => {
      const offset = i - Math.floor(CARD_COUNT / 2);
      const index = mod(currentIndex + offset, faculty.length);
      return {
        ...faculty[index],
        index,
        position: offset,
      };
    });
  };

  const visibleCards = getVisibleCards();

  return (
    <div className="w-full flex flex-col items-center bg-gradient-to-br from-blue-50 to-indigo-50 py-12 rounded-2xl">
      <h2 className="text-2xl md:text-3xl font-heading font-bold text-primary-blue text-center mb-8 drop-shadow animate-bounce">Meet Our Faculty</h2>

      <div className="relative w-full max-w-6xl mx-auto px-4">
        <button
          onClick={handlePrev}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-30 bg-white/90 hover:bg-blue-100 text-blue-600 rounded-full shadow-lg p-4 transition-all duration-300 hover:scale-110 group"
        >
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24" className="group-hover:-translate-x-1 transition-transform duration-200">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <button
          onClick={handleNext}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-30 bg-white/90 hover:bg-blue-100 text-blue-600 rounded-full shadow-lg p-4 transition-all duration-300 hover:scale-110 group"
        >
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24" className="group-hover:translate-x-1 transition-transform duration-200">
            <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div className="flex justify-center items-stretch gap-6 py-8 min-h-[400px] relative overflow-hidden">
          {visibleCards.map((card) => {
            const offset = card.position;
            const isCenter = offset === 0;
            const isSide = Math.abs(offset) === 1;
            const isEnd = Math.abs(offset) === 2;
            // Opacity: center 1, side 0.9, end 0.7
            let opacity = 0.7;
            if (isCenter) opacity = 1;
            else if (isSide) opacity = 0.9;
            // zIndex: center 10, side 8, end 5
            let zIndex = 5;
            if (isCenter) zIndex = 10;
            else if (isSide) zIndex = 8;
            // X offset: side 200, end 120
            const transformX = offset * (isEnd ? 120 : 200);
            // Y offset: end cards move up a bit
            const transformY = isEnd ? -30 : 0;
            // Animation for end cards (fade out when leaving), no border transition
            const fadeClass = isEnd ? 'transition-opacity duration-500 ease-in-out border-gray-200' : '';

            const scale = isCenter ? 1.1 : 0.9;

            return (
              <div
                key={`${card.name}-${card.index}`}
                className={`absolute will-change-transform transition-all duration-500 ease-in-out flex flex-col items-center ${fadeClass}`}
                style={{
                  transform: `translateX(${transformX}px) translateY(${transformY}px) scale(${scale})`,
                  opacity,
                  zIndex,
                }}
              >
                <div className={`bg-white rounded-2xl shadow-xl overflow-hidden w-72 h-80 flex flex-col items-center justify-center p-6 border ${isCenter ? 'border-blue-200' : 'border-gray-200'} hover:shadow-2xl transition-all duration-500`}>
                  {isCenter && <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 pointer-events-none" />}
                  <div className={`relative rounded-full overflow-hidden mb-4 shadow-inner ${isCenter ? 'w-24 h-24 border-4 border-blue-200' : 'w-20 h-20 border-2 border-gray-200'} transition-all duration-500`}>
                    <Image
                      src={card.img}
                      alt={card.name}
                      width={isCenter ? 96 : 80}
                      height={isCenter ? 96 : 80}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="text-center space-y-2 relative z-10">
                    <h3 className={`${isCenter ? 'text-xl' : 'text-lg'} font-bold text-gray-800`}>{card.name}</h3>
                    <p className={`${isCenter ? 'text-lg' : 'text-base'} font-medium text-blue-600`}>{card.subject}</p>
                    <p className={`${isCenter ? 'text-base' : 'text-sm'} text-gray-600`}>{card.role}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Updated TestimonialsSection with carousel functionality
function TestimonialsSection() {
  const testimonials = [
    {
      name: 'Sumit Ahuja',
      img: '/Faculty/sumit.jpg',
      text: 'I’m Sumit Ahuja, now a proud student at DePaul University, Chicago. When I was overwhelmed and unsure of my academic path, Habibians’ Academy offered not just answers, but unwavering support that led me to where I am today.',
      group: 'Commerce',
    },
    {
      name: 'Unaiz Damani',
      img: '/Faculty/Man.png',
      text: 'Greetings, my name is Unaiz Damani and I am currently a student at DePaul University in Chicago. I would like to express my gratitude to Habibians’ Academy in my journey to this milestone due to their sincere efforts and expert faculty.',
      group: 'Pre-Medical',
    },
    {
      name: 'Farheen Asif',
      img: '/Faculty/Woman.png',
      text: 'Salutations, I am Farheen Asif and I am at DePaul University, Chicago. Habibians’ Academy was there when I was lost in my academic search and it cleared my confusion beyond any doubt.',
      group: 'Pre-Engineering',
    }
  ];

  const CARD_COUNT = 3; // Show 3 testimonials at once
  const [currentIndex, setCurrentIndex] = useState(0);

  // Utility to wrap around index
  const mod = (n: number, m: number) => ((n % m) + m) % m;

  const handlePrev = () => {
    setCurrentIndex(prev => mod(prev - 1, testimonials.length));
  };

  const handleNext = () => {
    setCurrentIndex(prev => mod(prev + 1, testimonials.length));
  };

  const getVisibleCards = () => {
    return Array.from({ length: CARD_COUNT }, (_, i) => {
      const offset = i - Math.floor(CARD_COUNT / 2);
      const index = mod(currentIndex + offset, testimonials.length);
      return {
        ...testimonials[index],
        index,
        position: offset,
      };
    });
  };

  const visibleCards = getVisibleCards();

  return (
    <section className="w-full max-w-6xl mx-auto mt-16 mb-12 px-4 py-16 bg-gradient-to-br from-blue-100 via-blue-200 to-indigo-100 border-t-4 border-accent-navy rounded-2xl shadow-2xl animate-fade-in flex flex-col items-center relative overflow-hidden">
      {/* Decorative background SVG */}
      <svg className="absolute top-0 left-0 w-1/2 h-1/2 opacity-20 pointer-events-none" viewBox="0 0 400 400" fill="none">
        <circle cx="200" cy="200" r="180" fill="#3B82F6" />
      </svg>
      <svg className="absolute bottom-0 right-0 w-1/3 h-1/3 opacity-10 pointer-events-none" viewBox="0 0 200 200" fill="none">
        <rect x="20" y="20" width="160" height="160" rx="60" fill="#6366F1" />
      </svg>

      <h2 className="text-3xl md:text-4xl font-heading font-bold text-primary-blue text-center mb-12 drop-shadow-lg tracking-tight z-10 animate-bounce">What Our Students Say</h2>

      <div className="relative w-full max-w-5xl mx-auto">
        {/* Left Arrow */}
        <button
          onClick={handlePrev}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-30 bg-white/90 hover:bg-blue-100 text-blue-600 rounded-full shadow-lg p-4 transition-all duration-300 hover:scale-110 group"
        >
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24" className="group-hover:-translate-x-1 transition-transform duration-200">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* Right Arrow */}
        <button
          onClick={handleNext}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-30 bg-white/90 hover:bg-blue-100 text-blue-600 rounded-full shadow-lg p-4 transition-all duration-300 hover:scale-110 group"
        >
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24" className="group-hover:translate-x-1 transition-transform duration-200">
            <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* Testimonials Carousel */}
        <div className="flex justify-center items-stretch gap-8 py-8 min-h-[600px] relative overflow-hidden">
          {visibleCards.map((testimonial) => {
            const offset = testimonial.position;
            const isCenter = offset === 0;

            // Opacity: center 1, side 0.8
            const opacity = isCenter ? 1 : 0.8;
            // zIndex: center 10, side 8
            const zIndex = isCenter ? 10 : 8;
            // X offset: side cards move 300px left/right
            const transformX = offset * 300;
            // Scale: center 1.05, side 0.9
            const scale = isCenter ? 1.05 : 0.9;

            return (
              <div
                key={`${testimonial.name}-${testimonial.index}`}
                className="absolute will-change-transform transition-all duration-500 ease-in-out"
                style={{
                  transform: `translateX(${transformX}px) scale(${scale})`,
                  opacity,
                  zIndex,
                }}
              >
                <div className={`relative bg-white/90 rounded-2xl shadow-xl p-8 border-2 ${isCenter ? 'border-blue-400' : 'border-blue-200'} flex flex-col items-center gap-6 group hover:shadow-2xl hover:border-blue-400 transition-all duration-500 w-[420px] h-[480px]`}>
                  {/* Decorative quote mark */}
                  <span className="absolute -top-4 left-4 text-5xl text-blue-300/60 font-serif select-none z-0">&quot;</span>

                  {/* Center highlight effect */}
                  {isCenter && <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 pointer-events-none rounded-2xl" />}

                  <div className="flex-shrink-0 relative z-10">
                    <div className={`rounded-full overflow-hidden ${isCenter ? 'border-4 border-blue-400' : 'border-2 border-blue-300'} shadow-md bg-blue-100 transition-all duration-500`}>
                      <Image
                        src={testimonial.img}
                        alt={testimonial.name}
                        width={isCenter ? 100 : 80}
                        height={isCenter ? 100 : 80}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col items-center text-center relative z-10">
                    <p className={`text-primary-blue/90 font-body ${isCenter ? 'text-lg' : 'text-base'} mb-4 leading-relaxed italic transition-all duration-500`}>
                      {testimonial.text}
                    </p>

                    <div className="mt-auto flex flex-col items-center gap-2">
                      <span className={`font-heading font-bold text-blue-700 ${isCenter ? 'text-xl' : 'text-lg'} transition-all duration-500`}>
                        {testimonial.name}
                      </span>
                      <span className={`bg-blue-200 text-blue-800 rounded-full px-3 py-1 font-body shadow ${isCenter ? 'text-sm' : 'text-xs'} transition-all duration-500`}>
                        {testimonial.group}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Dots indicator */}
        <div className="flex justify-center gap-2 mt-6 z-10 relative">
          {testimonials.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${idx === currentIndex
                ? 'bg-blue-600 w-8'
                : 'bg-blue-300 hover:bg-blue-400'
                }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
// --- Combined Contact & FAQ Section ---
function ContactAndFAQSection() {
  const faqs = [
    {
      q: 'How do I enroll at Habibians Academy?',
      a: 'Click the "Enroll Now" button at the top or contact us using the form below. We will guide you through the process.',
    },
    {
      q: 'Are there free trial classes?',
      a: 'Yes! We offer free trial classes so you can experience our teaching style before committing.',
    },
    {
      q: 'What boards do you prepare students for?',
      a: 'We primarily prepare students for AKU-EB, but our teaching also helps for other boards.',
    },
    {
      q: 'Do you offer online classes?',
      a: 'Yes, we offer both in-person and online classes for most subjects and groups.',
    },
    {
      q: 'How can I contact a specific teacher?',
      a: 'You can request a meeting with any faculty member through our contact form or at the front desk.',
    },
  ];
  return (
    <section className="w-full max-w-6xl mx-auto my-16 p-0 md:p-8">
      <div className="w-full flex flex-col gap-8">
        <div className="text-center mb-2">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-primary-blue mb-2 drop-shadow-lg tracking-tight">
            Have a Question?
          </h2>
          <p className="text-lg md:text-xl text-primary-blue/80 font-body">
            Check our <span className="font-bold text-accent-navy">Frequently Asked Questions</span> below.<br />
            If you still need help, contact us!
          </p>
        </div>
        <div className="flex flex-col md:flex-row gap-8">
          {/* FAQ Card - wider, no heading */}
          <div className="flex-[1.4] bg-gradient-to-br from-accent-navy/10 via-primary-white to-accent-lightblue/10 border-2 border-accent-navy rounded-2xl shadow-xl p-6 md:p-10 flex flex-col transition-all duration-300">
            <div className="flex flex-col gap-4">
              {faqs.map((faq, idx) => (
                <details
                  key={idx}
                  className="group bg-primary-silver/40 rounded-lg border border-accent-lightblue px-4 py-3 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg relative overflow-hidden"
                >
                  <summary className="font-heading text-lg md:text-xl text-primary-blue font-bold cursor-pointer flex items-center justify-between transition-colors duration-200 group-hover:text-accent-navy outline-none focus:outline-none">
                    {faq.q}
                    <span className="ml-2 text-accent-navy group-open:rotate-90 transition-transform duration-300">▶</span>
                  </summary>
                  <div
                    className="faq-answer transition-all duration-500 bg-primary-silver/40 rounded mt-2 px-2 py-2 text-primary-blue/90 font-body text-base md:text-lg"
                    style={{
                      maxHeight: '1000px',
                      overflow: 'hidden',
                      transition: 'max-height 0.35s cubic-bezier(0.4,0,0.2,1), padding 0.35s cubic-bezier(0.4,0,0.2,1)',
                    }}
                  >
                    {faq.a}
                  </div>
                  <style jsx>{`
                    details .faq-answer {
                      max-height: 0;
                      padding-top: 0;
                      padding-bottom: 0;
                      opacity: 0;
                    }
                    details[open] .faq-answer {
                      max-height: 200px;
                      padding-top: 0.5rem;
                      padding-bottom: 0.5rem;
                      opacity: 1;
                    }
                  `}</style>
                </details>
              ))}
            </div>
          </div>
          {/* Divider for desktop */}
          <div className="hidden md:flex flex-col justify-center items-center px-2">
            <div className="w-1 h-40 bg-accent-lightblue rounded-full opacity-60"></div>
            <span className="mt-2 text-accent-navy font-heading font-bold">OR</span>
          </div>
          {/* Contact Card */}
          <div className="flex-1 bg-gradient-to-br from-primary-silver/60 via-white to-accent-lightblue/30 border-2 border-accent-lightblue rounded-2xl shadow-xl p-6 md:p-8 flex flex-col">
            <h3 className="text-2xl font-heading font-bold text-primary-blue mb-4">Contact Us</h3>
            <p className="text-primary-blue/80 font-body text-base mb-4">
              Still have a question? Reach out and we’ll get back to you as soon as possible!
            </p>
            <form className="w-full flex flex-col gap-4" style={{ maxWidth: '400px' }}>
              <div className="flex flex-col gap-1">
                <label htmlFor="name" className="font-heading text-primary-blue font-bold">Name</label>
                <input id="name" name="name" type="text" required className="rounded-lg border border-primary-silver px-4 py-2 font-body focus:outline-none focus:ring-2 focus:ring-accent-lightblue bg-white" />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="email" className="font-heading text-primary-blue font-bold">Email</label>
                <input id="email" name="email" type="email" required className="rounded-lg border border-primary-silver px-4 py-2 font-body focus:outline-none focus:ring-2 focus:ring-accent-lightblue bg-white" />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="message" className="font-heading text-primary-blue font-bold">Message</label>
                <textarea id="message" name="message" rows={3} required className="rounded-lg border border-primary-silver px-4 py-2 font-body focus:outline-none focus:ring-2 focus:ring-accent-lightblue bg-white" />
              </div>
              <button type="submit" className="mt-2 px-8 py-3 rounded-full bg-accent-lightblue text-primary-blue font-heading font-bold text-lg shadow-lg hover:bg-accent-navy hover:text-primary-white transition-colors">Send Message</button>
            </form>
            <div className="mt-6 text-primary-blue/80 font-body space-y-2 text-sm">
              <div><span className="font-bold">Email:</span> habibiansacademy@gmail.com</div>
              <div><span className="font-bold">Phone:</span> +92 300 2662701 </div>
              <div><span className="font-bold">Address:</span> Suit 402, 4th Floor, Block 10 Gulshan-e-Iqbal, Nipa, Main, Main University Rd, Block 10 Gulshan-e-Iqbal, Karachi, 75300, Pakistan</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// --- Creative Doodle Background Component ---
function BackDesign({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-full">
      {/* Doodle SVGs or styled divs */}
      <svg className="absolute -top-10 -left-10 w-48 h-48 opacity-30 z-0 animate-spin-slow" viewBox="0 0 200 200" fill="none">
        <circle cx="100" cy="100" r="80" stroke="#3B82F6" strokeWidth="8" strokeDasharray="12 12" />
      </svg>
      <svg className="absolute top-1/2 -right-8 w-40 h-40 opacity-20 z-0 animate-pulse" viewBox="0 0 160 160" fill="none">
        <rect x="20" y="20" width="120" height="120" rx="40" stroke="#0EA5E9" strokeWidth="6" strokeDasharray="10 8" />
      </svg>
      <svg className="absolute bottom-0 left-1/3 w-32 h-32 opacity-25 z-0 animate-bounce-slow" viewBox="0 0 120 120" fill="none">
        <path d="M10,60 Q60,10 110,60 Q60,110 10,60 Z" stroke="#6366F1" strokeWidth="5" fill="none" strokeDasharray="8 6" />
      </svg>
      <div className="relative z-10">{children}</div>
    </div>
  );
}