'use client';
import React, { useState } from 'react';
import { BookOpen, Download, Users, Award, ChevronDown, ChevronUp, ExternalLink, GraduationCap } from 'lucide-react';
import Link from 'next/link';

interface Subject {
  name: string;
  code: string;
  syllabus: string;
}

interface Field {
  name: string;
  icon: string;
  subjects: Subject[];
}

interface Board {
  name: string;
  description: string;
  icon: string;
  totalSubjects: number;
  fields: Field[];
}

const boards: Board[] = [
  {
    name: 'CAIE',
    description: 'Cambridge International A Level (Minimum 3 subjects required)',
    icon: '🎓',
    totalSubjects: 12,
    fields: [
      {
        name: 'Science', icon: '🔬', subjects: [
          { name: 'Biology', code: '9700', syllabus: 'https://www.cambridgeinternational.org/programmes-and-qualifications/cambridge-international-as-and-a-level-biology-9700/' },
          { name: 'Chemistry', code: '9701', syllabus: 'https://www.cambridgeinternational.org/programmes-and-qualifications/cambridge-international-as-and-a-level-chemistry-9701/' },
          { name: 'Physics', code: '9702', syllabus: 'https://www.cambridgeinternational.org/programmes-and-qualifications/cambridge-international-as-and-a-level-physics-9702/' },
          { name: 'Mathematics', code: '9709', syllabus: 'https://www.cambridgeinternational.org/programmes-and-qualifications/cambridge-international-as-and-a-level-mathematics-9709/' },
        ]
      },
      {
        name: 'Commerce', icon: '💼', subjects: [
          { name: 'Economics', code: '9708', syllabus: 'https://www.cambridgeinternational.org/programmes-and-qualifications/cambridge-international-as-and-a-level-economics-9708/' },
          { name: 'Accounting', code: '9706', syllabus: 'https://www.cambridgeinternational.org/programmes-and-qualifications/cambridge-international-as-and-a-level-accounting-9706/' },
          { name: 'Business', code: '9609', syllabus: 'https://www.cambridgeinternational.org/programmes-and-qualifications/cambridge-international-as-and-a-level-business-9609/' },
        ]
      },
      {
        name: 'Humanities', icon: '📚', subjects: [
          { name: 'Psychology', code: '9990', syllabus: 'https://www.cambridgeinternational.org/programmes-and-qualifications/cambridge-international-as-and-a-level-psychology-9990/' },
          { name: 'Sociology', code: '9699', syllabus: 'https://www.cambridgeinternational.org/programmes-and-qualifications/cambridge-international-as-and-a-level-sociology-9699/' },
        ]
      },
    ]
  },

  {
    name: 'Inter Board Karachi',
    description: 'Board of Intermediate Education Karachi',
    icon: '🏛️',
    totalSubjects: 16,
    fields: [
      {
        name: 'Compulsory', icon: '✅', subjects: [
          { name: 'English', code: 'IBK-C1', syllabus: '/syllabus/biek-english.pdf' },
          { name: 'Urdu', code: 'IBK-C2', syllabus: '/syllabus/biek-urdu.pdf' },
          { name: 'Islamiat', code: 'IBK-C3', syllabus: '/syllabus/biek-islamiat.pdf' },
          { name: 'Pakistan Studies', code: 'IBK-C4', syllabus: '/syllabus/biek-pakistan-studies.pdf' },
        ]
      },
      {
        name: 'Pre-Medical', icon: '⚕️', subjects: [
          { name: 'Biology', code: 'PM101', syllabus: '/syllabus/biek-biology.pdf' },
          { name: 'Chemistry', code: 'PM102', syllabus: '/syllabus/biek-chemistry.pdf' },
          { name: 'Physics', code: 'PM103', syllabus: '/syllabus/biek-physics.pdf' },
        ]
      },
      {
        name: 'Pre-Engineering', icon: '⚙️', subjects: [
          { name: 'Mathematics', code: 'PE101', syllabus: '/syllabus/biek-math.pdf' },
          { name: 'Physics', code: 'PE102', syllabus: '/syllabus/biek-physics.pdf' },
          { name: 'Chemistry', code: 'PE103', syllabus: '/syllabus/biek-chemistry.pdf' },
        ]
      },
      {
        name: 'Commerce', icon: '💼', subjects: [
          { name: 'Principles of Accounting', code: 'C101', syllabus: '/syllabus/biek-accounting.pdf' },
          { name: 'Business Math', code: 'C102', syllabus: '/syllabus/biek-business-math.pdf' },
          { name: 'Principles of Commerce', code: 'C103', syllabus: '/syllabus/biek-commerce.pdf' },
          { name: 'Economics', code: 'C104', syllabus: '/syllabus/biek-economics.pdf' },
        ]
      }
    ]
  },

  {
    name: 'AKU-EB',
    description: 'Aga Khan University Examination Board (HSSC)',
    icon: '🏛️',
    totalSubjects: 16,
    fields: [
      {
        name: 'Compulsory', icon: '✅', subjects: [
          { name: 'English', code: '101', syllabus: 'https://examinationboard.aku.edu/learning-materials/Publication/SSC-Compul-English.pdf' },
          { name: 'Urdu', code: '102', syllabus: 'https://examinationboard.aku.edu/learning-materials/Publication/HSSC-Compul-Urdu.pdf' },
          { name: 'Islamiat', code: '103', syllabus: 'https://examinationboard.aku.edu/learning-materials/Publication/HSSC-Compul-Islamiyat-%28U%29.pdf' },
          { name: 'Pakistan Studies', code: '104', syllabus: 'https://examinationboard.aku.edu/learning-materials/Publication/HSSC-Compul-Pak-Std.pdf' },
        ]
      },
      {
        name: 'Pre-Medical', icon: '⚕️', subjects: [
          { name: 'Biology', code: '201', syllabus: '/syllabus/aku-eb-biology.pdf' },
          { name: 'Chemistry', code: '202', syllabus: '/syllabus/aku-eb-chemistry.pdf' },
          { name: 'Physics', code: '203', syllabus: '/syllabus/aku-eb-physics.pdf' },
        ]
      },
      {
        name: 'Pre-Engineering', icon: '⚙️', subjects: [
          { name: 'Mathematics', code: '204', syllabus: '/syllabus/aku-eb-mathematics.pdf' },
          { name: 'Physics', code: '203', syllabus: '/syllabus/aku-eb-physics.pdf' },
          { name: 'Chemistry', code: '202', syllabus: '/syllabus/aku-eb-chemistry.pdf' },
        ]
      },
      {
        name: 'Commerce', icon: '💼', subjects: [
          { name: 'Accounting', code: '205', syllabus: '/syllabus/aku-eb-accounting.pdf' },
          { name: 'Business Math', code: '206', syllabus: '/syllabus/aku-eb-business-math.pdf' },
          { name: 'Economics', code: '207', syllabus: '/syllabus/aku-eb-economics.pdf' },
          { name: 'Principles of Commerce', code: '208', syllabus: '/syllabus/aku-eb-commerce.pdf' },
        ]
      }
    ]
  },

  {
    name: 'IBDP',
    description: 'International Baccalaureate Diploma Programme',
    icon: '🌎',
    totalSubjects: 18,
    fields: [
      {
        name: 'Group 4 - Sciences', icon: '🔬', subjects: [
          { name: 'Biology', code: 'BIO', syllabus: 'https://www.ibo.org/programmes/diploma-programme/curriculum/sciences/' },
          { name: 'Chemistry', code: 'CHEM', syllabus: 'https://www.ibo.org/programmes/diploma-programme/curriculum/sciences/' },
          { name: 'Physics', code: 'PHYS', syllabus: 'https://www.ibo.org/programmes/diploma-programme/curriculum/sciences/' },
          { name: 'Computer Science', code: 'CS', syllabus: 'https://www.ibo.org/programmes/diploma-programme/curriculum/sciences/' },
        ]
      },
      {
        name: 'Group 3 - Individuals & Societies', icon: '🏛️', subjects: [
          { name: 'Economics', code: 'ECO', syllabus: 'https://www.ibo.org/programmes/diploma-programme/curriculum/individuals-and-societies/economics/' },
          { name: 'Business Management', code: 'BUS', syllabus: 'https://www.ibo.org/programmes/diploma-programme/curriculum/individuals-and-societies/business-management/' },
        ]
      },
      {
        name: 'Group 5 - Mathematics', icon: '🧮', subjects: [
          { name: 'Mathematics: Analysis and Approaches', code: 'Math AA', syllabus: 'https://www.ibo.org/programmes/diploma-programme/curriculum/mathematics/' },
          { name: 'Mathematics: Applications and Interpretation', code: 'Math AI', syllabus: 'https://www.ibo.org/programmes/diploma-programme/curriculum/mathematics/' },
        ]
      }
    ]
  },
];

