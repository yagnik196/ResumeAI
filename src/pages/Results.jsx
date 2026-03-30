import { ArrowLeft, User, Mail, Lightbulb, Briefcase } from 'lucide-react';
import ResultCard from '../components/ResultCard';
import SkillBadge from '../components/SkillBadge';

export default function Results({ result, onReset }) {
  if (!result) return null;

  const {
    name,
    email,
    skills_found = [],
    missing_skills = [],
    skill_match = 0,
    ats_score = 0,
    suggestions = [],
    selectedRole = 'General Role'
  } = result;

  const getMatchType = (score) => {
    if (score >= 80) return 'success';
    if (score >= 50) return 'warning';
    return 'danger';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-[fadeIn_0.5s_ease-out]">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold text-gray-900">Analysis Results</h2>
          <p className="text-gray-500 font-medium">Detailed report on your resume's performance</p>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Analyze another
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ResultCard
          title="Role Match"
          value={skill_match}
          suffix="%"
          type={getMatchType(skill_match)}
        />
        <ResultCard
          title="ATS Score"
          value={ats_score}
          suffix="/ 100"
          type={getMatchType(ats_score)}
        />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-4">Target Information</h3>
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium lowercase tracking-wide">Target Role</p>
            <p className="text-xl font-bold text-gray-900 italic">{selectedRole}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-4">Skills Analysis</h3>
        
        <div className="space-y-6">
          <div>
            <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Skills Found ({skills_found.length})
            </h4>
            {skills_found.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {skills_found.map((skill, idx) => (
                  <SkillBadge key={idx} skill={skill} type="found" />
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">No matching skills found.</p>
            )}
          </div>

          <div>
            <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              Missing Skills ({missing_skills.length})
            </h4>
            {missing_skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {missing_skills.map((skill, idx) => (
                  <SkillBadge key={idx} skill={skill} type="missing" />
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">Great job! No major skills missing.</p>
            )}
          </div>
        </div>
      </div>

      {suggestions && suggestions.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-4 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            Suggestions for Improvement
          </h3>
          <ul className="space-y-2">
            {suggestions.map((suggestion, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-indigo-50 text-indigo-600 text-sm font-bold mt-0.5">
                  {idx + 1}
                </span>
                <p className="text-gray-700">{suggestion}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}