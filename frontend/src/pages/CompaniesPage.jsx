import { useEffect, useState, useRef } from 'react';
import { useCompanyStore } from '../stores/companyStore';
import { Search, Building2, X, ArrowRight, Trophy, Target, BookOpen } from 'lucide-react';
import CircularProgress from '../components/features/CircularProgress';

import { useNavigate } from 'react-router-dom';

function CompaniesPage() {
  const navigate = useNavigate();
  const { companies, fetchCompanies, getCompanyReadiness, readinessData, loading } = useCompanyStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Ref for click timer
  const clickTimer = useRef(null);

  useEffect(() => {
    fetchCompanies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCompanyClick = (companyName) => {
    if (clickTimer.current) {
      clearTimeout(clickTimer.current);
      clickTimer.current = null;
    }

    clickTimer.current = setTimeout(() => {
      navigate(`/companies/${companyName}`);
      clickTimer.current = null;
    }, 250);
  };

  const handleCompanyDoubleClick = async (e, companyName) => {
    e.stopPropagation();
    
    // Clear the single click timer to prevent navigation
    if (clickTimer.current) {
      clearTimeout(clickTimer.current);
      clickTimer.current = null;
    }
    
    setSelectedCompany(companyName);
    await getCompanyReadiness(companyName);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCompany(null);
  };

  const filteredCompanies = companies.filter(company => 
    company.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading && !companies.length) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-orange"></div>
      </div>
    );
  }

  return (
    <div className="p-6 h-full overflow-y-auto no-scrollbar relative">
      {/* Header & Search */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-dark-100 mb-2">Company Readiness</h1>
        <p className="text-dark-400 mb-6">Track your preparation level for top tech companies</p>
        
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
          <input
            type="text"
            placeholder="Search companies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-dark-900 border border-dark-800 rounded-lg pl-10 pr-4 py-2.5 text-dark-100 focus:ring-2 focus:ring-brand-orange focus:border-transparent outline-none transition-all"
          />
        </div>
      </div>

      {/* Companies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredCompanies.map((company) => (
          <div
            key={company.name}
            onClick={() => handleCompanyClick(company.name)}
            onDoubleClick={(e) => handleCompanyDoubleClick(e, company.name)}
            className="group bg-dark-900 border border-dark-800 rounded-xl p-5 cursor-pointer hover:border-brand-orange/50 hover:shadow-lg hover:shadow-brand-orange/5 transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-dark-800 flex items-center justify-center group-hover:bg-brand-orange/10 transition-colors overflow-hidden">
                <img 
                  src={`https://logo.clearbit.com/${company.name.toLowerCase().replace(/\s+/g, '')}.com`}
                  alt={`${company.name} logo`}
                  className="w-8 h-8 object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
                <Building2 className="w-6 h-6 text-dark-400 group-hover:text-brand-orange transition-colors hidden" />
              </div>
              <span className={`badge ${
                company.difficulty === 'Hard' ? 'badge-hard' :
                company.difficulty === 'Medium' ? 'badge-medium' :
                'badge-easy'
              }`}>
                {company.difficulty}
              </span>
            </div>
            
            <h3 className="text-lg font-bold text-dark-100 mb-1 group-hover:text-brand-orange transition-colors">
              {company.name}
            </h3>
            <div className="text-sm text-dark-400 flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              {company.totalProblems} problems
            </div>
          </div>
        ))}
      </div>

      {/* Readiness Modal */}
      {isModalOpen && readinessData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-dark-950 border border-dark-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto no-scrollbar shadow-2xl animate-in fade-in zoom-in duration-200">
            
            {/* Modal Header */}
            <div className="sticky top-0 bg-dark-950/95 backdrop-blur border-b border-dark-800 p-6 flex items-center justify-between z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-brand-orange/10 flex items-center justify-center overflow-hidden">
                  <img 
                    src={`https://logo.clearbit.com/${readinessData.company.toLowerCase().replace(/\s+/g, '')}.com`}
                    alt={`${readinessData.company} logo`}
                    className="w-8 h-8 object-contain"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'block';
                    }}
                  />
                  <Building2 className="w-6 h-6 text-brand-orange hidden" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{readinessData.company}</h2>
                  <p className="text-dark-400 text-sm">Readiness Assessment</p>
                </div>
              </div>
              <button 
                onClick={closeModal}
                className="p-2 hover:bg-dark-800 rounded-lg text-dark-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Score & Stats */}
              <div className="space-y-6">
                {/* Readiness Score */}
                <div className="bg-dark-900 rounded-xl p-6 border border-dark-800 flex flex-col items-center text-center">
                  <h3 className="text-sm font-medium text-dark-400 uppercase tracking-wider mb-6">Readiness Score</h3>
                  <CircularProgress 
                    size={180} 
                    strokeWidth={12} 
                    percentage={readinessData.readinessScore} 
                    color={
                      readinessData.readinessScore >= 80 ? "text-green-500" :
                      readinessData.readinessScore >= 50 ? "text-brand-orange" :
                      "text-red-500"
                    }
                  >
                    <div className="text-center">
                      <div className="text-4xl font-bold text-white">{readinessData.readinessScore}%</div>
                      <div className="text-xs text-dark-400 mt-1">Prepared</div>
                    </div>
                  </CircularProgress>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-dark-900 rounded-xl p-4 border border-dark-800">
                    <div className="flex items-center gap-2 mb-2 text-brand-orange">
                      <Target className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase">Coverage</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{readinessData.coveragePercent}%</div>
                    <div className="text-xs text-dark-400">of total problems</div>
                  </div>
                  <div className="bg-dark-900 rounded-xl p-4 border border-dark-800">
                    <div className="flex items-center gap-2 mb-2 text-blue-500">
                      <Trophy className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase">Solved</span>
                    </div>
                    <div className="text-2xl font-bold text-white">
                      {readinessData.solvedCount}<span className="text-dark-500 text-base font-normal">/{readinessData.totalProblems}</span>
                    </div>
                    <div className="text-xs text-dark-400">problems completed</div>
                  </div>
                </div>
              </div>

              {/* Right Column: Details */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Difficulty Distribution */}
                <div className="bg-dark-900 rounded-xl p-6 border border-dark-800">
                  <h3 className="text-sm font-medium text-dark-400 uppercase tracking-wider mb-4">Difficulty Breakdown</h3>
                  <div className="space-y-4">
                    {/* Easy */}
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-dark-300">Easy</span>
                        <span className="text-white font-medium">{readinessData.difficultyDistribution.Easy}</span>
                      </div>
                      <div className="h-2 bg-dark-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-difficulty-easy rounded-full" 
                          style={{ width: `${(readinessData.difficultyDistribution.Easy / (readinessData.totalProblems || 1)) * 100}%` }}
                        />
                      </div>
                    </div>
                    {/* Medium */}
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-dark-300">Medium</span>
                        <span className="text-white font-medium">{readinessData.difficultyDistribution.Medium}</span>
                      </div>
                      <div className="h-2 bg-dark-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-difficulty-medium rounded-full" 
                          style={{ width: `${(readinessData.difficultyDistribution.Medium / (readinessData.totalProblems || 1)) * 100}%` }}
                        />
                      </div>
                    </div>
                    {/* Hard */}
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-dark-300">Hard</span>
                        <span className="text-white font-medium">{readinessData.difficultyDistribution.Hard}</span>
                      </div>
                      <div className="h-2 bg-dark-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-difficulty-hard rounded-full" 
                          style={{ width: `${(readinessData.difficultyDistribution.Hard / (readinessData.totalProblems || 1)) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recommendations */}
                <div className="bg-dark-900 rounded-xl p-6 border border-dark-800">
                  <h3 className="text-sm font-medium text-dark-400 uppercase tracking-wider mb-4">Recommended Actions</h3>
                  <div className="space-y-3">
                    {readinessData.recommendations.map((rec, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-dark-800/50 border border-dark-800">
                        <div className="mt-0.5 min-w-[20px]">
                          <ArrowRight className="w-5 h-5 text-brand-orange" />
                        </div>
                        <p className="text-sm text-dark-200 leading-relaxed">{rec}</p>
                      </div>
                    ))}
                    {readinessData.recommendations.length === 0 && (
                      <p className="text-dark-400 italic">No specific recommendations at this time. Keep practicing!</p>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CompaniesPage;
