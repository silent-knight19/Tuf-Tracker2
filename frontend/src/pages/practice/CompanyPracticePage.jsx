import React, { useState, useMemo } from 'react';
import { Building, Zap, Search, Globe, Shield, Users, Rocket, ChevronRight, Building2, Play, Smartphone, Laptop, Database, Layout } from 'lucide-react';
import { useProblemStore } from '../../stores/problemStore';
import SearchableSelect from '../../components/ui/SearchableSelect';
import MotivationalQuote from '../../components/ui/MotivationalQuote';
import api from '../../utils/api';
import { auth } from '../../config/firebase';
import { DSA_PATTERNS, DSA_TOPICS } from '../../utils/dsaConstants';

const TOP_COMPANIES = [
  { name: 'Google', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg', domain: 'Search & AI', bg: 'bg-white' },
  { name: 'Amazon', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg', domain: 'E-commerce', bg: 'bg-white' },
  { name: 'Meta', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/ab/Meta-Logo.png', domain: 'Social Media', bg: 'bg-white' },
  { name: 'Apple', logo: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg', domain: 'Hardware', bg: 'bg-white' },
  { name: 'Microsoft', logo: 'https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg', domain: 'Enterprise', bg: 'bg-white' },
  { name: 'Netflix', logo: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg', domain: 'Streaming', bg: 'bg-dark-950' }
];

const COMPANY_LOGOS = {
  'adobe': 'https://upload.wikimedia.org/wikipedia/commons/8/8d/Adobe_Corporate_Logo.png',
  'airbnb': 'https://upload.wikimedia.org/wikipedia/commons/6/69/Airbnb_Logo_Bélo.svg',
  'uber': 'https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png',
  'linkedin': 'https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png',
  'salesforce': 'https://upload.wikimedia.org/wikipedia/commons/f/f9/Salesforce.com_logo.svg',
  'oracle': 'https://upload.wikimedia.org/wikipedia/commons/5/50/Oracle_logo.svg',
  'twitter': 'https://upload.wikimedia.org/wikipedia/commons/6/6f/Logo_of_Twitter.svg',
  'x': 'https://upload.wikimedia.org/wikipedia/commons/c/ce/X_logo_2023.svg',
  'tesla': 'https://upload.wikimedia.org/wikipedia/commons/e/e8/Tesla_logo.png',
  'spacex': 'https://upload.wikimedia.org/wikipedia/commons/2/2e/SpaceX_logo_black.svg',
  'palantir': 'https://upload.wikimedia.org/wikipedia/commons/1/13/Palantir_Technologies_logo.svg',
  'intel': 'https://upload.wikimedia.org/wikipedia/commons/7/7d/Intel_logo_%282006-2020%29.svg',
  'cisco': 'https://upload.wikimedia.org/wikipedia/commons/0/08/Cisco_logo_blue_2016.svg',
  'tiktok': 'https://upload.wikimedia.org/wikipedia/en/a/a9/TikTok_logo.svg',
  'stripe': 'https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg',
  'spotify': 'https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg',
  'snapchat': 'https://upload.wikimedia.org/wikipedia/en/c/c4/Snapchat_logo.svg',
  'samsung': 'https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg',
  'ibm': 'https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg',
  'nvidia': 'https://upload.wikimedia.org/wikipedia/commons/2/21/Nvidia_logo.svg',
  'bytedance': 'https://upload.wikimedia.org/wikipedia/commons/f/f6/ByteDance_logo.svg',
  'bloomberg': 'https://upload.wikimedia.org/wikipedia/commons/5/53/Bloomberg_LP_logo.svg',
  'dropbox': 'https://upload.wikimedia.org/wikipedia/commons/7/78/Dropbox_Icon.svg',
  'pinterest': 'https://upload.wikimedia.org/wikipedia/commons/0/08/Pinterest-logo.png'
};

function CompanyPracticePage() {
  const { problems } = useProblemStore();
  
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedPattern, setSelectedPattern] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('Medium');
  const [practiceLoading, setPracticeLoading] = useState(false);

  // Extract all companies user has added/interacted with
  const userCompanies = useMemo(() => {
    const companies = problems.flatMap(p => {
      if (Array.isArray(p.companies)) return p.companies;
      if (p.company) return [p.company];
      return [];
    });
    return [...new Set(companies)].sort();
  }, [problems]);

  const uniquePatterns = useMemo(() => [...new Set([
    ...DSA_PATTERNS,
    ...problems.flatMap(p => p.patterns || [])
  ])].sort(), [problems]);

  const uniqueTopics = useMemo(() => [...new Set([
    ...DSA_TOPICS,
    ...problems.flatMap(p => p.topics || [])
  ])].sort(), [problems]);

  const getCompanyLogo = (companyName) => {
    const lowerName = companyName.toLowerCase().replace(/\s+/g, '');
    
    // 1. Check verified manual list first
    if (COMPANY_LOGOS[lowerName]) return COMPANY_LOGOS[lowerName];
    
    // 2. Check TOP_COMPANIES list for matches
    const topMatch = TOP_COMPANIES.find(c => c.name.toLowerCase() === companyName.toLowerCase());
    if (topMatch) return topMatch.logo;

    // 3. Fallback to Clearbit dynamically
    return `https://logo.clearbit.com/${lowerName}.com`;
  };

  const handleCompanyPractice = async (overrideCompany = null) => {
    const company = overrideCompany || selectedCompany;
    if (!company) {
      alert('Please enter or select a target company');
      return;
    }

    const localId = Date.now().toString();
    const newTab = window.open(`/interview/ai?localId=${localId}`, '_blank');

    try {
      setPracticeLoading(true);
      const token = await auth.currentUser.getIdToken();

      const aiResponse = await api.post('/ai/company-problem', {
        company: company,
        topic: selectedTopic || undefined,
        pattern: selectedPattern || undefined,
        difficulty: selectedDifficulty
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      localStorage.setItem(`ai_problem_${localId}`, JSON.stringify(aiResponse.data));
    } catch (error) {
      console.error('Failed to generate company problem:', error);
      if (newTab) newTab.close();
      alert('Failed to generate problem. Please try again.');
    } finally {
      setPracticeLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* LeetCode-inspired Header */}
      <div className="border-b border-gray-800">
        <div className="max-w-[1440px] mx-auto px-8 py-6">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-green-600/10 rounded-lg">
              <Building className="w-6 h-6 text-green-500" />
            </div>
            <h1 className="text-2xl font-semibold text-white">Company Prep</h1>
          </div>
          
          <p className="mt-3 text-sm text-gray-400 max-w-2xl">
            Target specific companies with AI-crafted interview scenarios.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1440px] mx-auto px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          {/* Custom Configuration Section */}
          <div className="lg:col-span-2">
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-800">
                <div className="flex items-center gap-3">
                  <Layout className="w-5 h-5 text-green-500" />
                  <div>
                    <h3 className="text-base font-semibold text-white">Custom Target Builder</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Fine-tune your next AI-generated interview challenge.</p>
                  </div>
                </div>
              </div>

              <div className="px-6 py-5 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                      TARGET COMPANY
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <Search className="w-4 h-4 text-gray-500" />
                      </div>
                      <input
                        type="text"
                        value={selectedCompany}
                        onChange={(e) => setSelectedCompany(e.target.value)}
                        placeholder="Enter company name (e.g. Uber, Stripe)"
                        className="w-full bg-black border border-gray-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:border-green-500 focus:outline-none transition-all placeholder-gray-600"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                      INTERVIEW DIFFICULTY
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {['Easy', 'Medium', 'Hard'].map(diff => (
                        <button
                          key={diff}
                          onClick={() => setSelectedDifficulty(diff)}
                          className={`py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                            selectedDifficulty === diff
                              ? diff === 'Easy' 
                                ? 'bg-green-600/20 text-green-500 border border-green-600/50'
                                : diff === 'Medium' 
                                ? 'bg-yellow-600/20 text-yellow-500 border border-yellow-600/50'
                                : 'bg-red-600/20 text-red-500 border border-red-600/50'
                              : 'bg-transparent text-gray-500 border border-gray-800 hover:border-gray-700 hover:text-gray-300'
                          }`}
                        >
                          {diff}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                      FOCUS TOPIC (OPTIONAL)
                    </label>
                    <SearchableSelect
                      options={uniqueTopics}
                      value={selectedTopic}
                      onChange={setSelectedTopic}
                      placeholder="All Topics"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                      PATTERN FOCUS (OPTIONAL)
                    </label>
                    <SearchableSelect
                      options={uniquePatterns}
                      value={selectedPattern}
                      onChange={setSelectedPattern}
                      placeholder="All Patterns"
                    />
                  </div>
                </div>

                <button
                  onClick={() => handleCompanyPractice()}
                  disabled={practiceLoading || !selectedCompany}
                  className={`w-full py-3.5 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                    practiceLoading || !selectedCompany
                      ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700 active:bg-green-800'
                  }`}
                >
                  {practiceLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-gray-600 border-t-white rounded-full animate-spin" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5" />
                      <span>Start Career Mode</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Pro Tips Sidebar */}
          <div className="space-y-6">
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-800">
                <h3 className="text-base font-semibold text-white">Career Pro Tips</h3>
              </div>
              <div className="p-5 space-y-5">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-600/10 flex-shrink-0 flex items-center justify-center">
                    <Globe className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-1">SYSTEM DESIGN BLEND</h4>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Companies like Google often blend algorithmic depth with practical system constraints.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-lg bg-orange-600/10 flex-shrink-0 flex items-center justify-center">
                    <Rocket className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-1">LEADERSHIP PRINCIPLES</h4>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Amazon interviews focus heavily on how you apply their principles to solve customer-facing edge cases.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-600/10 flex-shrink-0 flex items-center justify-center">
                    <Building className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-1">REAL SCENARIOS</h4>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Our AI models the problem description specifically to the business domain of your target.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-8">\n
        {/* Popular Companies Grid (Stay below) */}
        <div className="lg:col-span-12 order-3">
          <h3 className="text-xs font-bold text-dark-500 uppercase tracking-widest mb-6">Popular Targets</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
            {TOP_COMPANIES.map((company) => (
              <button
                key={company.name}
                onClick={() => handleCompanyPractice(company.name)}
                className="group p-6 bg-dark-900 border border-dark-800 rounded-2xl hover:border-green-500/50 hover:bg-green-500/5 transition-all flex flex-col items-center text-center gap-4 relative overflow-hidden active:scale-95"
              >
                <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronRight className="w-4 h-4 text-green-500" />
                </div>
                <div className={`w-16 h-16 rounded-2xl ${company.bg} flex items-center justify-center p-3 transition-all duration-300 group-hover:scale-110`}>
                  <img 
                    src={company.logo} 
                    alt={company.name} 
                    className="w-full h-full object-contain drop-shadow-lg"
                  />
                </div>
                <div>
                  <div className="text-white text-lg font-black leading-tight">{company.name}</div>
                  <div className="text-[10px] text-dark-500 font-bold uppercase tracking-widest mt-1">{company.domain}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* User's Companies Section (Stay below) */}
        {userCompanies.length > 0 && (
          <div className="lg:col-span-12 mb-8 order-4">
            <h3 className="text-xs font-bold text-dark-500 uppercase tracking-widest mb-6">Your Previous Targets</h3>
            <div className="flex flex-wrap gap-3">
              {userCompanies.map((company) => (
                <button
                  key={company}
                  onClick={() => handleCompanyPractice(company)}
                  className="px-6 py-3 bg-dark-900 border border-dark-800 rounded-xl hover:border-green-500/40 hover:bg-green-500/5 text-dark-200 hover:text-white transition-all font-bold flex items-center gap-3 group active:scale-95"
                >
                  <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center group-hover:bg-green-500/20 transition-colors overflow-hidden p-1.5 flex-shrink-0">
                    <img 
                       src={getCompanyLogo(company)}
                      alt={company}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://ui-avatars.com/api/?name=${company}&background=111&color=fff&size=32`;
                      }}
                    />
                  </div>
                  {company}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CompanyPracticePage;
