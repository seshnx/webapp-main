import React, { useState } from 'react';
import { Search } from 'lucide-react';

/**
 * School data interface
 */
interface SchoolData {
    id: string;
    name: string;
    city: string;
    state: string;
}

/**
 * Props for StudentEnrollment component
 */
export interface StudentEnrollmentProps {
    user?: any;
    onComplete?: () => void;
    onSkip?: () => void;
}

/**
 * StudentEnrollment - Student enrollment flow for linking to schools
 * TODO: Migrate to Neon database
 */
export default function StudentEnrollment({ user, onComplete, onSkip }: StudentEnrollmentProps) {
    const [schoolSearchTerm, setSchoolSearchTerm] = useState<string>('');
    const [searchResults, setSearchResults] = useState<SchoolData[]>([]);
    const [selectedSchool, setSelectedSchool] = useState<SchoolData | null>(null);
    const [studentEnrollmentId, setStudentEnrollmentId] = useState<string>('');
    const [enrollmentError, setEnrollmentError] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const searchSchools = async (term: string) => {
        if (term.length < 3) {
            setSearchResults([]);
            return;
        }

        // TODO: Implement Neon query for schools table
        console.warn('StudentEnrollment: Neon database integration not yet implemented');
        setSearchResults([]);
    };

    const handleEnrollment = async () => {
        if (!selectedSchool || !studentEnrollmentId) {
            setEnrollmentError("Please select a school and enter your ID.");
            return;
        }
        setEnrollmentError('');
        setIsLoading(true);

        // TODO: Implement Neon enrollment
        console.warn('Student enrollment not yet implemented with Neon database');
        console.log('Enrollment data:', { school: selectedSchool.id, studentId: studentEnrollmentId });

        // Placeholder for future implementation
        setTimeout(() => {
            setIsLoading(false);
            alert("Student enrollment temporarily disabled during migration.");
            onComplete?.();
        }, 1000);
    };

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold dark:text-white">Student Enrollment</h2>
            <p className="text-gray-500">Search for your school and enter your student ID to link your account.</p>

            <div className="relative">
                <input
                    type="text"
                    placeholder="Search for your school..."
                    value={schoolSearchTerm}
                    onChange={(e) => {
                        setSchoolSearchTerm(e.target.value);
                        searchSchools(e.target.value);
                    }}
                    className="w-full pl-10 p-2 border rounded-lg dark:bg-black/20 dark:border-gray-600 dark:text-white"
                />
                <Search className="absolute left-3 top-3 text-gray-400" size={16} />
            </div>

            {schoolSearchTerm.length > 0 && searchResults.length > 0 && (
                <div className="border rounded-lg max-h-40 overflow-y-auto dark:border-gray-700 bg-white dark:bg-gray-800">
                    {searchResults.map(school => (
                        <div
                            key={school.id}
                            className={`p-3 cursor-pointer hover:bg-indigo-50 dark:hover:bg-gray-700/50 ${selectedSchool?.id === school.id ? 'bg-indigo-100 dark:bg-indigo-900/50' : ''}`}
                            onClick={() => {
                                setSelectedSchool(school);
                                setSchoolSearchTerm(school.name);
                                setSearchResults([]);
                            }}
                        >
                            <div className="font-medium dark:text-white">{school.name}</div>
                            <div className="text-xs text-gray-500">{school.city}, {school.state}</div>
                        </div>
                    ))}
                </div>
            )}

            {selectedSchool && (
                <div className="space-y-4 pt-4 animate-in fade-in slide-in-from-top-2">
                    <p className="text-sm font-bold dark:text-white">Selected: <span className="text-indigo-600">{selectedSchool.name}</span></p>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Student ID Number</label>
                        <input
                            type="text"
                            value={studentEnrollmentId}
                            onChange={(e) => setStudentEnrollmentId(e.target.value)}
                            className="w-full p-2 border rounded-lg mt-1 dark:bg-black/20 dark:border-gray-600 dark:text-white"
                            placeholder="e.g., SESH00123"
                        />
                    </div>

                    {enrollmentError && <p className="text-red-500 text-sm">{enrollmentError}</p>}

                    <button
                        onClick={handleEnrollment}
                        disabled={isLoading || !studentEnrollmentId}
                        className="w-full bg-indigo-600 text-white p-2 rounded-lg font-bold hover:bg-indigo-700 transition disabled:opacity-50"
                    >
                        {isLoading ? 'Verifying...' : 'Link Student Account'}
                    </button>
                </div>
            )}

            <button onClick={onSkip} className="w-full text-sm text-gray-500 hover:text-indigo-600 mt-2">
                Skip enrollment for now
            </button>
        </div>
    );
}
