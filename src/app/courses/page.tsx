'use client';
import React, { useState } from 'react';
import { BookOpen, Download, Users, Award, ChevronDown, ChevronUp, ExternalLink, GraduationCap } from 'lucide-react';

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
    description: 'Cambridge Assessment International Education',
    icon: '🎓',
    totalSubjects: 31,
    fields: [
      // IGCSE – Science
      { name: 'IGCSE - Science', icon: '🔬', subjects: [
          { name: 'Biology', code: '0610', syllabus: 'https://www.cambridgeinternational.org/programmes-and-qualifications/cambridge-igcse-biology-0610/' },
          { name: 'Chemistry', code: '0620', syllabus: 'https://www.cambridgeinternational.org/programmes-and-qualifications/cambridge-igcse-chemistry-0620/' },
          { name: 'Physics', code: '0625', syllabus: 'https://www.cambridgeinternational.org/programmes-and-qualifications/cambridge-igcse-physics-0625/' },
          { name: 'Mathematics', code: '0580', syllabus: 'https://www.cambridgeinternational.org/programmes-and-qualifications/cambridge-igcse-mathematics-0580/' },
      ]},
      // IGCSE – Commerce
      { name: 'IGCSE - Commerce', icon: '💼', subjects: [
          { name: 'Economics', code: '0455', syllabus: 'https://www.cambridgeinternational.org/programmes-and-qualifications/cambridge-igcse-economics-0455/' },
          { name: 'Business Studies', code: '0450', syllabus: 'https://www.cambridgeinternational.org/programmes-and-qualifications/cambridge-igcse-business-studies-0450/' },
          { name: 'Accounting', code: '0452', syllabus: 'https://www.cambridgeinternational.org/programmes-and-qualifications/cambridge-igcse-accounting-0452/' },
      ]},
      // IGCSE – Humanities
      { name: 'IGCSE - Humanities', icon: '📚', subjects: [
          { name: 'English Language', code: '0500', syllabus: 'https://www.cambridgeinternational.org/programmes-and-qualifications/cambridge-igcse-english-language-0500/' },
          { name: 'History', code: '0470', syllabus: 'https://www.cambridgeinternational.org/programmes-and-qualifications/cambridge-igcse-history-0470/' },
          { name: 'Geography', code: '0460', syllabus: 'https://www.cambridgeinternational.org/programmes-and-qualifications/cambridge-igcse-geography-0460/' },
          { name: 'Literature', code: '0486', syllabus: 'https://www.cambridgeinternational.org/programmes-and-qualifications/cambridge-igcse-literature-in-english-0486/' },
      ]},
      // IGCSE – Compulsory
      { name: 'IGCSE - Compulsory', icon: '✅', subjects: [
          { name: 'Urdu', code: '3247', syllabus: 'https://www.cambridgeinternational.org/programmes-and-qualifications/cambridge-igcse-urdu-as-a-first-language-3247/' },
          { name: 'Islamiat', code: '0493', syllabus: 'https://www.cambridgeinternational.org/programmes-and-qualifications/cambridge-igcse-islamiyat-0493/' },
          { name: 'Pakistan Studies', code: '2059', syllabus: 'https://www.cambridgeinternational.org/programmes-and-qualifications/cambridge-igcse-pakistan-studies-2059/' },
      ]},
      // O Level – Science
      { name: 'O Level - Science', icon: '🔬', subjects: [
          { name: 'Biology', code: '5090', syllabus: 'https://www.cambridgeinternational.org/programmes-and-qualifications/cambridge-o-level-biology-5090/' },
          { name: 'Chemistry', code: '5070', syllabus: 'https://www.cambridgeinternational.org/programmes-and-qualifications/cambridge-o-level-chemistry-5070/' },
          { name: 'Physics', code: '5054', syllabus: 'https://www.cambridgeinternational.org/programmes-and-qualifications/cambridge-o-level-physics-5054/' },
          { name: 'Mathematics', code: '4024', syllabus: 'https://www.cambridgeinternational.org/programmes-and-qualifications/cambridge-o-level-mathematics-4024/' },
          { name: 'Additional Mathematics', code: '4037', syllabus: 'https://www.cambridgeinternational.org/programmes-and-qualifications/cambridge-o-level-additional-mathematics-4037/' },
      ]},
      // O Level – Commerce
      { name: 'O Level - Commerce', icon: '💼', subjects: [
          { name: 'Economics', code: '2281', syllabus: 'https://www.cambridgeinternational.org/programmes-and-qualifications/cambridge-o-level-economics-2281/' },
          { name: 'Business Studies', code: '7115', syllabus: 'https://www.cambridgeinternational.org/programmes-and-qualifications/cambridge-o-level-business-7115/' },
          { name: 'Accounting', code: '7707', syllabus: 'https://www.cambridgeinternational.org/programmes-and-qualifications/cambridge-o-level-accounting-7707/' },
          { name: 'Computer Science', code: '2210', syllabus: 'https://www.cambridgeinternational.org/programmes-and-qualifications/cambridge-o-level-computer-science-2210/' },
      ]},
      // O Level – Humanities
      { name: 'O Level - Humanities', icon: '📚', subjects: [
          { name: 'English Language', code: '1123', syllabus: 'https://www.cambridgeinternational.org/programmes-and-qualifications/cambridge-o-level-english-language-1123/' },
          { name: 'History', code: '2147', syllabus: 'https://www.cambridgeinternational.org/programmes-and-qualifications/cambridge-o-level-history-2147/' },
          { name: 'Geography', code: '2217', syllabus: 'https://www.cambridgeinternational.org/programmes-and-qualifications/cambridge-o-level-geography-2217/' },
          { name: 'Literature', code: '2010', syllabus: 'https://www.cambridgeinternational.org/programmes-and-qualifications/cambridge-o-level-literature-in-english-2010/' },
      ]},
      // O Level – Compulsory
      { name: 'O Level - Compulsory', icon: '✅', subjects: [
          { name: 'Urdu', code: '3248', syllabus: 'https://www.cambridgeinternational.org/programmes-and-qualifications/cambridge-o-level-urdu-first-language-3248/' },
          { name: 'Islamiat', code: '2058', syllabus: 'https://www.cambridgeinternational.org/programmes-and-qualifications/cambridge-o-level-islamiyat-2058/' },
          { name: 'Pakistan Studies', code: '2059', syllabus: 'https://www.cambridgeinternational.org/programmes-and-qualifications/cambridge-o-level-pakistan-studies-2059/' },
      ]},
    ],
  },

  {
    name: 'AKU-EB',
    description: 'Aga Khan University Examination Board',
    icon: '🏛️',
    totalSubjects: 12,
    fields: [
      { name: 'Compulsory', icon: '✅', subjects: [
          { name: 'English', code: '101', syllabus: 'https://examinationboard.aku.edu/learning-materials/Publication/SSC-Compul-English.pdf' },
          { name: 'Urdu', code: '102', syllabus: 'https://examinationboard.aku.edu/learning-materials/Publication/HSSC-Compul-Urdu.pdf' },
          { name: 'Islamiat', code: '103', syllabus: 'https://examinationboard.aku.edu/learning-materials/Publication/HSSC-Compul-Islamiyat-%28U%29.pdf' },
          { name: 'Pakistan Studies', code: '104', syllabus: 'https://examinationboard.aku.edu/learning-materials/Publication/HSSC-Compul-Pak-Std.pdf' },
      ]},
      { name: 'Pre-Medical', icon: '⚕️', subjects: [
          { name: 'Biology', code: '201', syllabus: '/syllabus/aku-eb-biology.pdf' },
          { name: 'Chemistry', code: '202', syllabus: '/syllabus/aku-eb-chemistry.pdf' },
          { name: 'Physics', code: '203', syllabus: '/syllabus/aku-eb-physics.pdf' },
      ]},
      { name: 'Pre-Engineering', icon: '⚙️', subjects: [
          { name: 'Mathematics', code: '204', syllabus: '/syllabus/aku-eb-mathematics.pdf' },
          { name: 'Physics', code: '203', syllabus: '/syllabus/aku-eb-physics.pdf' },
          { name: 'Chemistry', code: '202', syllabus: '/syllabus/aku-eb-chemistry.pdf' },
      ]},
      { name: 'Commerce', icon: '💼', subjects: [
          { name: 'Accounting', code: '205', syllabus: '/syllabus/aku-eb-accounting.pdf' },
          { name: 'Business Math', code: '206', syllabus: '/syllabus/aku-eb-business-math.pdf' },
          { name: 'Economics', code: '207', syllabus: '/syllabus/aku-eb-economics.pdf' },
          { name: 'Principles of Commerce', code: '208', syllabus: '/syllabus/aku-eb-commerce.pdf' },
      ]},
    ],
  },

  {
    name: 'IBDP',
    description: 'International Baccalaureate Diploma Programme',
    icon: '🌎',
    totalSubjects: 30,
    fields: [
      { name: 'IBDP - Group 1', icon: '📖', subjects: [
          { name: 'Language A: Literature', code: 'Lang A Lit', syllabus: 'https://www.ibo.org/programmes/diploma-programme/curriculum/language-and-literature/language-a-literature/' },
          { name: 'Language A: Language and Literature', code: 'Lang A Lang & Lit', syllabus: 'https://www.ibo.org/programmes/diploma-programme/curriculum/language-and-literature/language-a-language-and-literature/' },
          { name: 'Literature and Performance', code: 'Lit & Perf', syllabus: 'https://www.ibo.org/programmes/diploma-programme/curriculum/language-and-literature/literature-and-performance/' },
      ]},
      { name: 'IBDP - Group 2', icon: '🗣️', subjects: [
          { name: 'Language B', code: 'Lang B', syllabus: 'https://www.ibo.org/programmes/diploma-programme/curriculum/language-acquisition/language-b/' },
          { name: 'Language ab initio', code: 'ab initio', syllabus: 'https://www.ibo.org/programmes/diploma-programme/curriculum/language-acquisition/language-ab-initio/' },
      ]},
      { name: 'IBDP - Group 3', icon: '🏛️', subjects: [
          { name: 'Economics', code: 'ECO', syllabus: 'https://www.ibo.org/programmes/diploma-programme/curriculum/individuals-and-societies/economics/' },
          { name: 'Geography', code: 'GEO', syllabus: 'https://www.ibo.org/programmes/diploma-programme/curriculum/individuals-and-societies/geography/' },
          { name: 'Psychology', code: 'PSY', syllabus: 'https://www.ibo.org/programmes/diploma-programme/curriculum/individuals-and-societies/psychology/' },
          { name: 'Social and Cultural Anthropology', code: 'ANTH', syllabus: 'https://www.ibo.org/programmes/diploma-programme/curriculum/individuals-and-societies/social-and-cultural-anthropology/' },
      ]},
      { name: 'IBDP - Group 4', icon: '🔬', subjects: [
          { name: 'Biology', code: 'BIO', syllabus: 'https://www.ibo.org/programmes/diploma-programme/curriculum/sciences/' },
          { name: 'Chemistry', code: 'CHEM', syllabus: 'https://www.ibo.org/programmes/diploma-programme/curriculum/sciences/' },
          { name: 'Physics', code: 'PHYS', syllabus: 'https://www.ibo.org/programmes/diploma-programme/curriculum/sciences/' },
          { name: 'Computer Science', code: 'CS', syllabus: 'https://www.ibo.org/programmes/diploma-programme/curriculum/sciences/' },
          { name: 'Environmental Systems and Societies', code: 'ESS', syllabus: 'https://www.ibo.org/programmes/diploma-programme/curriculum/sciences/environmental-systems-and-societies/' },
      ]},
      { name: 'IBDP - Group 5', icon: '🧮', subjects: [
          { name: 'Mathematics: Analysis and Approaches', code: 'Math AA', syllabus: 'https://www.ibo.org/programmes/diploma-programme/curriculum/mathematics/' },
          { name: 'Mathematics: Applications and Interpretation', code: 'Math AI', syllabus: 'https://www.ibo.org/programmes/diploma-programme/curriculum/mathematics/' },
      ]},
      { name: 'IBDP - Group 6', icon: '🎨', subjects: [
          { name: 'Visual Arts', code: 'VA', syllabus: 'https://www.ibo.org/programmes/diploma-programme/curriculum/the-arts/' },
          { name: 'Music', code: 'MUS', syllabus: 'https://www.ibo.org/programmes/diploma-programme/curriculum/the-arts/' },
          { name: 'Theatre', code: 'THEA', syllabus: 'https://www.ibo.org/programmes/diploma-programme/curriculum/the-arts/' },
          { name: 'Film', code: 'FILM', syllabus: 'https://www.ibo.org/programmes/diploma-programme/curriculum/the-arts/' },
          { name: 'Dance', code: 'DANCE', syllabus: 'https://www.ibo.org/programmes/diploma-programme/curriculum/the-arts/' },
      ]},
    ],
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

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>): void => {
    const target = e.currentTarget;
    target.style.backgroundColor = '#FFFFFF';
    target.style.color = '#1A245D';
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>): void => {
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
          <p className="text-xl md:text-2xl max-w-4xl mx-auto leading-relaxed mb-12 transition-colors duration-300 ease-in-out animate-fade-in-up animation-delay-200" style={{ color: '#BFD5FF' }}>
            Comprehensive educational excellence across international and national examination boards
          </p>
          <div className="flex flex-wrap justify-center gap-8 text-sm font-medium animate-fade-in-up animation-delay-300">
            <div className="flex items-center gap-3 px-6 py-3 rounded-full border border-white/20 backdrop-blur-sm transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
              <Users size={20} className="text-white transition-transform duration-300 ease-in-out" />
              <span className="text-white">Expert Faculty</span>
            </div>
            <div className="flex items-center gap-3 px-6 py-3 rounded-full border border-white/20 backdrop-blur-sm transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
              <Award size={20} className="text-white transition-transform duration-300 ease-in-out" />
              <span className="text-white">Proven Excellence</span>
            </div>
            <div className="flex items-center gap-3 px-6 py-3 rounded-full border border-white/20 backdrop-blur-sm transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
              <BookOpen size={20} className="text-white transition-transform duration-300 ease-in-out" />
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
              <button
                className="px-10 py-4 rounded-xl font-semibold text-lg transition-all duration-300 ease-in-out hover:shadow-lg hover:scale-105 transform"
                style={{ backgroundColor: '#FFFFFF', color: '#1A245D' }}
              >
                Enroll Today
              </button>
              <button
                className="px-10 py-4 rounded-xl font-semibold text-lg border-2 border-white text-white transition-all duration-300 ease-in-out hover:bg-white transform hover:scale-105 hover:shadow-lg"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                Contact Us
              </button>
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