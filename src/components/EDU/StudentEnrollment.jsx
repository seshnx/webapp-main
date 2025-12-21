import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { supabase } from '../../config/supabase';

export default function StudentEnrollment({ user, onComplete, onSkip }) {
    const [schoolSearchTerm, setSchoolSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedSchool, setSelectedSchool] = useState(null);
    const [studentEnrollmentId, setStudentEnrollmentId] = useState('');
    const [enrollmentError, setEnrollmentError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const searchSchools = async (term) => {
        if (term.length < 3 || !supabase) {
            setSearchResults([]);
            return;
        }
        try {
            const { data: schoolsData, error } = await supabase
                .from('schools')
                .select('id, name, city, state')
                .ilike('name', `%${term}%`)
                .limit(10);
            
            if (error) throw error;
            
            setSearchResults(schoolsData || []);
        } catch (error) {
            console.error('Error searching schools:', error);
            setSearchResults([]);
        }
    };

    const handleEnrollment = async () => {
        if (!selectedSchool || !studentEnrollmentId || !supabase) {
            if (!selectedSchool || !studentEnrollmentId) {
                setEnrollmentError("Please select a school and enter your ID.");
            }
            return;
        }
        setEnrollmentError('');
        setIsLoading(true);

        try {
            const userId = user?.id || user?.uid;
            const currentAccountTypes = user?.accountTypes || user?.account_types || ['user'];
            const updatedAccountTypes = currentAccountTypes.includes('student') 
                ? currentAccountTypes 
                : [...currentAccountTypes, 'student'];
            
            // Update user profile
            const { error } = await supabase
                .from('profiles')
                .update({
                    school_id: selectedSchool.id,
                    student_id: studentEnrollmentId,
                    account_types: updatedAccountTypes
                })
                .eq('id', userId);
            
            if (error) throw error;
            
            onComplete(); 
        } catch (e) {
            console.error("Enrollment error:", e);
            setEnrollmentError("Enrollment failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
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
