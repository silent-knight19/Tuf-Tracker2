import { ArrowRight } from 'lucide-react';

function PracticeModeCard({ title, subtitle, icon: Icon, color, count, onClick }) {
  const colorStyles = {
    orange: 'border-orange-500/30 hover:border-orange-500/50 hover:bg-orange-500/5',
    blue: 'border-blue-500/30 hover:border-blue-500/50 hover:bg-blue-500/5',
    purple: 'border-purple-500/30 hover:border-purple-500/50 hover:bg-purple-500/5',
    green: 'border-green-500/30 hover:border-green-500/50 hover:bg-green-500/5'
  };

  const iconColorStyles = {
    orange: 'text-orange-400 bg-orange-500/10',
    blue: 'text-blue-400 bg-blue-500/10',
    purple: 'text-purple-400 bg-purple-500/10',
    green: 'text-green-400 bg-green-500/10'
  };

  const style = colorStyles[color] || colorStyles.blue;
  const iconStyle = iconColorStyles[color] || iconColorStyles.blue;

  return (
    <button 
      onClick={onClick}
      className={`w-full text-left p-4 rounded-lg border bg-dark-900 ${style} transition-all group`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg ${iconStyle} flex items-center justify-center`}>
          <Icon className="w-5 h-5" />
        </div>
        <ArrowRight className={`w-4 h-4 ${iconStyle.split(' ')[0]} opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all`} />
      </div>
      
      <h3 className="text-base font-bold text-white mb-1">{title}</h3>
      <p className="text-xs text-dark-400 mb-2">{subtitle}</p>
      
      <span className="text-xs font-medium text-dark-500">
        {count} ready
      </span>
    </button>
  );
}

export default PracticeModeCard;
