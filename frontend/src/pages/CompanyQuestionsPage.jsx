import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  ChevronRight, 
  CheckCircle2,
  Circle,
  LayoutGrid,
  BarChart3,
  Target,
  ArrowLeft,
  Building2,
  ExternalLink,
  Code2
} from 'lucide-react';
import { googleInterviewCategories, getGoogleInterviewStats, getGoogleProblemById } from '../data/googleQuestions';
import { amazonInterviewCategories, getAmazonInterviewStats, getAmazonProblemById } from '../data/amazonQuestions';
import { metaInterviewCategories, getMetaInterviewStats, getMetaProblemById } from '../data/metaQuestions';
import { appleInterviewCategories, getAppleInterviewStats, getAppleProblemById } from '../data/appleQuestions';
import { netflixInterviewCategories, getNetflixInterviewStats, getNetflixProblemById } from '../data/netflixQuestions';
import { microsoftInterviewCategories, getMicrosoftInterviewStats, getMicrosoftProblemById } from '../data/microsoftQuestions';
import SheetProblemModal from '../components/features/sheets/SheetProblemModal';

// Company configuration
const COMPANY_CONFIG = {
  google: {
    name: 'Google',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg',
    description: 'Master the 280+ most frequently asked questions in Google SDE interviews',
    color: 'from-blue-500 to-cyan-500',
    logoBg: 'bg-white',
    categories: googleInterviewCategories,
    getStats: getGoogleInterviewStats,
    getProblemById: getGoogleProblemById
  },
  amazon: {
    name: 'Amazon',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
    description: 'Master the 260+ most frequently asked questions in Amazon SDE interviews',
    color: 'from-orange-500 to-yellow-500',
    logoBg: 'bg-white',
    categories: amazonInterviewCategories,
    getStats: getAmazonInterviewStats,
    getProblemById: getAmazonProblemById
  },
  meta: {
    name: 'Meta',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/a/ab/Meta-Logo.png',
    description: 'Master the 270+ most frequently asked questions in Meta SDE interviews',
    color: 'from-blue-600 to-indigo-600',
    logoBg: 'bg-white',
    categories: metaInterviewCategories,
    getStats: getMetaInterviewStats,
    getProblemById: getMetaProblemById
  },
  apple: {
    name: 'Apple',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg',
    description: 'Master the 280+ most frequently asked questions in Apple SDE interviews',
    color: 'from-gray-500 to-gray-700',
    logoBg: 'bg-white',
    categories: appleInterviewCategories,
    getStats: getAppleInterviewStats,
    getProblemById: getAppleProblemById
  },
  netflix: {
    name: 'Netflix',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg',
    description: 'Master the 260+ most frequently asked questions in Netflix SDE interviews',
    color: 'from-red-600 to-red-800',
    logoBg: 'bg-dark-950',
    categories: netflixInterviewCategories,
    getStats: getNetflixInterviewStats,
    getProblemById: getNetflixProblemById
  },
  microsoft: {
    name: 'Microsoft',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg',
    description: 'Master the 250+ most frequently asked questions in Microsoft SDE interviews',
    color: 'from-blue-700 to-green-500',
    logoBg: 'bg-white',
    categories: microsoftInterviewCategories,
    getStats: getMicrosoftInterviewStats,
    getProblemById: getMicrosoftProblemById
  }
};

