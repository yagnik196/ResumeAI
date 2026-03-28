export default function ResultCard({ title, value, type = 'default', suffix = '' }) {
  const getColors = () => {
    switch(type) {
      case 'success': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      case 'warning': return 'text-amber-600 bg-amber-50 border-amber-100';
      case 'danger': return 'text-red-600 bg-red-50 border-red-100';
      default: return 'text-indigo-600 bg-indigo-50 border-indigo-100';
    }
  };

  return (
    <div className={`p-6 rounded-2xl border ${getColors()} flex flex-col justify-center items-center text-center shadow-sm relative overflow-hidden`}>
      <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-2 z-10">{title}</h4>
      <div className="flex items-baseline gap-1 z-10">
        <span className="text-4xl font-extrabold">{value}</span>
        {suffix && <span className="text-xl font-bold opacity-70">{suffix}</span>}
      </div>
    </div>
  );
}