interface ExpandedBoards {
  [key: string]: boolean;
}

interface ExpandedFields {
  [key: string]: boolean; // Key format: "BoardName-FieldName"
}

const CoursesPage: React.FC = () => {
  const [expandedBoards, setExpandedBoards] = useState<ExpandedBoards>({});
  const [expandedFields, setExpandedFields] = useState<ExpandedFields>({});

  const toggleBoard = (boardName: string): void => {
    setExpandedBoards(prev => ({
      ...prev,
      [boardName]: !prev[boardName]
    }));
  };

  const toggleField = (boardName: string, fieldName: string): void => {
    const key = `${boardName}-${fieldName}`;
    setExpandedFields(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLElement>): void => {
    const target = e.currentTarget;
    target.style.backgroundColor = '#FFFFFF';
    target.style.color = '#1A245D';
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLElement>): void => {
    const target = e.currentTarget;
    target.style.backgroundColor = 'transparent';
    target.style.color = '#FFFFFF';
  };

  return (
    <div className="min-h-screen transition-colors duration-500 ease-in-out" style={{ backgroundColor: '#DDE3EA' }}>
      {/* Hero Section */}
      <div className="relative overflow-hidden transition-colors duration-500 ease-in-out" style={{ backgroundColor: '#2E3A87' }}>
        <div className="absolute inset-0 opacity-10 transition-opacity duration-500 ease-in-out">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-white/10"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-6 py-20 text-center">
          <div className="flex justify-center mb-8 animate-fade-in-up">
            <div className="p-6 rounded-full border-2 border-white/20 backdrop-blur-sm transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-xl" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
              <GraduationCap size={56} className="text-white transition-transform duration-300 ease-in-out" />
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white leading-tight animate-fade-in-up animation-delay-100">
            Academic Programs
          </h1>
          <p className="text-xl md:text-2xl max-w-4xl mx-auto leading-relaxed mb-12 transition-colors duration-300 ease-in-out" style={{ color: '#BFD5FF' }}>
            Comprehensive educational excellence across international and national examination boards
          </p>
          <div className="flex flex-wrap justify-center gap-8 text-sm font-medium">
            <div className="flex items-center gap-3 px-6 py-3 rounded-full border border-white/20 backdrop-blur-sm" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
              <Users size={20} className="text-white" />
              <span className="text-white">Expert Faculty</span>
            </div>
            <div className="flex items-center gap-3 px-6 py-3 rounded-full border border-white/20 backdrop-blur-sm" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
              <Award size={20} className="text-white" />
              <span className="text-white">Proven Excellence</span>
            </div>
            <div className="flex items-center gap-3 px-6 py-3 rounded-full border border-white/20 backdrop-blur-sm" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
              <BookOpen size={20} className="text-white" />
              <span className="text-white">Updated Curriculum</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid gap-8">
          {boards.map((board) => (
            <div
              key={board.name}
              className="bg-white rounded-2xl shadow-lg overflow-hidden border-l-8 transform transition-all duration-500 ease-in-out hover:shadow-xl"
              style={{ borderLeftColor: '#2E3A87' }}
            >
              {/* Board Header */}
              <div
                className="p-8 cursor-pointer transition-all duration-300 ease-in-out hover:opacity-90"
                style={{ backgroundColor: '#2E3A87' }}
                onClick={() => toggleBoard(board.name)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="text-5xl transition-transform duration-300 ease-in-out hover:scale-110">{board.icon}</div>
                    <div>
                      <h2 className="text-3xl font-bold text-white mb-2 transition-all duration-300 ease-in-out">{board.name}</h2>
                      <p className="text-lg transition-colors duration-300 ease-in-out" style={{ color: '#BFD5FF' }}>{board.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-white">
                    <div className="text-center px-6 py-3 rounded-xl border border-white/20 transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-md" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                      <div className="text-2xl font-bold">{board.totalSubjects}</div>
                      <div className="text-sm transition-colors duration-300 ease-in-out" style={{ color: '#BFD5FF' }}>Subjects</div>
                    </div>
                    <div className="transition-transform duration-300 ease-in-out">
                      {expandedBoards[board.name] ? <ChevronUp size={32} /> : <ChevronDown size={32} />}
                    </div>
                  </div>
                </div>
              </div>

              {/* Board Content - Animated Expansion */}
              <div
                className={`overflow-hidden transition-all duration-500 ease-in-out ${expandedBoards[board.name] ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'
                  }`}
              >
                {expandedBoards[board.name] && (
                  <div className="p-8 animate-fade-in" style={{ backgroundColor: '#DDE3EA' }}>
                    {/* Fields Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {board.fields.map((field) => {
                        const fieldKey = `${board.name}-${field.name}`;
                        const isFieldExpanded = expandedFields[fieldKey];

                        return (
                          <div key={field.name} className="flex flex-col gap-0 transition-all duration-300 ease-in-out"> {/* Ensure no gap between header and content */}
                            {/* Field Header */}
                            <div
                              className={`bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 ease-in-out hover:shadow-lg cursor-pointer ${isFieldExpanded ? 'rounded-b-none ring-4 ring-blue-300 ring-opacity-50' : ''
                                }`}
                              onClick={() => toggleField(board.name, field.name)}
                            >
                              <div
                                className="p-6 transition-all duration-300 ease-in-out"
                                style={{
                                  backgroundColor: isFieldExpanded ? '#BFD5FF' : '#FFFFFF',
                                  borderBottom: isFieldExpanded ? '1px solid #DDE3EA' : 'none'
                                }}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-4">
                                    <div className="text-3xl transition-transform duration-300 ease-in-out hover:scale-110">{field.icon}</div>
                                    <div>
                                      <h3 className="text-xl font-bold transition-colors duration-300 ease-in-out" style={{ color: '#282828' }}>{field.name}</h3>
                                      <p className="text-sm transition-colors duration-300 ease-in-out" style={{ color: '#1A245D' }}>{field.subjects.length} subjects</p>
                                    </div>
                                  </div>
                                  <div className="transition-transform duration-300 ease-in-out" style={{ color: '#1A245D' }}>
                                    {isFieldExpanded ?
                                      <ChevronUp size={24} className="transition-transform duration-300 ease-in-out" /> :
                                      <ChevronDown size={24} className="transition-transform duration-300 ease-in-out" />
                                    }
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Field Subjects (shown directly below the header) - Animated Expansion */}
                            <div
                              className={`overflow-hidden transition-all duration-500 ease-in-out ${isFieldExpanded ? 'max-h-[3000px] opacity-100 mt-0' : 'max-h-0 opacity-0 -mt-1'
                                }`}
                            >
                              {isFieldExpanded && (
                                <div className="bg-white rounded-b-xl shadow-md animate-fade-in"> {/* -mt-1 to remove tiny gap */}
                                  <div className="p-6">
                                    <div className="grid grid-cols-1 gap-4">
                                      {field.subjects.map((subject) => (
                                        <div
                                          key={`${subject.code}-${subject.name}`}
                                          className="group flex items-center justify-between p-4 rounded-xl transition-all duration-300 ease-in-out hover:shadow-md transform hover:-translate-y-0.5"
                                          style={{ backgroundColor: '#DDE3EA' }}
                                        >
                                          <div className="flex items-center gap-4">
                                            <div
                                              className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold shadow-md transition-all duration-300 ease-in-out group-hover:scale-105"
                                              style={{ backgroundColor: '#1A245D' }}
                                            >
                                              <span className="text-sm">{subject.code}</span>
                                            </div>
                                            <div>
                                              <h4 className="font-semibold text-lg transition-colors duration-300 ease-in-out" style={{ color: '#282828' }}>
                                                {subject.name}
                                              </h4>
                                              <p className="text-sm transition-colors duration-300 ease-in-out" style={{ color: '#1A245D' }}>Code: {subject.code}</p>
                                            </div>
                                          </div>
                                          <a
                                            href={subject.syllabus}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-3 px-6 py-3 rounded-lg font-medium transition-all duration-300 ease-in-out hover:shadow-lg hover:scale-105 text-white transform hover:-translate-y-0.5"
                                            style={{ backgroundColor: '#2E3A87' }}
                                            onClick={(e) => e.stopPropagation()}
                                          >
                                            <Download size={18} className="transition-transform duration-300 ease-in-out" />
                                            <span className="hidden sm:inline">Syllabus</span>
                                            <ExternalLink size={16} className="transition-transform duration-300 ease-in-out" />
                                          </a>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-20 rounded-2xl p-12 text-center text-white shadow-xl transition-all duration-500 ease-in-out hover:shadow-2xl" style={{ backgroundColor: '#1A245D' }}>
          <div className="max-w-4xl mx-auto">
            <h3 className="text-4xl font-bold mb-6 transition-all duration-300 ease-in-out">Begin Your Academic Journey</h3>
            <p className="text-xl mb-10 leading-relaxed transition-colors duration-300 ease-in-out" style={{ color: '#BFD5FF' }}>
              Join our community of successful students and unlock your potential with our comprehensive educational programs
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link
                href="/enroll"
                className="px-10 py-4 rounded-xl font-semibold text-lg transition-all duration-300 ease-in-out hover:shadow-lg hover:scale-105 transform inline-block"
                style={{ backgroundColor: '#FFFFFF', color: '#1A245D' }}
              >
                Enroll Today
              </Link>
              <Link
                href="/#contact"
                className="px-10 py-4 rounded-xl font-semibold text-lg border-2 border-white text-white transition-all duration-300 ease-in-out hover:bg-white transform hover:scale-105 hover:shadow-lg inline-block"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Add animation keyframes for fade-in-up if not using a library */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out forwards;
        }
        .animation-delay-100 {
          animation-delay: 0.1s;
        }
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
        .animation-delay-300 {
          animation-delay: 0.3s;
        }
      `}</style>
    </div>
  );
};

export default CoursesPage;