function CompanyQuestionsPage() {
  const { companyName } = useParams();
  const navigate = useNavigate();
  
  const companyKey = companyName?.toLowerCase();
  const company = COMPANY_CONFIG[companyKey];

  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [sortMode, setSortMode] = useState('category');
  const [solvedProblems, setSolvedProblems] = useState(() => {
    const saved = localStorage.getItem(`${companyKey}-solved`);
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  useEffect(() => {
    if (company) {
      localStorage.setItem(`${companyKey}-solved`, JSON.stringify([...solvedProblems]));
    }
  }, [solvedProblems, companyKey, company]);

  // Redirect if company not found
  if (!company) {
    return (
      <div className="p-8 max-w-7xl mx-auto text-center">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-white mb-4">Company Not Found</h1>
          <p className="text-dark-400">The requested company interview questions are not available yet.</p>
        </div>
        <button
          onClick={() => navigate('/practice/companies')}
          className="px-6 py-3 bg-brand-orange text-white rounded-xl font-bold hover:bg-brand-orange/90 transition-colors"
        >
          Go Back to Company Prep
        </button>
      </div>
    );
  }

  const stats = company.getStats();
  const categories = company.categories;

  const toggleCategory = (categoryId) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'Medium': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'Hard': return 'text-red-400 bg-red-400/10 border-red-400/20';
      default: return 'text-dark-400 bg-dark-400/10 border-dark-400/20';
    }
  };

  const toggleSolved = (problemId, e) => {
    e?.stopPropagation();
    const newSolved = new Set(solvedProblems);
    if (newSolved.has(problemId)) {
      newSolved.delete(problemId);
    } else {
      newSolved.add(problemId);
    }
    setSolvedProblems(newSolved);
  };

  const progress = Math.round((solvedProblems.size / stats.total) * 100);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        {/* Back Navigation */}
        <button
          onClick={() => navigate('/practice/companies')}
          className="flex items-center gap-2 text-dark-400 hover:text-white transition-colors mb-6 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to Company Prep</span>
        </button>

        <div className="flex items-center gap-4 mb-4">
          <div className={`w-16 h-16 rounded-2xl ${company.logoBg ? company.logoBg : `bg-gradient-to-br ${company.color}`} flex items-center justify-center shadow-lg overflow-hidden p-3`}>
            <img src={company.logo} alt={company.name} className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">{company.name} Interview Questions</h1>
            <p className="text-dark-400">{company.description}</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-dark-900/50 border border-dark-800 rounded-xl p-4">
            <div className="text-2xl font-black text-white">{stats.total}</div>
            <div className="text-xs text-dark-500 uppercase tracking-wider">Total Problems</div>
          </div>
          <div className="bg-dark-900/50 border border-dark-800 rounded-xl p-4">
            <div className="text-2xl font-black text-green-400">{stats.easy}</div>
            <div className="text-xs text-dark-500 uppercase tracking-wider">Easy</div>
          </div>
          <div className="bg-dark-900/50 border border-dark-800 rounded-xl p-4">
            <div className="text-2xl font-black text-yellow-400">{stats.medium}</div>
            <div className="text-xs text-dark-500 uppercase tracking-wider">Medium</div>
          </div>
          <div className="bg-dark-900/50 border border-dark-800 rounded-xl p-4">
            <div className="text-2xl font-black text-red-400">{stats.hard}</div>
            <div className="text-xs text-dark-500 uppercase tracking-wider">Hard</div>
          </div>
          <div className="bg-dark-900/50 border border-dark-800 rounded-xl p-4">
            <div className="text-2xl font-black text-blue-400">{stats.categories}</div>
            <div className="text-xs text-dark-500 uppercase tracking-wider">Categories</div>
          </div>
          <div className="bg-dark-900/50 border border-dark-800 rounded-xl p-4">
            <div className="text-2xl font-black text-brand-orange">{progress}%</div>
            <div className="text-xs text-dark-500 uppercase tracking-wider">Progress</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-dark-900/50 border border-dark-800 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-dark-300">Your Progress</span>
            <span className="text-sm font-black text-brand-orange">{solvedProblems.size} / {stats.total} ({progress}%)</span>
          </div>
          <div className="h-3 bg-dark-800 rounded-full overflow-hidden">
            <div 
              className={`h-full bg-gradient-to-r ${company.color} rounded-full transition-all duration-500`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-sm text-dark-400 font-medium">Sort by:</span>
          <div className="flex bg-dark-900/50 border border-dark-800 rounded-lg p-1">
            <button
              onClick={() => setSortMode('category')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all ${
                sortMode === 'category' 
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                  : 'text-dark-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              Categories
            </button>
            <button
              onClick={() => setSortMode('difficulty')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all ${
                sortMode === 'difficulty' 
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                  : 'text-dark-400 hover:text-white'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Difficulty
            </button>
          </div>
        </div>
      </div>

      {/* Content - Category or Difficulty View */}
      {sortMode === 'category' ? (
        /* Categories Accordion */
        <div className="space-y-3">
          {categories.map((category) => {
            const isExpanded = expandedCategories.has(category.id);
            const solvedInCategory = category.problems.filter(p => solvedProblems.has(p.id)).length;
            const categoryProgress = Math.round((solvedInCategory / category.problems.length) * 100);

            return (
              <div 
                key={category.id} 
                className="bg-dark-900/50 border border-dark-800 rounded-xl overflow-hidden"
              >
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-dark-800/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`transform transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`}>
                      <ChevronRight className="w-5 h-5 text-dark-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{category.name}</h3>
                      <p className="text-sm text-dark-500">{category.problems.length} problems</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-sm font-bold text-dark-400">{solvedInCategory}/{category.problems.length}</span>
                    </div>
                    <div className="w-24 h-2 bg-dark-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-500"
                        style={{ width: `${categoryProgress}%` }}
                      />
                    </div>
                  </div>
                </button>

                {/* Problems List */}
                {isExpanded && (
                  <div className="border-t border-dark-800/50">
                    {category.problems.map((problem) => {
                      const isSolved = solvedProblems.has(problem.id);
                      
                      return (
                        <div
                          key={problem.id}
                          onClick={() => setSelectedProblem({ ...problem, category: category.name })}
                          className={`px-6 py-3 flex items-center justify-between cursor-pointer transition-colors border-b border-dark-800/30 last:border-b-0 hover:bg-dark-800/40 ${
                            isSolved ? 'bg-green-500/5' : ''
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <span className="text-sm font-mono text-dark-600 w-12">{problem.id}</span>
                            <button
                              onClick={(e) => toggleSolved(problem.id, e)}
                              className="p-1 rounded-full hover:bg-dark-800 transition-colors"
                            >
                              {isSolved ? (
                                <CheckCircle2 className="w-5 h-5 text-green-400" />
                              ) : (
                                <Circle className="w-5 h-5 text-dark-600 hover:text-dark-400" />
                              )}
                            </button>
                            <span className={`font-medium ${isSolved ? 'text-dark-400 line-through' : 'text-white'}`}>
                              {problem.title}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 text-xs font-bold rounded-full border ${getDifficultyColor(problem.difficulty)}`}>
                              {problem.difficulty}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Difficulty View */
        <DifficultyView 
          categories={categories}
          solvedProblems={solvedProblems}
          toggleSolved={toggleSolved}
          setSelectedProblem={setSelectedProblem}
          getDifficultyColor={getDifficultyColor}
        />
      )}

      {/* Problem Modal */}
      {selectedProblem && (
        <SheetProblemModal
          problem={selectedProblem}
          onClose={() => setSelectedProblem(null)}
          isSolved={solvedProblems.has(selectedProblem.id)}
          onToggleSolved={() => toggleSolved(selectedProblem.id)}
        />
      )}
    </div>
  );
}

// Difficulty View Component
function DifficultyView({ categories, solvedProblems, toggleSolved, setSelectedProblem, getDifficultyColor }) {
  // Flatten all problems with their category info
  const allProblems = categories.flatMap(category => 
    category.problems.map(problem => ({
      ...problem,
      categoryName: category.name
    }))
  );

  // Group by difficulty
  const problemsByDifficulty = {
    Easy: allProblems.filter(p => p.difficulty === 'Easy'),
    Medium: allProblems.filter(p => p.difficulty === 'Medium'),
    Hard: allProblems.filter(p => p.difficulty === 'Hard')
  };

  const difficultyOrder = ['Easy', 'Medium', 'Hard'];
  const difficultyBgColors = {
    Easy: 'bg-green-500/10 border-green-500/20',
    Medium: 'bg-yellow-500/10 border-yellow-500/20',
    Hard: 'bg-red-500/10 border-red-500/20'
  };

  return (
    <div className="space-y-4">
      {difficultyOrder.map(difficulty => {
        const problems = problemsByDifficulty[difficulty];
        const solvedCount = problems.filter(p => solvedProblems.has(p.id)).length;
        const progress = Math.round((solvedCount / problems.length) * 100);

        return (
          <div 
            key={difficulty}
            className={`rounded-xl overflow-hidden border ${difficultyBgColors[difficulty]}`}
          >
            {/* Difficulty Header */}
            <div className="px-6 py-4 flex items-center justify-between bg-dark-900/50">
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 text-sm font-bold rounded-full border ${getDifficultyColor(difficulty)}`}>
                  {difficulty}
                </span>
                <span className="text-dark-400 text-sm">{problems.length} problems</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-bold text-dark-400">{solvedCount}/{problems.length}</span>
                <div className="w-24 h-2 bg-dark-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      difficulty === 'Easy' ? 'bg-green-500' : 
                      difficulty === 'Medium' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Problems List */}
            <div className="divide-y divide-dark-800/30">
              {problems.map((problem) => {
                const isSolved = solvedProblems.has(problem.id);
                
                return (
                  <div
                    key={problem.id}
                    onClick={() => setSelectedProblem({ ...problem, category: problem.categoryName })}
                    className={`px-6 py-3 flex items-center justify-between cursor-pointer transition-colors hover:bg-dark-800/40 ${
                      isSolved ? 'bg-green-500/5' : ''
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-mono text-dark-600 w-12">{problem.id}</span>
                      <button
                        onClick={(e) => toggleSolved(problem.id, e)}
                        className="p-1 rounded-full hover:bg-dark-800 transition-colors"
                      >
                        {isSolved ? (
                          <CheckCircle2 className="w-5 h-5 text-green-400" />
                        ) : (
                          <Circle className="w-5 h-5 text-dark-600 hover:text-dark-400" />
                        )}
                      </button>
                      <span className={`font-medium ${isSolved ? 'text-dark-400 line-through' : 'text-white'}`}>
                        {problem.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-dark-500">{problem.categoryName}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default CompanyQuestionsPage;
